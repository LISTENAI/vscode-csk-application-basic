import { Tabs, Button } from "antd";
import React, { useState, useEffect, useCallback } from 'react';
import type { Message } from '../../src/data.d';
import Report from "./components/Report";

import './App.css';
const { TabPane } = Tabs;
const App: React.FC = () => {
  const [treeData, setTreeData] = useState<any>({});
  const [tabPanes, setTabPanes] = useState<string[]>([]);
  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<Message>) => {
      const message = event.data;
      console.log("message", message);
       if (message.type === "treeData") {
         setTreeData(message.data);
         setTabPanes(Object.keys(message.data));
       }
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

 

  return (
    <>
      <Button type="primary">Click me!</Button>
      <Tabs defaultActiveKey={tabPanes[0]}>
        {tabPanes.map((val: string) => {
          return (
            <TabPane tab={val} key={val}>
              <Report data={treeData[val]} />
            </TabPane>
          );
        })}
      </Tabs>
    </>
  );
};

export default App;

