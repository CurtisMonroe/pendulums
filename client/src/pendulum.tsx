import { useRef, Component, useEffect, useState, PointerEvent } from 'react';
import ReactDOM from 'react-dom/client';

interface DragElement {
    x: number;
    y: number;
    active: boolean;
    xOffset: number;
    yOffset: number;
}

const Pendulum = (props: { index: number; anchor: number; color: string; cx: number; cy: number; r: number; }) => {
    const { index, anchor, color, cx, cy, r } = props;

    const [element, setElement] = useState<DragElement>(
        {
            x: cx,
            y: cy,
            active: false,
            xOffset: 0,
            yOffset: 0,
        });

    function handlePointerDown(e: React.PointerEvent<SVGElement>) {
        const el = e.currentTarget;
        const bbox = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);

        setElement({ ...element, xOffset: x, yOffset: y, active: true });
    }

    function handlePointerMove(e: React.PointerEvent<SVGElement>) {
        if (element.active !== true) {
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
        setElement({ ...element, active: false });
    }

    return (
        <>
            <line x1={anchor} y1={1} x2={element.x} y2={element.y} style={{ stroke: color, strokeWidth: 4 }} />
            <circle id={`pendulum-${index}`}
                cx={element.x}
                cy={element.y}
                r={r}
                fill={color}
                onPointerDown={(evt) => handlePointerDown(evt)}
                onPointerUp={(evt) => handlePointerUp(evt)}
                onPointerMove={(evt) => handlePointerMove(evt)}
            />
        </>);
}

export default Pendulum;