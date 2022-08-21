import { Button, Tree } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import type { DirectoryTreeProps, DataNode } from 'antd/es/tree';
import type { Message} from '../../src/data.d';
import './App.css';
const acquireVsCodeApi = (window as any).acquireVsCodeApi
const vscode = acquireVsCodeApi && acquireVsCodeApi();
const { DirectoryTree } = Tree;
const App: React.FC = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<Message>) => {
      const message = event.data;
      setTreeData(message.data);
    },
    [treeData]
  );
 
  useEffect(() => {
    window.addEventListener('message', (event: MessageEvent<Message>) => {
      handleMessagesFromExtension(event);
    });
    return () => {
      window.removeEventListener('message', handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };
  const enterLoading = () => {
    vscode.postMessage({
        type: 'submit',
        data: 'i am form react app'
      });
  };

  return (
    <>
      <Button type="primary" onClick={enterLoading}>
        Click me!
      </Button>
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
      />
    </>
  );
};

export default App;

