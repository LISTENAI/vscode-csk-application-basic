import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { Button, Form, Row, Col, Select, ConfigProvider, Spin, message } from 'antd'
const { Option } = Select
import { postMessage } from '../../../utils'
const CreateApplication: React.FC = () => {
  const [form] = Form.useForm()
  const [boards, setBoards] = useState<string[]>([])
  const [runners, setRunners] = useState<string[]>([])
  const [originBoard, setOriginBoard] = useState<string>()
  const [originRunner, setOriginRunner] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)

  const getStyle = (str: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(str)
  }
  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    switch (message.type) {
      case 'saveApplicationSetting':
        const { board: boardRes, runner: runnerRes } = message.data
        setBtnLoading(false)
        boardRes && setOriginBoard(boardRes)
        runnerRes && setOriginRunner(runnerRes)
        boardRes && form.setFieldsValue({ board: boardRes })
        runnerRes && form.setFieldsValue({ runner: runnerRes })
        break
      case 'getSettings':
        const { runners, list, board, runner } = message.data
        setRunners(runners)
        setBoards(list)
        setOriginBoard(board)
        setOriginRunner(runner)
        form.setFieldsValue({ board, runner })
        setLoading(false)
        break
      default:
        break
    }
  }

  const onFinish = (values: any) => {
    saveHandle(values)
  }
  const saveHandle = (values: any) => {
    const { board, runner } = values
    let params = {}
    params = board !== originBoard ? Object.assign(params, { board }) : params
    params = runner !== originRunner ? Object.assign(params, { runner }) : params
    setBtnLoading(true)
    postMessage('saveApplicationSetting', params)
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
    postMessage('getSettings')
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
            <div className='layout__title'>应用配置</div>
            <p className='application-type-explanation'>* 配置烧录工具需要存在编译产物。</p>
            <Spin spinning={loading} wrapperClassName='loading-area'>
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
                <Form.Item label='版型'>
                  <Form.Item
                    name='board'
                    noStyle
                    rules={[{ required: true, message: '请选择应用版型' }]}
                  >
                    <Select placeholder='' showSearch>
                      {boards.map((item, key) => (
                        <Option key={key} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form.Item>
                <Form.Item label='烧录工具'>
                  <Form.Item
                    name='runner'
                    noStyle
                    rules={[{ required: false, message: '请选择烧录工具' }]}
                  >
                    <Select placeholder='' allowClear showSearch>
                      {runners.map((item, key) => (
                        <Option key={key} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form.Item>
                <Form.Item>
                  <Row gutter={6}>
                    <Col span={18}></Col>
                    <Col span={6}>
                      <Button
                        htmlType='submit'
                        block
                        className='confirm-button'
                        loading={btnLoading}
                      >
                        确认
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Spin>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
ReactDom.render(<CreateApplication />, document.getElementById('root'))
