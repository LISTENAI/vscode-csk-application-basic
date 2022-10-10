import {Terminal, window} from 'vscode';

export class Command {
  static async run(cmd: string) {
      const terminals = <Terminal[]>(<any>window).terminals;
      console.log(terminals);
      const items: Terminal | undefined = terminals.find(t =>
          t.name === 'sdk Terminal'
      );
      items && items.dispose();
      let terminal = window.createTerminal(`sdk Terminal`);
      terminal.show(true);
      terminal.sendText(cmd);
  }
}