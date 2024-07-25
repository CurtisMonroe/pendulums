import { useRef, Component } from 'react';
import ReactDOM from 'react-dom/client';
//import d3 from 'd3';

const Pendulum = (props: { index: number; anchor: number; color: string; cx: number; cy: number; r: number; }) => {
    const { index, anchor, color, cx, cy, r } = props;

    const lineRef = useRef(null);
    const circleRef = useRef(null);

    return (
        <>
            <line ref={lineRef} x1={anchor} y1={1} x2={cx} y2={cy} style={{ stroke: color, strokeWidth: 4 }} />
            <circle ref={circleRef} id={`pendulum-${index}`} cx={cx} cy={cy} r={r} fill={color} />
        </>);
}

export default Pendulum;