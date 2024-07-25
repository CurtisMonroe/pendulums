import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Pendulum from './pendulum';
import { AppState, Mode } from './Simulation';

function App() {
    const pedulumCount = 5;
    const width = 1000;
    const height = width;
    const spacing = width / (pedulumCount + 1);

    const [state, setState] = useState<AppState>({mode: Mode.stopped});

    return (
        <div className="App">
            <header className="App-header">
                <h1>
                    Pendulum Simulation.
                </h1>
                <svg style={{ border: '1px solid' }} width={width} height={height}>
                    <Pendulum index={1} anchor={spacing*1} color={'blue'} cx={spacing*1} cy={400} r={40} simulationState={state} />
                    <Pendulum index={2} anchor={spacing*2} color={'orange'} cx={spacing*2} cy={400} r={40} simulationState={state}/>
                    <Pendulum index={3} anchor={spacing*3} color={'yellow'} cx={spacing*3} cy={400} r={40} simulationState={state}/>
                    <Pendulum index={4} anchor={spacing*4} color={'green'} cx={spacing*4} cy={400} r={40} simulationState={state}/>
                    <Pendulum index={5} anchor={spacing*5} color={'cyan'} cx={spacing*5} cy={400} r={40} simulationState={state}/>
                </svg>
                <div className='button_bar'>
                    <button 
                        disabled={state.mode === Mode.running || state.mode === Mode.paused} 
                        onClick={() => setState({...state, mode: Mode.running})}>
                            Start
                        </button>
                    <button 
                        disabled={state.mode === Mode.stopped}
                        onClick={() => setState({...state, mode: (state.mode === Mode.paused) ? Mode.running : Mode.paused})}>
                            {state.mode === Mode.paused ? 'Continue' : 'Pause'}
                        </button>
                    <button 
                        disabled={state.mode === Mode.stopped}
                        onClick={() => setState({...state, mode: Mode.stopped})}>
                            Stop
                        </button>
                </div>
                <p>Simulation is {state.mode}</p>
            </header>
        </div>
    );
}

export default App;
