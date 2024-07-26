import { useRef, Component, useEffect, useState, PointerEvent } from 'react';
import { AppState, getPendulumLocationAtGivenTime, Mode } from './Simulation';

interface PendulumState {
    xInitial: number;
    yInitial: number;
    radius: number;
    xOffset: number;
    yOffset: number;
    xSimulated: number;
    ySimulated: number;
    isRepositioning: boolean;
    isResizing: boolean;
}

enum SimulationStatus {
    stopped = 'Stopped',
    running = 'Running',
    paused = 'Paused',
    halted = 'Halted'
}

interface SimulationState {
    xPivot: number;
    yPivot: number;
    xInitial: number;
    yInitial: number;
    x: number;
    y: number;
    seconds: number;
    status: SimulationStatus;
}

interface PendulumProps {
    index: number;
    anchor: number;
    color: string;
    cx: number;
    cy: number;
    r: number;
    appState: AppState;
}

interface GetPendulumBackendResponse {
    xAnchor: number,
    yAnchor: number,
    xInitial: number,
    yInitial: number,
    x: number,
    y: number,
    radius: number,
    seconds: number,
    status: string,
    instance: number
}

const useInternalSimulation = false;

const Pendulum = (props: PendulumProps) => {
    const { index, anchor, color, cx, cy, r, appState } = props;

    const [pendulumState, setPendulumState] = useState<PendulumState>(
        {
            xInitial: cx,
            yInitial: cy,
            radius: r,
            xOffset: 0,
            yOffset: 0,
            xSimulated: cx,
            ySimulated: cy,
            isRepositioning: false,
            isResizing: false,
        });
    
    const [simulationState, setSimulationState] = useState<SimulationState>(
        {
            xPivot: anchor,
            yPivot: 0,
            xInitial: cx,
            yInitial: cy,
            x: cx,
            y: cy,
            seconds: 0,
            status: SimulationStatus.stopped 
        }
    );

    function handleMovePendulumPointerDown(e: React.PointerEvent<SVGElement>) {
        if (appState.mode !== Mode.stopped) {
            return;
        }
        const el = e.currentTarget;
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);

        setPendulumState({ 
            ...pendulumState, 
            xOffset: x, 
            yOffset: y,
            isRepositioning: true 
        });
    }

    function handleMovePendulumPointerMove(e: React.PointerEvent<SVGElement>) {
        if (pendulumState.isRepositioning !== true) {
            return;
        }

        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;

        const xInit = pendulumState.xInitial - (pendulumState.xOffset - x);
        const yInit = pendulumState.yInitial - (pendulumState.yOffset - y);

        setPendulumState({
            ...pendulumState,
            xInitial: xInit,
            yInitial: yInit,
            xSimulated: xInit,
            ySimulated: yInit, 
        });
    }

    function handlePointerUp(e: React.PointerEvent<SVGElement>) {
        setPendulumState({ ...pendulumState, isRepositioning: false, isResizing: false });
    }

    function handleSizePendulumPointerDown(e: React.PointerEvent<SVGElement>) {
        if (appState.mode !== Mode.stopped) {
            return;
        }

        const el = e.currentTarget;
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);

        setPendulumState({ ...pendulumState, xOffset: x, yOffset: y, isResizing: true });
    }

    function handleSizePendulumPointerMove(e: React.PointerEvent<SVGElement>) {
        if (pendulumState.isResizing !== true) {
            return;
        }
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - (bbox.left + (bbox.width)/2);
        const y = e.clientY - (bbox.top + (bbox.height)/2);
        const radius = Math.sqrt(x*x + y*y);

        setPendulumState({ ...pendulumState, radius: radius });
    }


    function updatePendulumInBackend(xAnchor: number, yAnchor: number, xInitial: number, yInitial: number, radius: number, status: string) {
        fetch(`http://localhost:${5000+index}/pendulum`, {
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                xAnchor: xAnchor,
                yAnchor: yAnchor,
                xInitial: xInitial,
                yInitial: yInitial,
                radius: radius,
                status: status
            })
        })
    }
       

    useEffect(() => {
        //let isMounted = true;
        const millisecondsPerFrame = 100;
        const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
            if (simulationState.status === SimulationStatus.running && appState.mode === Mode.paused) {    
                setSimulationState((state) => ({
                    ...state,
                    status: SimulationStatus.paused
                }));

                updatePendulumInBackend(simulationState.xPivot, simulationState.yPivot, simulationState.xInitial, simulationState.yInitial, r, 'Paused');
            }
            else if (simulationState.status !== SimulationStatus.stopped && appState.mode === Mode.stopped) {    
                setSimulationState((state) => ({
                    ...state,
                    seconds: 0,
                    status: SimulationStatus.stopped
                }));

                updatePendulumInBackend(simulationState.xPivot, simulationState.yPivot, simulationState.xInitial, simulationState.yInitial, r, 'Stopped');
            }
            else if (simulationState.status === SimulationStatus.stopped && appState.mode === Mode.running) {
                const currentTime = 0;
                const {x, y} = getPendulumLocationAtGivenTime(
                    simulationState.xPivot,
                    simulationState.yPivot,
                    pendulumState.xInitial,
                    pendulumState.yInitial,
                    currentTime
                );

                updatePendulumInBackend(simulationState.xPivot, simulationState.yPivot, pendulumState.xInitial, pendulumState.yInitial, r, 'Running');

                setSimulationState({
                    xPivot: anchor,
                    yPivot: 0,
                    xInitial: pendulumState.xInitial,
                    yInitial: pendulumState.yInitial,
                    x: x,
                    y: y,
                    seconds: currentTime,
                    status: SimulationStatus.running });
            }
            else if (simulationState.status === SimulationStatus.running ||
                    (simulationState.status === SimulationStatus.paused && appState.mode === Mode.running)
            ) {
                if (simulationState.status === SimulationStatus.paused) {
                    // start the simulation running if it isn't already
                    updatePendulumInBackend(simulationState.xPivot, simulationState.yPivot, simulationState.xInitial, simulationState.yInitial, r, 'Running');
                }

                if (useInternalSimulation) {
                    const currentTime = simulationState.seconds + millisecondsPerFrame/1000;
                    const {x, y} = getPendulumLocationAtGivenTime(
                        simulationState.xPivot,
                        simulationState.yPivot,
                        simulationState.xInitial,
                        simulationState.yInitial,
                        currentTime
                    );
                    setSimulationState((state) => ({
                        ...state,
                        x: x,
                        y: y,
                        seconds: currentTime,
                        status: SimulationStatus.running
                    }));
                } else {
                    // Server sample response:
                    // {
                    //     "xAnchor": 166.66666666666666,
                    //     "yAnchor": 0,
                    //     "xInitial": 166.66666666666666,
                    //     "yInitial": 400,
                    //     "x": 166.66666666666666,
                    //     "y": 400,
                    //     "seconds": 0,
                    //     "status": "Stopped",
                    //     "radius": 20,
                    //     "neighborPort": 5000,
                    //     "instance": 1
                    // }

                    fetch(`http://localhost:${5000+index}/pendulum`)
                    .then(response => response.json())
                    .then((data: GetPendulumBackendResponse) => 
                        setSimulationState((state) => ({
                            ...state,
                            x: data.x,
                            y: data.y,
                            seconds: data.seconds,
                            status: SimulationStatus.running})
                        ))
                   .catch(function(error) {
                      console.log(error)
                   })
                }

            }    
        }, millisecondsPerFrame)
      
        return () => {
            clearInterval(intervalId); //This is important
            //isMounted = false // Let's us know the component is no longer mounted.
        } 
       
      }, [simulationState, appState])

    const useSimulation = appState.mode !== Mode.stopped && simulationState.status !== SimulationStatus.stopped;
    const x = useSimulation ? simulationState.x : pendulumState.xInitial;
    const y = useSimulation ? simulationState.y : pendulumState.yInitial;

    return (
        <>
            <line x1={anchor} y1={1} x2={x} y2={y} style={{ stroke: color, strokeWidth: 4 }} />
            <circle id={`pendulum-${index}`}
                cx={x}
                cy={y}
                r={pendulumState.radius}
                fill={pendulumState.isResizing ? 'black' : color}
                stroke={appState.mode !== Mode.stopped ? color : 'white'}
                onPointerDown={(evt) => handleSizePendulumPointerDown(evt)}
                onPointerMove={(evt) => handleSizePendulumPointerMove(evt)}
                onPointerUp={(evt) => handlePointerUp(evt)}
            />
            <circle id={`pendulum-core-${index}`}
                cx={x}
                cy={y}
                r={pendulumState.radius-10}
                fill={color}
                onPointerDown={(evt) => handleMovePendulumPointerDown(evt)}
                onPointerMove={(evt) => handleMovePendulumPointerMove(evt)}
                onPointerUp={(evt) => handlePointerUp(evt)}
            />
        </>);
}

export default Pendulum;