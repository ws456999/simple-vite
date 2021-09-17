const { readBody } = require('./utils')
const path = require('path')
const fs = require('fs')

module.exports = function htmlRewritePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.css')) {
      const p = path.join(root, ctx.path)
      const file = fs.readFileSync(p, 'utf-8')
      const content = `
            const css = \`${file}\`
            const link = document.createElement('style')
            link.setAttribute('type', 'text/css')
            link.innerHTML = css
            document.head.appendChild(link)
          `

      ctx.type = 'application/javascript'
      ctx.body = content
    } else {
      await next()
    }
  })
}
