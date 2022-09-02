import { Tabs, Spin, ConfigProvider } from "antd";
import React, { useState, useEffect } from "react";
import type { Message } from "../../../../src/data";
import Report from "./components/Report";
const { TabPane } = Tabs;
const App: React.FC = () => {
  const [treeData, setTreeData] = useState<any>({});
  const [tabPanes, setTabPanes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    if (message.type === 'treeData') {
      setTreeData(message.data)
      setTabPanes(Object.keys(message.data))
      setLoading(false)
    }
  }
  const getStyle = (str: string) => {
    return window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(str);
  };
  useEffect(() => {
    ConfigProvider.config({
      theme: {
        primaryColor: getStyle("--vscode-editor-background") ,
      },
    });
    vscode.postMessage({
      type: "mounted",
      data: {},
    });
    window.addEventListener('message', (event: MessageEvent<Message>) => {
      handleMessagesFromExtension(event)
    })
    return () => {
      window.removeEventListener("message", handleMessagesFromExtension);
    };
  }, []);

  return (
    <div className="report-container">
      <Spin spinning={loading} wrapperClassName="loading-area">
        <Tabs defaultActiveKey={tabPanes[0]}>
          {tabPanes.map((val: string) => {
            return (
              <TabPane tab={val} key={val}>
                <Report data={treeData[val]} />
              </TabPane>
            );
          })}
        </Tabs>
      </Spin>
    </div>
  );
};

export default App;
