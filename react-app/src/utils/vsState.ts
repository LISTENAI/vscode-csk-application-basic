interface Message {
    type: string;
    data?:any
}
export class windowVs {
    private Vscode: any;
    private vsCodeCallbacks: any[] = [];
    constructor() {
        const acquireVsCodeApi = (window as any).acquireVsCodeApi
        this.Vscode = acquireVsCodeApi && acquireVsCodeApi();
        window.addEventListener('message', (event) => {
            this.vsCodeCallbacks.forEach(async callback => callback(event.data));
        });
    }
    public  setState = ({ key, value }: { key: string; value: any }) => {
        const previousState = this.Vscode.getState();
        const state = previousState ? { ...previousState } : {};
        this.Vscode.setState({ ...state, [key]: value });
    }
    public getState = (key: string) => {
        const previousState = this.Vscode.getState();
        return previousState ? previousState[key] : null;
    };

    public postMessage = (message: Message) => {
        console.log(this.Vscode)
        console.log(message)

        const caller = this.Vscode
        if (caller === null) {
            return;
        }
        caller.postMessage(message);
    };
    public addCallback = (callback:any) => {
        this.vsCodeCallbacks.push(callback);
    };

    public removeCallback = (callback: any) => {
        this.vsCodeCallbacks.splice(this.vsCodeCallbacks.indexOf(callback), 1);
    };

}

