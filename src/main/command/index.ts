import { createTerminal } from '@/utils/terminal';

export class Command {
  static async run(name: string, cmd: string) {
    createTerminal(name, cmd);
  }
}