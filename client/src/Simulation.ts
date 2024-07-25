export enum Mode {
    running = 'Running',
    paused = 'Paused',
    stopped = 'Stopped'
}

export interface AppState {
    mode: Mode
}