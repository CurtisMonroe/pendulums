export function getThetaT(seconds: number, period: number, theta0: number): number {
    return theta0 * Math.cos((2 * Math.PI * seconds) / period)
  }

export function getXFromThetaT(thetaT:number, xAnchor: number, yAnchor: number, length: number): number {
    return xAnchor + Math.sin(thetaT)*length
}

export function getYFromThetaT(thetaT:number, xAnchor: number, yAnchor: number, length: number): number {
    return yAnchor + Math.cos(thetaT)*length
}

export function getLength(xAnchor: number, yAnchor: number, xPendulum: number, yPendulum: number): number {
    const x = xAnchor - xPendulum;
    const y = yAnchor - yPendulum;
    return Math.sqrt(x*x + y*y);
}

export function getTheta0(xAnchor: number, yAnchor: number, xPendulum: number, yPendulum: number): number {
    const opposite = xAnchor-xPendulum;
    const adjacent = yAnchor-yPendulum;
    return Math.atan(opposite/adjacent);        
}

export function getPeriod(length: number): number {
    return 2 * Math.PI * Math.sqrt((length/200)/9.807)
}

export function getPendulumLocationAtGivenTime(
    xAnchor: number, 
    yAnchor: number, 
    xInitial: number, 
    yInitial: number,
    time: number) : { x:number, y:number} {
        const theta0 = getTheta0(xAnchor, yAnchor, xInitial, yInitial);
        const length = getLength(xAnchor, yAnchor, xInitial, yInitial);
        const period = getPeriod(length);
        const thetaT = getThetaT(time, period, theta0);
        const x = getXFromThetaT(thetaT, xAnchor, yAnchor, length);
        const y = getYFromThetaT(thetaT, xAnchor, yAnchor, length);
        
        //console.log(`theta0:${theta0} length:${length} period:${period} thetaT:${thetaT} time:${time} x:${x} y:${y}`);

        return ({x: x, y: y});
    }