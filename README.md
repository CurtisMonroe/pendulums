# pendulums
Simple pendulum simulation

## Take Home Exercise
In node.js, implement a "simple pendulum" in 1 dimension. A REST interface will allow to set up an initial
angular offset, a mass, a string length (or other settings of your choice). It will also allow you to read the
last coordinates, such as to be able to represent the pendulum in a UI, in an external process. The rate of
simulation may be higher than the rate of visualization. Let's run 5 instances of the simple pendulum
node.js process, each on its own tcp port. During configuration, also tell each node who are their
immediate neighbours.
Let's have one UI process, displaying in the web browser the five pendulums. It would allow the user to
configure them (starting angle, mass, length, or anything else you have chosen) in an intuitive way,
conveying an easy-to-use user experience. The UI should expose a canvas where the user could drag and
drop the pendulum in their desired start position. All the resulting parameters of that "configuration"
would be transferred in JSON format to the REST API.

The UI would also expose some simulation controls (start, pause, stop), and would poll periodically the 5
pendulum instances (using a HTTP client) to display them. A refresh rate of a few frames per second is
fine. During the simulation, each pendulum node should watch the position of its immediate neighbours
periodically (via REST). Whenever they come "too close" (threshold is at your discretion), send a STOP
message using a "guaranteed delivery" communication channel like MQTT, to all 5 instances. Upon
reception of STOP, each instance stops moving immediately, and waits for 5 seconds before sending
RESTART on the same channel. Once all 5 instances have received all 5 distinct RESTART messages, all will
restart moving, jumping back to their original position.
Document briefly the resulting REST interface.

## To Run
From the `server` directory run `npm run dev` to start the 5 instances of the pendulum backend servers.


## Plan

### Day 1
1. Setup React client and Node.js server folders and projects
 https://www.youtube.com/watch?v=w3vs4a03y3I&ab_channel=ArpanNeupane
 npx create-react-app my-app --template typescript
 https://create-react-app.dev/docs/adding-typescript/  
 https://blog.logrocket.com/how-to-set-up-node-typescript-express/
 https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program-and-receive-them 
 https://www.npmjs.com/package/ts-command-line-args 

2. Get editor working in client..
3. Create initial setup
   - 5 pendulums always (backend ports will be 5001-5005)
   - colors will be fixed (blue, orange, yellow, green, blue)
   - all pendulums have a default size
4. Create edit pendulum feature
   - drag anchor to move anchor
   - drag centrer of pendulum to move pendulum location
   - drag edge of pendulm to change size
   - ( https://codepen.io/stanko/pen/eYLYzMJ )
   - ( https://dev.to/taowen/make-react-svg-component-draggable-2kc )
6. Get simulation working in client
   - create [play] button to start simulation
   - create [stop/edit] button to reset simulation and enter edit mode
   - create [pause] button to pause simulation
   - pendulum physics examples
    ( https://codepen.io/Destructor1702/pen/YYwopY )
    ( https://codepen.io/TC5550/pen/JjdOMNp )


### Day 2
- create 5 pendulum servers on ports 5001-5005
- during configuration tell each node who are their immediate neighbors.
- during configuration set the "too close" value
- configure clients to use mqtt https://www.npmjs.com/package/mqtt listening to test.mosquitto.org on private channel
- create PUT pendulum endpoint to replace / edit a pendulum
- create GET pendulum endpoint to return the pendulum's data
- create PUT simulation/status endpoint to start/pause/stop simulation (stop resets)
- update GET pendulum endpoint to return the current simulation state of the pendulum (coordinates) 
- during simulation each pendulum node should watch the position of its immediate neighbours
periodically (via REST). Whenever they come "too close" send a STOP
message using a "guaranteed delivery" communication channel like MQTT, to all 5 instances. Upon
reception of STOP, each instance stops moving immediately, and waits for 5 seconds before sending
RESTART on the same channel. Once all 5 instances have received all 5 distinct RESTART messages, all will
restart moving, jumping back to their original position. 
- add instructions to run demo
- document the endpoints