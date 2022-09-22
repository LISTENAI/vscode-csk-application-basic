import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { Button, Form, Input, Row, Col, Select, ConfigProvider } from 'antd'
const { Option } = Select
import { postMessage } from '../../../utils'
const CreateApplication: React.FC = () => {
  const [form] = Form.useForm()
  const sampleValue = Form.useWatch('sample', form)
  const [sample, setSample] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getStyle = (str: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(str)
  }
  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    switch (message.type) {
      case 'openFolder':
        const {fsPath } = message.data
        form.setFieldsValue({ path: fsPath })
        form.validateFields(['path'])
        break
      case 'getSamples':
        setSample(message.data)
        break
      case 'createDone':
        setLoading(false)
        break
    }
  }

  const checkPath = (_rule: any, value: string, callback: (arg0?: Error | undefined) => void) => {
    if (value && /\s/g.test(value)) {
      callback(new Error('不支持带有空格的路径'))
    }
    callback()
  }
  const selectDic = () => {
    postMessage('openFolder')
  }
  const onFinish = (values: any) => {
    setLoading(true)
    postMessage('createApplication', values)
  }
  const preview = () => {
    postMessage('openSampleReadme', sampleValue)
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
                      name='sample'
                      noStyle
                      rules={[{ required: true, message: '请选择应用模板' }]}
                    >
                      <Select placeholder='' allowClear showSearch>
                        {sample.map((item, key) => (
                          <Option key={key} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button block onClick={preview} disabled={!sampleValue}>
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
              <Form.Item>
                <Row gutter={6}>
                  <Col span={18}></Col>
                  <Col span={6}>
                    <Button htmlType='submit' block className='confirm-button' loading={loading}>
                      创建应用
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
ReactDom.render(<CreateApplication />, document.getElementById('root'))
