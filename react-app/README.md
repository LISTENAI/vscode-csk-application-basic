基于`Webpack 5`，`TypeScript`,`React`的`MPA`多页面应用实践配置

- `react`
- `webpack`
- `typescript`
- `sass`
- `eslint`
- `prettierrc`

## Usage

```shell


yarn 安装依赖

yarn dev 启动开发环境

yarn build 构建生产环境包

yarn build-all  构建所有页面生产环境包
```

推荐使用`yarn`基于项目`yarn.lock`替代`npm`进行项目环境安装

## Documentation
- `src/pages` 目录对应不同页面业务逻辑目录,每个`page`下分别包含:
  - `assets`静态资源目录
  - `views`不同路由页面配置
  - `styles`当前模块下的样式文件列表
  - `index.tsx`
  - `index.scss|less`当前模块下的入口`scss|less`文件。(当前模块所有`scss|less`文件都需要在此文件引入，并且该位置必须要在`container/**/index.scss|less`)。
- `src/layout` 目录对应公用`layout`配置
- `layout`对应的样式文件需要单独在每个模块的入口文件中引入。
- `src/styles` 存放全局公用`variable`以及`mixins`,`reset`相关公用样式。

## 快速上手

- `src/pages` 页面级别入口文件目录放置。
- `src/styles` 页面级别`scss|less`工具方法
- `src/utils` 页面级别`js`工具方法

> `src`级别目录可以通过`alias`进行访问

> 比如`src/**`->`@src/**`,`src/components/**`->`@components/**`...

## 开发

- `yarn dev`

项目会根据`pages`中的文件夹内容动态读取页面文件夹个数提供用于使用者选择，最终生成多页应用开发环境。

## 构建

- `yarn build`

项目会根据`pages`中的文件夹内容动态读取页面文件夹个数提供用于使用者选择，最终构建生成多页应用生产包。

- `yarn build-all`

构建项目中所有应用。

## 更新日志


- `dev`模式下增加`eslint-webpack-plugin`检测并`autofix`代码。
