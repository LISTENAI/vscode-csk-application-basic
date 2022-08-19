import { Button } from 'antd';
import React, { useState,useEffect } from 'react';
import './App.css';
import {windowVs} from './utils/vsState';

const App: React.FC = () => {
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const Vscode = new windowVs()
  useEffect(() => {
    Vscode.addCallback(vsCodeMessageCallback)
  }, []);

  const vsCodeMessageCallback = (message: { type: any; data: string; }) => {
    console.log('react console')
    console.log(message)

    switch (message.type) {
    
      }
  };
   const enterLoading = () => {
     Vscode.postMessage({
      type: 'submit',
      data: 'i am form react app'
    });
  };

  return (
    <>
        <Button type="primary"  onClick={enterLoading}>
          Click me!
        </Button>
      
    </>
  );
};

export default App;

