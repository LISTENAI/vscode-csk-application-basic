import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { Button, Form, Input, Row, Col, Select, ConfigProvider } from 'antd'
const { Option } = Select
import { postMessage} from '../../../utils'
interface Smaple {
  name: string
  value: string
}
const CreateApplication: React.FC = () => {
  const [form] = Form.useForm()
  const smapleValue = Form.useWatch('smaple', form)
  const [smaple, setSmaple] = useState<Smaple[]>([])
  const getStyle = (str: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(str)
  }
  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    switch (message.type) {
      case 'openFolder':
        const { path, fsPath } = message.data
        console.log(path, fsPath)
        form.setFieldsValue({ path: fsPath })
        form.validateFields(['path'])
        break;
      case 'getSmaples':
        setSmaple(message.data)
    }
  }
  
  const checkPath = (_rule, value, callback) => {
    if (value && /\s/g.test(value)) {
      callback(new Error('不支持带有空格的路径'))
    }
    callback()
  }
  const selectDic = () => {
    postMessage('openFolder')
  }
  const onFinish = (values: any) => {
    console.log('Success:', values)
     postMessage('createApplication', values)
  }
  const preview = () => {
    postMessage('showRst', smapleValue)
  }
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  }
  useEffect(() => {
    ConfigProvider.config({
      theme: {
        primaryColor: getStyle('--vscode-editor-background'),
      },
    })
    postMessage('getSamples')
    window.addEventListener('message', (event: MessageEvent<Message>) => {
      handleMessagesFromExtension(event)
    })
    return () => {
      window.removeEventListener('message', handleMessagesFromExtension)
    }
  }, [])

  return (
    <ConfigProvider>
      <div className='layout layout--create-page'>
        <div className='layout__body'>
          <div className='layout__inner-body'>
            <div className='layout__title'>新建应用向导</div>
            <p className='application-type-explanation'>创建应用程序需要预装CSK SDK。</p>
            <Form
              form={form}
              name='basic'
              {...formItemLayout}
              layout='vertical'
              onFinish={onFinish}
              autoComplete='off'
              labelAlign='left'
              className='create-form'
            >
              <Form.Item label='应用目录'>
                <Row gutter={6}>
                  <Col span={18}>
                    <Form.Item
                      name='path'
                      noStyle
                      rules={[
                        { required: true, message: '请选择应用目录' },
                        { validator: checkPath },
                      ]}
                    >
                      <Input readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button block onClick={selectDic}>
                      选择
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label='应用模板'>
                <Row gutter={6}>
                  <Col span={18}>
                    <Form.Item
                      name='smaple'
                      noStyle
                      rules={[{ required: true, message: '请选择应用目录' }]}
                    >
                      <Select placeholder='' allowClear>
                        {smaple.map((item, key) => {
                          ;<Option key={key} value={item.value}>
                            {item.name}
                          </Option>
                        })}
                        <Option value='female'>female</Option>
                        <Option value='other'>other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button block onClick={preview} disabled={!smapleValue}>
                      预览
                    </Button>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item
                label='应用名称'
                name='name'
                rules={[{ required: true, message: '请输入应用名称' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 18, span: 6 }}>
                <Button  htmlType='submit' block className='confirm-button'>
                  创建应用
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
ReactDom.render(<CreateApplication />, document.getElementById('root'))
