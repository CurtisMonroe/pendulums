import { useRef, Component, useEffect, useState, PointerEvent } from 'react';
import { AppState, Mode } from './Simulation';

interface DragElement {
    x: number;
    y: number;
    radius: number;
    xOffset: number;
    yOffset: number;
    isRepositioning: boolean;
    isResizing: boolean;
}

interface PendulumProps {
    index: number;
    anchor: number;
    color: string;
    cx: number;
    cy: number;
    r: number;
    simulationState: AppState;
}

const Pendulum = (props: PendulumProps) => {
    const { index, anchor, color, cx, cy, r, simulationState } = props;

    const [element, setElement] = useState<DragElement>(
        {
            x: cx,
            y: cy,
            radius: r,
            xOffset: 0,
            yOffset: 0,
            isRepositioning: false,
            isResizing: false,
        });

    function handleMovePendulumPointerDown(e: React.PointerEvent<SVGElement>) {
        if (simulationState.mode !== Mode.stopped) {
            return;
        }
        const el = e.currentTarget;
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);

        setElement({ ...element, xOffset: x, yOffset: y, isRepositioning: true });
    }

    function handleMovePendulumPointerMove(e: React.PointerEvent<SVGElement>) {
        if (element.isRepositioning !== true) {
            return;
        }

        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;

        setElement({
            ...element,
            x: element.x - (element.xOffset - x),
            y: element.y - (element.yOffset - y),
        });
    }

    function handlePointerUp(e: React.PointerEvent<SVGElement>) {
        setElement({ ...element, isRepositioning: false, isResizing: false });
    }

    function handleSizePendulumPointerDown(e: React.PointerEvent<SVGElement>) {
        if (simulationState.mode !== Mode.stopped) {
            return;
        }
        
        const el = e.currentTarget;
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);

        setElement({ ...element, xOffset: x, yOffset: y, isResizing: true });
    }

    function handleSizePendulumPointerMove(e: React.PointerEvent<SVGElement>) {
        if (element.isResizing !== true) {
            return;
        }

        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - (bbox.left + (bbox.width)/2);
        const y = e.clientY - (bbox.top + (bbox.height)/2);
        const radius = Math.sqrt(x*x + y*y);

        setElement({ ...element, radius: radius });
    }

    // useEffect(() => {
    //     setStrArr(['a', 'b', 'c']);
    
    //     setObjArr([{name: 'A', age: 1}]);
    //   }, []);

    return (
        <>
            <line x1={anchor} y1={1} x2={element.x} y2={element.y} style={{ stroke: color, strokeWidth: 4 }} />
            <circle id={`pendulum-${index}`}
                cx={element.x}
                cy={element.y}
                r={element.radius}
                fill={element.isResizing ? 'black' : color}
                stroke={simulationState.mode !== Mode.stopped ? color : 'white'}
                onPointerDown={(evt) => handleSizePendulumPointerDown(evt)}
                onPointerMove={(evt) => handleSizePendulumPointerMove(evt)}
                onPointerUp={(evt) => handlePointerUp(evt)}
            />
            <circle id={`pendulum-core-${index}`}
                cx={element.x}
                cy={element.y}
                r={element.radius-10}
                fill={color}
                onPointerDown={(evt) => handleMovePendulumPointerDown(evt)}
                onPointerMove={(evt) => handleMovePendulumPointerMove(evt)}
                onPointerUp={(evt) => handlePointerUp(evt)}
            />
        </>);
}

export default Pendulum;