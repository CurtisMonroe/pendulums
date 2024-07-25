import d3 from 'd3';
import { createRef, Component } from 'react';
import ReactDOM from 'react-dom/client';

// class Circle extends Component {
//     inputRef = createRef();

//     componentDidMount() {
//         const handleDrag = d3.drag()
//             .subject(function () {
//                 const me = d3.select(this);
//                 return { x: me.attr('cx'), y: me.attr('cy') }
//             })
//             .on('drag', function () {
//                 const me = d3.select(this);
//                 me.attr('cx', d3.event.x);
//                 me.attr('cy', d3.event.y);
//             });
//         const node = this.inputRef.current;
//         handleDrag(d3.select(node));
//     }
//     render() {
//         return <circle ref={this.inputRef} {...this.props} />
//     }
// }