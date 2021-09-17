const fs = require('fs')
const path = require('path')
const { readBody } = require('./utils')
const { parse } = require('es-module-lexer')
const MargicString = require('magic-string')

module.exports = function ({ app, root }) {
  app.use(async (ctx, next) => {
    await next()

    if (ctx.body && ctx.response.is('js')) {
      const content = await readBody(ctx.body)
      ctx.body = rewriteImport(content, root)
    }
  })
}

function rewriteImport(content, root) {
  // 重写三方依赖
  let magicString = new MargicString(content)
  let imports = parse(content)[0]
  if (imports.length) {
    imports.forEach((item) => {
      const { s, e } = item
      let id = content.substring(s, e)
      const reg = /^[^\/\.]/
      if (reg.test(id)) {
        id = `/@modules/${id}`
        magicString.overwrite(s, e, id)
      }
    })
  }
  const s = magicString.toString()

  return s.replace(/ from ['"](\S.*\S)['"]/g, (s1, s2) => {
    // 如果是三方模块，返回
    if (s2.startsWith('/@modules')) {
      return s1
    }

    // 判断文件是否存在，如果省略后缀的话，自动补上;
    // 否则认为是静态资源，走import
    if (!s2.endsWith('.ts') && !s2.endsWith('.tsx')) {
      let list = ['.ts', '.tsx']
      let end = ''
      list.forEach((v) => {
        const isExist = fs.existsSync(path.join(root + '/src', s2 + v))
        isExist && (end = v)
      })
      if (end) {
        return s1.slice(0, -1) + end + s1.slice(-1)
      } else {
        return s1.slice(0, -1) + '?import' + s1.slice(-1)
      }
    }
    return s1
  })
}
