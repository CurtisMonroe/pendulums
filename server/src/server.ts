import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { parse } from 'ts-command-line-args';
import { getPendulumLocationAtGivenTime } from "./simulation";
import mqtt from "mqtt";
import { setTimeout } from "timers/promises";

interface IArguments{
  port: number;
  instance: number;
}

enum SimulationStatus {
  stopped = 'Stopped',
  running = 'Running',
  paused = 'Paused',
  halted = 'Halted',
  restarting = 'Restarting'
}

interface Pendulum {
  xAnchor: number;
  yAnchor: number;
  xInitial: number;
  yInitial: number;
  x: number;
  y: number;
  radius: number;
  seconds: number;
  status: SimulationStatus;
  haltStartTime: number;
  haltRestartsReceived: number;
  instance: number;
}

export const args = parse<IArguments>({
  port: Number,
  instance: Number
});

const safetyDistance = 10;

dotenv.config();

const app: Express = express();

const port = args.port || process.env.BASE_PORT || 3000;

let pendulum:Pendulum = {
  xAnchor: 0,
  yAnchor: 0,
  xInitial: 0,
  yInitial: 0,
  x: 0,
  y: 0,
  radius: 10,
  seconds: 0,
  status: SimulationStatus.stopped,
  haltStartTime: 0,
  haltRestartsReceived: 0,
  instance: args.instance
} 


let intervalId:NodeJS.Timeout;
let haltWaitIntervalId:NodeJS.Timeout;

function getStatus(status: string) {
  if (status == 'Running') return SimulationStatus.running;
  if (status == 'Halted') return SimulationStatus.halted;
  if (status == 'Paused') return SimulationStatus.paused;
  if (status == 'Restarting') return SimulationStatus.restarting;
  return SimulationStatus.stopped;
}

const millisecondsPerFrame = 100;

function square(n:number): number {
  return n*n;
}

function pendulumDistance(x1:number, y1:number, r1:number, x2:number, y2:number, r2: number): number {
  return Math.sqrt(square(x1-x2) + square(y1-y2))-(r1+r2);
}

const mqttClient = mqtt.connect("mqtt://test.mosquitto.org");
const mqttHaltTopic = 'CurtisM-Pendulum-Halt'

mqttClient.on("connect", () => {
  mqttClient.subscribe(mqttHaltTopic, (err) => {
    if (err) {
      console.log(`ERROR: Fails to subscribe to mqtt topic: "${mqttHaltTopic}"`);
    }
  });
});

mqttClient.on("message", (topic, message) => {
  // message is Buffer
  const msg = message.toString();
  console.log(`Instance ${args.instance}| Received mqtt message:"${msg}"`);
  //mqttClient.end();

  if (msg.startsWith('HALT')) {
    if(pendulum.status === SimulationStatus.halted) {
      return;
    }

    pendulum.status = SimulationStatus.halted;
    pendulum.haltStartTime = pendulum.seconds;
    pendulum.haltRestartsReceived = 0;
  }

  if (msg.startsWith('RESTART')) {
    if(pendulum.status !== SimulationStatus.halted && pendulum.status !== SimulationStatus.restarting) {
      return; // nothing to do, we are not in Halted nor Restarting mode.
    }

    pendulum.haltRestartsReceived++;

    // listen for all 4 restart messages from neighbors
    if(pendulum.haltRestartsReceived >= 4) {
      // restart simulation from initial state
      console.log(`Instance ${args.instance}| Restarting after receiving ${pendulum.haltRestartsReceived} RESTART messages`);
      pendulum.x = pendulum.xInitial;
      pendulum.y = pendulum.yInitial;
      pendulum.seconds = 0;
      pendulum.haltRestartsReceived = 0;
      pendulum.haltStartTime = 0;
      pendulum.status = SimulationStatus.running;
    }
  }

});

function sendHaltBroadcast(instance: number, neighbor: number, distance: number) {
  mqttClient.publish(mqttHaltTopic, `HALT - Pendulums ${instance} and ${neighbor} to close. (distance: ${distance})`);
}

function doSafetyHalt(instance: number, neighbor: number, distance: number) {
  if(pendulum.status === SimulationStatus.halted) {
    return;
  }

  pendulum.status = SimulationStatus.halted;

  console.log(`SAFETY HALT trigged by instance ${instance}. Distance to neighbor ${neighbor} is ${distance}.`);

  // send halt message to other instances including this one
  sendHaltBroadcast(instance, neighbor, distance);
}

function testForCollisions(x: number, y: number, radius: number, instance: number) {
  for(let i = instance+1; i <= 5; i++) {
    fetch(`http://localhost:${5000+i}/pendulum`)
    .then(response => response.json())
    .then((neighbor: Pendulum) => {
      const neighborDistance = pendulumDistance(x, y, radius, neighbor.x, neighbor.y, neighbor.radius);
      if(neighborDistance < safetyDistance) {
        doSafetyHalt(instance, neighbor.instance, neighborDistance);
      }
    })
    .catch(function(error) {
        console.log(error)
    })
  }
}

function doSimulationStep() {
  const currentTime = pendulum.seconds + millisecondsPerFrame/1000;
  if(pendulum.status === SimulationStatus.running) {
    const {x, y} = getPendulumLocationAtGivenTime(
      pendulum.xAnchor,
      pendulum.yAnchor,
      pendulum.xInitial,
      pendulum.yInitial,
      currentTime
    );
    pendulum.x = x;
    pendulum.y = y;
    pendulum.seconds = currentTime;

    //console.log(JSON.stringify(pendulum));
    //console.log(`x:${x} y:${y}`);
  
    testForCollisions(x, y, pendulum.radius, pendulum.instance);
  } else if(pendulum.status === SimulationStatus.halted) {
    if(currentTime - pendulum.haltStartTime > 5) {
      console.log(`Instance ${args.instance}| Sending RESTART event`); 
      mqttClient.publish(mqttHaltTopic, `RESTART - restarting pendulum ${args.instance}`);
      pendulum.status = SimulationStatus.restarting;
    }
    pendulum.seconds = currentTime;
  }



}

app.use(express.json()); 

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send(`Pendulum Instance ${args.instance} Server ...`);
});

app.get("/pendulum", (req: Request, res: Response) => {
  //console.log(`GET /pendulum called - Response:${JSON.stringify(pendulum)}`)
  res.json(pendulum);
});

app.put("/pendulum", (req: Request, res: Response) => {
  console.log(`PUT /pendulum called - Request:${JSON.stringify(req.body)}`);
  const newStatus = getStatus(req.body.status);
  const oldStatus = pendulum.status;
  pendulum = {
    ...pendulum,
    xAnchor: req.body.xAnchor || 0,
    yAnchor: req.body.yAnchor || 0,
    xInitial: req.body.xInitial || 0,
    yInitial: req.body.yInitial || 0,
    radius: req.body.radius || 10,
    status: newStatus
  };

  if(oldStatus != newStatus) {
    if ((newStatus == SimulationStatus.running && oldStatus == SimulationStatus.stopped ) ||
        (newStatus == SimulationStatus.stopped )) {
      pendulum.x = pendulum.xInitial;
      pendulum.y = pendulum.yInitial;
      pendulum.seconds = 0;
    }
    if(newStatus == SimulationStatus.running) {
      intervalId = setInterval(doSimulationStep, millisecondsPerFrame);
    }
    if(newStatus == SimulationStatus.stopped || newStatus == SimulationStatus.paused){
      if(intervalId){
        clearInterval(intervalId);
      }
      pendulum.haltRestartsReceived = 0;
      pendulum.haltStartTime = 0;
    }
  }
  res.json(pendulum);
});

app.listen(port, () => {
  console.log(`[server]: Server instance ${args.instance} is running at http://localhost:${port}`);
});