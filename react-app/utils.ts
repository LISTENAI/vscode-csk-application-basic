export  function postMessage(type: string,data?:any){
    vscode.postMessage({
            type,
            data,
    })
}