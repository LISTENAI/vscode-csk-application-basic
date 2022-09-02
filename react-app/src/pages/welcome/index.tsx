import React from 'react'
import ReactDom from 'react-dom'
import './welcome.css'
const Welcome: React.FC = () => {
  const openHandle = () => {
     vscode.postMessage({
       type: 'executeCommand',
       data: 'csk-application-basic.open-application',
     })
  }
  const createHandle = () => {
       vscode.postMessage({
         type: 'executeCommand',
         data: 'csk-application-basic.create-application',
       })
  }
  return (
    <div className='layout layout--welcome-page'>
      <div className='layout__body'>
        <div className='layout__inner-body'>
          <div className='layout__title'>Csk Application for VS Code</div>
          {/* <section>
              <div className='quick-setup-header'>
                <h2 id='quickSetup'>
                  Quick Setup <div className='chevron'></div>
                </h2>
              </div>
            </section> */}
          <section>
            <h2>Getting Started</h2>
            <ul className='getting-started-buttons'>
              {/* <li id='walkthrough'>
                  <div className='codicon codicon-checklist'></div>
                  <span className='link-button'>Open walkthrough...</span>
                </li>
                <li id='devAcademy'>
                  <div className='codicon codicon-book'></div>
                  <span className='link-button'>Open Nordic DevAcademy...</span>
                </li> */}
              <li id='addExistingApp'>
                <div className='codicon codicon-plus'></div>
                <span className='link-button' onClick={openHandle}>
                  打开应用项目...
                </span>
              </li>
              <li id='createNewApp'>
                <div className='codicon codicon-wand'></div>
                <span className='link-button' onClick={createHandle}>
                  创建应用项目...
                </span>
              </li>
              {/* <li id='addExistingApp'>
                  <div className='codicon'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 16 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M1 14.5V5H2V14H10V12H6.91465C6.70873 12.5826 6.15311 13 5.5 13C4.67157 13 4 12.3284 4 11.5C4 10.6716 4.67157 10 5.5 10C6.15311 10 6.70873 10.4174 6.91465 11H10.5L11 11.5V14H14V4H8V3H14.5L15 3.5V14.5L14.5 15H1.5L1 14.5ZM9.5 6C8.84689 6 8.29127 6.4174 8.08535 7H5.5V8H8.08535C8.29127 8.5826 8.84689 9 9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6ZM9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8ZM6 11.5C6 11.7761 5.77614 12 5.5 12C5.22386 12 5 11.7761 5 11.5C5 11.2239 5.22386 11 5.5 11C5.77614 11 6 11.2239 6 11.5Z'
                        fill='#424242'
                      ></path>
                      <path d='M7 3H4V0H3V3H0V4H3V7H4V4H7V3Z' fill='#424242'></path>
                    </svg>
                  </div>
                  <span className='link-button'>Create a new board...</span>
                </li> */}
            </ul>
          </section>
          <section>
            <h2>资料</h2>
            <p>
              为了进一步了解Csk Application及其功能, 请查看
              <br />
              <a href='https://docs.listenai.com/chips/600X/overview/chips'>CSK芯片开发文档</a>.
            </p>
          </section>
          <section>
            <div className='checkbox-container'>
              {/* <input
                type='checkbox'
                className='checkbox codicon codicon-check'
                id='showOnStartup'
              /> */}
              {/* <label htmlFor='showOnStartup'>启动时显示欢迎页面</label> 
               <input type="checkbox" className="checkbox codicon codicon-check"
                    for="showOnStartup"/>
                    <label htmlFor="">Show welcome
                    page on startup</label> */}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
ReactDom.render(<Welcome />, document.getElementById('root'))
