const { createJSDocImplementsTag } = require("typescript")

const treeDTO = []
const baseData = [
  'a/b/c/d/e',
  'a/b/e/f/g',
  'a/b/h',
  'a/i/j',
  'a/i/k'
]
baseData.forEach(item => {
  const nodeArray = item.split('/')
  let children = treeDTO
  for (const i of nodeArray) {
    const node = {
      label: i
    }
    if (children.length === 0) {
      children.push(node)
    }
    let isExist = false
    for (const j in children) {
      if (children[j].label === node.label) {
        if (!children[j].children) {
          children[j].children = []
        }
        children = children[j].children
        isExist = true
        break
      }
    }
    if (!isExist) {
      children.push(node)
      if (!children[children.length - 1].children) {
        children[children.length - 1].children = []
      }
      children = children[children.length - 1].children
    }
  }
})

console.log(JSON.stringify(treeDTO))