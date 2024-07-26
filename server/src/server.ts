import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { parse } from 'ts-command-line-args';
import { getPendulumLocationAtGivenTime } from "./simulation";

interface IArguments{
  port: number;
  instance: number;
}

enum SimulationStatus {
  stopped = 'Stopped',
  running = 'Running',
  paused = 'Paused',
  halted = 'Halted'
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
  instance: args.instance
} 


let intervalId:NodeJS.Timeout;

function getStatus(status: string) {
  if (status == 'Running') return SimulationStatus.running;
  if (status == 'Halted') return SimulationStatus.halted;
  if (status == 'Paused') return SimulationStatus.paused;
  return SimulationStatus.stopped;
}

const millisecondsPerFrame = 100;

function square(n:number): number {
  return n*n;
}

function pendulumDistance(x1:number, y1:number, r1:number, x2:number, y2:number, r2: number): number {
  return Math.sqrt(square(x1-x2) + square(y1-y2))-(r1+r2);
}

let isHalted = false;

function doSafetyHalt() {
  if(isHalted) {
    return;
  }

  isHalted = true;
  pendulum.status = SimulationStatus.halted;
  clearInterval(intervalId);

  // send halt message to other instances including this one

  // wait for 5 seconds

  // send a RESTART message to the same channel

  // listen for all 5 restart message

  // restart simulation from initial state
}

function testForCollisions(x: number, y: number, radius: number, instance: number) {
  for(let i = instance+1; i <= 5; i++) {
    fetch(`http://localhost:${5000+i}/pendulum`)
    .then(response => response.json())
    .then((neighbor: Pendulum) => {
      const neighborDistance = pendulumDistance(x, y, radius, neighbor.x, neighbor.y, neighbor.radius);
      if(neighborDistance < safetyDistance) {
        console.log(`SAFETY HALT trigged by instance ${instance}. Distance to neighbor ${neighbor.instance} is ${neighborDistance}.`);
        doSafetyHalt();
      }
    })
    .catch(function(error) {
        console.log(error)
    })
  }
}

function doSimulationStep() {
  const currentTime = pendulum.seconds + millisecondsPerFrame/1000;
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
  console.log(`GET /pendulum called - Response:${JSON.stringify(pendulum)}`)
  console.log(JSON.stringify(pendulum));
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
    if(oldStatus == SimulationStatus.running && intervalId){
      clearInterval(intervalId);
    }
  }
  res.json(pendulum);
});

app.listen(port, () => {
  console.log(`[server]: Server instance ${args.instance} is running at http://localhost:${port}`);
});