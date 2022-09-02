type Message = import('../../src/data').Message;


type VSCode = {
    postMessage<T extends Message = Message>(message: T): void;
    getState(): any;
    setState(state: any): void;
    commands:any
};

declare const vscode: VSCode;