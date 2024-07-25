import React from 'react';
import logo from './logo.svg';
import './App.css';
import Pendulum from './pendulum';

function App() {
    const pedulumCount = 5;
    const width = 1000;
    const height = width;
    const spacing = width / (pedulumCount + 1);
    return (
        <div className="App">
            <header className="App-header">
                <h1>
                    Pendulum Simulation.
                </h1>
                <svg style={{ border: '1px solid' }} width={width} height={height}>
                    <Pendulum index={1} anchor={spacing*1} color={'blue'} cx={spacing*1} cy={400} r={40} />
                    <Pendulum index={2} anchor={spacing*2} color={'orange'} cx={spacing*2} cy={400} r={40} />
                    <Pendulum index={3} anchor={spacing*3} color={'yellow'} cx={spacing*3} cy={400} r={40} />
                    <Pendulum index={4} anchor={spacing*4} color={'green'} cx={spacing*4} cy={400} r={40} />
                    <Pendulum index={5} anchor={spacing*5} color={'cyan'} cx={spacing*5} cy={400} r={40} />
                </svg>
            </header>
        </div>
    );
}

export default App;
