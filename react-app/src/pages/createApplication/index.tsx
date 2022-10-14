import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { Button, Form, Input, Row, Col, Select, ConfigProvider } from 'antd'
const { Option } = Select
import { postMessage, get } from '../../../utils'
const CreateApplication: React.FC = () => {
  const [form] = Form.useForm()
  const sampleValue = Form.useWatch('sample', form)
  const [sample, setSample] = useState<any[]>([])
  const [basicSample, setBasicSample] = useState<string[]>([])
  const [aiSampleVal, setAiSampleVal] = useState<any>()
  const [aiSample, setAiSample] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [hasType, setType] = useState<boolean>(false)

  const getStyle = (str: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(str)
  }
  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    switch (message.type) {
      case 'openFolder':
        const { fsPath } = message.data
        form.setFieldsValue({ path: fsPath })
        form.validateFields(['path'])
        break
      case 'getSamples':
        setBasicSample(message.data)
        break
      case 'createDone':
        setLoading(false)
        break
    }
  }

  const checkPath = (_rule: any, value: string, callback: (arg0?: string | undefined) => void) => {
    if (value && /\s/g.test(value)) {
      throw new Error('不支持带有空格的路径')
    }
    callback()
  }
  const selectDic = () => {
    postMessage('openFolder')
  }
  const onFinish = (values: any) => {
    setLoading(true)
    const params =
      aiSampleVal !== ''
        ? Object.assign(values, { http_url_to_repo: aiSampleVal.http_url_to_repo })
        : values
    postMessage('createApplication', params)
  }
  const preview = () => {
    postMessage('openSampleReadme', {
      path: sampleValue,
      url: aiSampleVal.readme_url || aiSampleVal.http_url_to_repo,
    })
  }
  const getAiSample = async () => {
    const res: any = await get('https://cloud.listenai.com/api/v4/groups/654/projects')
    console.log('https://cloud.listenai.com/api/v4/groups/654/projects',res)
    const list: any[] = res.filter((item: any) => item.tag_list.length !== 0) || []
    setAiSample(list)
  }
  const handleTypeChange = (value: string) => {
    setType(true)
    form.setFieldsValue({ sample: '',name:'' })
    setAiSampleVal('')

    value === 'basic' ? setSample(basicSample) : setSample(aiSample)
  }
  const handleChange = (value: { value: string; label: React.ReactNode }, option: any) => {
    const optionItem = option&&option.data && JSON.parse(option.data)
    option&&option.data ? setAiSampleVal(optionItem) : setAiSampleVal('')
    form.setFieldsValue({ name: value })
    
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
    getAiSample()
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
                    <Input.Group compact>
                      <Select
                        style={{ width: '40%' }}
                        placeholder='模板类型'
                        onChange={handleTypeChange}
                      >
                        <Option value='basic'>基础 Samples</Option>
                        <Option value='ai'>AI Samples</Option>
                      </Select>
                      <Form.Item name='sample' style={{ width: '60%' }}>
                        <Select
                          placeholder=''
                          allowClear
                          showSearch
                          onChange={handleChange}
                          disabled={!hasType}
                        >
                          {sample.map((item, key) => (
                            <Option key={key} value={item.name || item} data={JSON.stringify(item)}>
                              {item.name || item}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Input.Group>
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
