import * as vscode from 'vscode';
import {join, sep} from 'path';
import { pathExists, readJSON, readFile, statSync } from 'fs-extra';
import {execa} from 'execa';
import {createHash} from 'crypto';
import { homedir } from 'os';
import exec from '../utils/exec';

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

interface IMemoryRange {
  'rangeStart': string;
  'rangeEnd': string;
  'size': number;
}
interface IMemoryConfiguration {
  [key: string]: IMemoryRange;
}

const types: {
  [key: string]: string
} = {
  'T': TYPE_FUNCTION,
  'D': TYPE_VARIABLE,
  'B': TYPE_VARIABLE,
  'R': TYPE_VARIABLE
};

const MEMORY_TYPES = ['flash', 'sram', 'itcm', 'psramap'];

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
    
    try {
      await this._initData();
    } catch (error) {
      return {};
    }
    const elfbuffer = await readFile(join(this._buildDir(), 'zephyr', 'zephyr.elf'));
    
    const memoryConfiguration = await this._getMemoryConfiguration();
    const hash = createHash('md5');
    hash.update(elfbuffer);

    const md5 = hash.digest('hex');
    const rom = await readJSON(join(this._buildDir(), 'rom.json'));
    const ram = await readJSON(join(this._buildDir(), 'ram.json'));
    const LISA_HOME = process.env.LISA_HOME ?? join(homedir(), '.listenai');
    const gccPrefix = join(LISA_HOME, 'lisa-zephyr', 'packages', 'node_modules', '@binary', 'gcc-arm-none-eabi-9', 'binary', 'bin');
    const symbols: {
      [key: string]: {
        'name': string;
        'address': string;
        'size': number;
        'file': string | undefined; 
        'line': number | undefined;
        'type': string | undefined;
      }
    } = {};

    const targetData: {
      [key: string]: IMemorySymbol
    } = {};

    
    await exec(join(gccPrefix, 'arm-none-eabi-nm'), ['-Sl', join(this._buildDir(), 'zephyr', 'zephyr.elf')], {}, (line: string) => {
      const match = line.match(/^([\da-f]{8})\s+([\da-f]{8})\s+(.)\s+(\w+)(\s+(.+):(\d+))?/);
      if (match) {
        symbols[match[4]] = {
          'name': match[4],
          'address': match[1],
          'size': parseInt(match[2], 16),
          'file': match[6],
          'line': parseInt(match[7]),
          'type': types[match[3].toUpperCase()]
        };
      }
    });

    for (let key in symbols) {
      const symbol = symbols[key];
      const memoryType = this._findMemoryType(memoryConfiguration, symbol.address);
      if (targetData[memoryType]) {
        targetData[memoryType].children?.push({
          name: symbol.name,
          size: symbol.size,
          address: symbol.address,
          file: symbol.file,
          line: symbol.line,
          identifier: symbol.file || '',
          type: symbol.type
        });
        targetData[memoryType].size += symbol.size;
      } else {
        targetData[memoryType] = {
          children: [{
            name: symbol.name,
            size: symbol.size,
            address: symbol.address,
            file: symbol.file,
            line: symbol.line,
            identifier: symbol.file || '',
            type: symbol.type
          }],
          name: 'Root',
          identifier: 'root',
          size: symbol.size
        };
      }
    }


    const treeData = {
      // 'md5': md5,
      'flash': objAddParm(rom.symbols, '', symbols),
      'ram': objAddParm(ram.symbols, '', symbols),
      // 'symbols': symbols
    };
    generateTree(targetData['FLASH']?.children);
    console.log(targetData);
    console.log(treeData);
    return treeData;
  }

  // private _handleRomData(rom, symbols) {
    



  // }

  private async _getMemoryConfiguration(): Promise<IMemoryConfiguration> {
    const mapfile = (await readFile(join(this._buildDir(), 'zephyr', 'zephyr.map'))).toString();
    const memoryConfigurationStr = mapfile.substring(mapfile.indexOf('Memory Configuration')+20, mapfile.indexOf('Linker script and memory map'));
    const memoryConfiguration:IMemoryConfiguration = {};
    memoryConfigurationStr.trim().split('\n').forEach((line, index) => {
      const match = line.match(/^(\w+)\s+(0x00000000[\da-f]{8})\s+(0x00000000[\da-f]{8})\s+/);
      if (match && MEMORY_TYPES.includes(match[1].toLowerCase())) {
        memoryConfiguration[match[1]] = {
          rangeStart: parseInt(match[2], 16).toString(16),
          rangeEnd: (parseInt(match[2], 16) + parseInt(match[3], 16)).toString(16),
          size: parseInt(match[3], 16) / 1024 / 1024
        };
      }
    });
    return memoryConfiguration;
  }

  private _findMemoryType(memoryConfiguration: IMemoryConfiguration, address: string): string {
    const memoryType = Object.keys(memoryConfiguration).find(key => 
      parseInt(address, 16) >= parseInt(memoryConfiguration[key].rangeStart, 16)
        && parseInt(address, 16) < parseInt(memoryConfiguration[key].rangeEnd, 16));
    return memoryType || 'unknown';
  }

}

function objAddParm(obj: IMemorySymbol, identifier: string, symbols: ISymbols) {
  if (obj.children) {
    identifier = (identifier === 'root' || !identifier) ? obj.identifier : join(identifier, obj.name);
    try {
      const fsstat = statSync(identifier);
      if (fsstat.isFile()) {
        obj.type = 'file';
        obj.file = identifier;
      }  
    } catch (error) {}
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

function generateTree(nodes: Array<IMemorySymbol> | undefined) {
  const treeDTO: Array<IMemorySymbol> = []



  if (!nodes) {
    return
  }
  const tree: IMemorySymbol = {
    name: 'WORKSPACE',
    size: 0,
    identifier: '/Users/zhaozhuobin/ifly/scanpen_csk6/.sdk',
    children: []
  };
  
  nodes.forEach(node => {
    const filepath = node?.file?.replace('/Users/zhaozhuobin/ifly/scanpen_csk6/.sdk/', '');
    
    const sepPath = filepath?.split(sep);
    let children = treeDTO;



    if (sepPath) {
      sepPath.forEach(key => {
        if (children)
        const children = tree.children?.find(item => item.identifier === key) || {
          name
        }
      })
    }
  });


}


export default new Memory();