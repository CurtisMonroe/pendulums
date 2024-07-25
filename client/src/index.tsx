import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// import { useState } from " react";
// App() {
// function
// const [number, setNumber]
// return
// <div>
// = useState(Ø)
// <span>You clicked {number} times
// onClick={()
// setNumber( (prev)
// <button
// Increase
// </button>
// </div>
// export default App;
// => prev +