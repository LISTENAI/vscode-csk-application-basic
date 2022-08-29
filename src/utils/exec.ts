import {Options, execa} from 'execa';
import { PassThrough } from 'stream';
import { createInterface } from 'readline';
import { once } from 'events';

export default async (
    file: string,
    arg?: readonly string[] | undefined,
    options?: Options<string> | undefined,
    onProcess?: (line: string) => void
) => {
    // let success = false
    const exec = execa(file, arg, options);

    const mixer = new PassThrough();
    exec.stdout?.pipe(mixer);
    exec.stderr?.pipe(mixer);

    const rl = createInterface({
        input: mixer,
        historySize: 0,
        crlfDelay: Infinity,
    });
    rl.on('line', (line) => {
        try {
            onProcess && onProcess(line);
        } catch (error) {
            
        }
    });
    await once(exec, 'exit');
    return exec.exitCode;
}