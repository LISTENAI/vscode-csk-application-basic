import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import './index.less'
import { Button, Form, Row, Col, Select, ConfigProvider, Spin, message } from 'antd'
const { Option } = Select
import { postMessage } from '../../../utils'
const CreateApplication: React.FC = () => {
  const [form] = Form.useForm()
  const [boards, setBoards] = useState<string[]>([])
  const [originBoard, setOriginBoard] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)

  const getStyle = (str: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(str)
  }
  const handleMessagesFromExtension = (event: MessageEvent<Message>) => {
    const message = event.data
    console.log('message', message)
    switch (message.type) {
      case 'getBoards':
        const { board, list } = message.data
        setBoards(list)
        setOriginBoard(board)
        form.setFieldsValue({ board })
        setLoading(false)
        break
      case 'saveApplicationSetting':
        setBtnLoading(false)
        setOriginBoard(message.data)
        form.setFieldsValue({ board: message.data })
        break
      default:
        break
    }
  }

  const onFinish = (values: any) => {
    const { board } = values
    if (board !== originBoard) {
      showConfirm(values)
    } else {
      message.info(`当前应用版型已是${board}`)
    }
  }
  const saveHandle = (values: any) => {
    setBtnLoading(true)
    postMessage('saveApplicationSetting', values)
  }
  const showConfirm = (values: any) => {
    saveHandle(values)
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
    postMessage('getBoards')
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
            {/* <p className='application-type-explanation'></p> */}
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
                <Form.Item label='Board'>
                  <Form.Item
                    name='board'
                    noStyle
                    rules={[{ required: true, message: '请选择应用版型' }]}
                  >
                    <Select placeholder='' allowClear showSearch>
                      {boards.map((item, key) => (
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
