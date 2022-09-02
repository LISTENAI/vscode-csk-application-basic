import React from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { ConfigProvider } from 'antd'
import App from './App'
const Report: React.FC = () => {
  return (
    <ConfigProvider>
      <App />
    </ConfigProvider>
  )
}

ReactDom.render(<Report/>, document.getElementById('root'))
