const { readBody } = require('./utils')
const path = require('path')
const fs = require('fs')

module.exports = function svgResolvelugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.svg')) {
      if ('import' in ctx.query) {
        ctx.type = 'application/javascript'
        ctx.body = `export default "${
          path.join(root, ctx.path)
        }"`
      } else {
        ctx.type = 'image/svg+xml'
        ctx.body = fs.createReadStream(path.join(ctx.path.split('?')[0]))
      }
    } else {
      await next()
    }
  })
}
