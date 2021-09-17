/*
 * @@Author: mingo.wang
 * @Date: 2021-09-17 10:02:43
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-09-17 11:13:37
 * @Description: 头部注释
 */
const { readBody } = require('./utils')
const fs = require('fs')
const { parse } = require('es-module-lexer')
const MargicString = require('magic-string')

module.exports = function moduleResolvePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    await next()
    if (ctx.path.startsWith('/@modules/')) {
      const modulesName = ctx.path.replace('/@modules/', '')
      const isJs = modulesName.indexOf('.js') > -1
      const body = fs.readFileSync(
        `${root}/.gvite/${modulesName}${isJs ? '' : '.js'}`,
        'utf-8'
      )
      ctx.type = 'application/javascript'
      // 处理module里面的依赖
      ctx.body = rewriteNodeModulesImport(body)
    }
  })
}

function rewriteNodeModulesImport(content) {
  let magicString = new MargicString(content)
  let imports = parse(content)[0]
  if (imports.length) {
    imports.forEach((item) => {
      const { s, e } = item
      let id = content.substring(s, e)
      id = `/@modules/${id}`.replace('./', '')
      magicString.overwrite(s, e, id)
    })
  }

  return magicString.toString()
}
