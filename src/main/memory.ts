import * as vscode from 'vscode';
import {join, sep} from 'path';
import { pathExists, readJSON, readFile, statSync } from 'fs-extra';
import {execa} from 'execa';
import {createHash} from 'crypto';
import { homedir } from 'os';
import exec from '../utils/exec';
import { chdir } from 'process';

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

  private async _hasElf(): Promise<boolean> {
    return await pathExists(join(this._buildDir(), 'zephyr', 'zephyr.elf'));
  }

  // private async _initData() {
    // if (!(await this._hasReport())) {
    //   // lisa zep build -t footprint
    //   await execa('lisa', ['zep', 'build', '-t', 'footprint'], {
    //     cwd: this._workspaceFolder
    //   });
    // }
  // }

  public async getData() {
    console.log("getMemorydata");

    // /Users/zhaozhuobin/.listenai/lisa-zephyr/packages/node_modules/@binary/gcc-arm-none-eabi-9/binary/bin/arm-none-eabi-objdump -dslw /Users/zhaozhuobin/ifly/zephyr_sample/hello_world/build/zephyr/zephyr.elf
    // arm-none-eabi-nm -Sl /Users/zhaozhuobin/ifly/zephyr_sample/hello_world/build/zephyr/zephyr.elf
    
    // await this._initData();
   
    if (!(await this._hasElf())) {
      console.log('no elf file');
      return {};
    }

    const elfbuffer = await readFile(join(this._buildDir(), 'zephyr', 'zephyr.elf'));
    
    const memoryConfiguration = await this._getMemoryConfiguration();
    const hash = createHash('md5');
    hash.update(elfbuffer);

    const md5 = hash.digest('hex');
    const LISA_HOME = process.env.LISA_HOME ?? join(homedir(), '.listenai');
    const gccPrefix = join(LISA_HOME, 'lisa-zephyr', 'packages', 'node_modules', '@binary', 'gcc-arm-none-eabi-9', 'binary', 'bin');

    const memoryData: {
      [key: string]: Array<IMemorySymbol>
    } = {};


    await exec(join(gccPrefix, 'arm-none-eabi-nm'), ['-Sl', join(this._buildDir(), 'zephyr', 'zephyr.elf')], {}, (line: string) => {
      const match = line.match(/^([\da-f]{8})\s+([\da-f]{8})\s+(.)\s+(\w+)(\s+(.+):(\d+))?/);
      if (match) {
        const memoryType = this._findMemoryType(memoryConfiguration, match[1]);
        if (!memoryData[memoryType]) {
          memoryData[memoryType] = [];
        }
        memoryData[memoryType].push({
          'name': match[4],
          'identifier': '',
          'address': match[1],
          'size': parseInt(match[2], 16),
          'file': match[6],
          'line': parseInt(match[7]),
          'type': types[match[3].toUpperCase()]
        });
      }
    });

    const treeData: {
      [key: string]: IMemorySymbol
    } = {};

    for (const memoryType in memoryData) {
      treeData[memoryType] = generateTree(memoryData[memoryType]);
    }

    console.log(treeData);
    return treeData;
  }
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

function generateTree(nodes: Array<IMemorySymbol>): IMemorySymbol {
  const treeDTO: Array<IMemorySymbol> = [];
  
  const tree: IMemorySymbol = {
    name: 'ROOT',
    size: 0,
    identifier: 'root',
    children: []
  };
  
  nodes.forEach(node => {
    
    const sepPath = node?.file?.split('/');
    let children = treeDTO;

    if (sepPath) {
      sepPath.push(node.name);
      sepPath.forEach((key, index) => {
        if (key) {
          let treeNode: IMemorySymbol = {
            name: key,
            identifier: key,
            size: node.size || 0
          };
          if (!children) {
            children = [treeNode];
          }
          let isExist = false;
          for (const i in children) {
            const item = children[i];
            if (item.identifier === treeNode.identifier) {
              item.size += treeNode.size;
              children = item.children || [];
              isExist = true;
              break;
            }
          }
          
          if (!isExist) {
            if (index === sepPath.length - 2) {
              treeNode.file = node.file;
              treeNode.type = 'file';
            }
            if (index === sepPath.length - 1) {
              treeNode = Object.assign(treeNode, {
                name: node.name,
                address: node.address,
                file: node.file,
                line: node.line,
                type: node.type,
                isLeaf: true
              });
            }
            children.push(treeNode);
            if (index !== sepPath.length - 1) {
              if (!children[children.length - 1].children) {
                children[children.length - 1].children = [];
              }
              children = children[children.length - 1].children || [];
            }
          }
        }
        
      });
    }
  });
  tree.children = treeDTO;
  tree.size = treeDTO.reduce(
    (a, b) => a + b.size || 0,
    0
  );
  return tree;
}

export default new Memory();