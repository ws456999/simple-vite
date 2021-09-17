const { readBody } = require('./utils')

module.exports = function htmlRewritePlugin ( { app }) {
  app.use(async(ctx, next) => {
    await next();
    if (ctx.response.is('html')) {
      let html = await readBody(ctx.body);
      ctx.body = html
    }
  })
}