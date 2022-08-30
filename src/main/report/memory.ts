import * as vscode from 'vscode';
import {join} from 'path';
import { pathExists, readJSON, readFile, statSync } from 'fs-extra';
import {execa} from 'execa';
import {createHash} from 'crypto';
import { homedir } from 'os';
import exec from '../../utils/exec';

const TYPE_FUNCTION = "function";
const TYPE_VARIABLE = "variable";

interface IMemorySymbol {
  'name': string;
  'address'?: string;
  'size': number;
  'identifier': string;
  'file'?: string | undefined; 
  'line'?: number | undefined;
  'type'?: string | undefined;
  'children'?: Array<IMemorySymbol>;
  'isLeaf'?: boolean;
}

interface ISymbols {
  [key: string]: {
    'address': string;
    'size': number;
    'file': string | undefined; 
    'line': number | undefined;
    'type': string | undefined;
  }
}

const types: {
  [key: string]: string
} = {
  'T': TYPE_FUNCTION,
  'D': TYPE_VARIABLE,
  'B': TYPE_VARIABLE,
  'R': TYPE_VARIABLE
};

class Memory {
  private _data;
  private _workspaceFolder: string | undefined;

  constructor() {
    this._data = {};
    this._workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
  }

  private _buildDir(): string {
    return this._workspaceFolder ? join(this._workspaceFolder, 'build') : '';
  }

  private async _hasReport(): Promise<boolean> {
    return await pathExists(join(this._buildDir(), 'rom.json')) && await pathExists(join(this._buildDir(), 'ram.json'));
  }

  private async _initData() {
    if (!(await this._hasReport())) {
      // lisa zep build -t footprint
      await execa('lisa', ['zep', 'build', '-t', 'footprint'], {
        cwd: this._workspaceFolder
      });
    }
  }

  public async getData() {
    console.log("getMemorydata");

    // /Users/zhaozhuobin/.listenai/lisa-zephyr/packages/node_modules/@binary/gcc-arm-none-eabi-9/binary/bin/arm-none-eabi-objdump -dslw /Users/zhaozhuobin/ifly/zephyr_sample/hello_world/build/zephyr/zephyr.elf
    // arm-none-eabi-nm -Sl /Users/zhaozhuobin/ifly/zephyr_sample/hello_world/build/zephyr/zephyr.elf
    
      await this._initData();
   
    const elfbuffer = await readFile(join(this._buildDir(), 'zephyr', 'zephyr.elf'));
    const hash = createHash('md5');
    hash.update(elfbuffer);

    const md5 = hash.digest('hex');
    const rom = await readJSON(join(this._buildDir(), 'rom.json'));
    const ram = await readJSON(join(this._buildDir(), 'ram.json'));
    const LISA_HOME = process.env.LISA_HOME ?? join(homedir(), '.listenai');
    const gccPrefix = join(LISA_HOME, 'lisa-zephyr', 'packages', 'node_modules', '@binary', 'gcc-arm-none-eabi-9', 'binary', 'bin');
    const symbols: {
      [key: string]: {
        'address': string;
        'size': number;
        'file': string | undefined; 
        'line': number | undefined;
        'type': string | undefined;
      }
    } = {};
    
    await exec(join(gccPrefix, 'arm-none-eabi-nm'), ['-Sl', join(this._buildDir(), 'zephyr', 'zephyr.elf')], {}, (line: string) => {
      const match = line.match(/^([\da-f]{8})\s+([\da-f]{8})\s+(.)\s+(\w+)(\s+(.+):(\d+))?/);
      if (match) {
        symbols[match[4]] = {
          'address': match[1],
          'size': parseInt(match[2], 16),
          'file': match[6],
          'line': parseInt(match[7]),
          'type': types[match[3].toUpperCase()]
        };
      }
    });
    const treeData = {
      // 'md5': md5,
      'flash': objAddParm(rom.symbols, '', symbols),
      'ram': objAddParm(ram.symbols, '', symbols),
      // 'symbols': symbols
    };
    return treeData;
  }

  // private _handleRomData(rom, symbols) {
    



  // }
}

function objAddParm(obj: IMemorySymbol, identifier: string, symbols: ISymbols) {
  if (obj&&obj.children) {
    identifier = (identifier === 'root' || !identifier) ? obj.identifier : join(identifier, obj.name);
    try {
      const fsstat = statSync(identifier);
      if (fsstat.isFile()) {
        obj.type = 'file';
        obj.file = identifier;
      }  
    } catch (error) { }

    obj.children = obj.children.map(symbol => objAddParm(symbol, identifier, symbols));
  } else {
    obj.isLeaf = true;
    const symbol = symbols[obj.name];
    if (symbol) {
      obj = Object.assign(obj, symbol);
    }
  }
  return obj;
}


export default new Memory();