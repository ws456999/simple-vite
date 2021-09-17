const { readBody } = require('./utils')
const { transformSync } = require('@babel/core')
const fs = require('fs')
const path = require('path')

module.exports = function tsRewritePlugin ( { app, root }) {
  app.use(async(ctx, next) => {
    if (ctx.path.endsWith('.ts') || ctx.path.endsWith('.tsx')) {
      const p = path.join(root, ctx.path)
      const code = fs.readFileSync(p, 'utf8')
      const parserPlugins = [
        'jsx',
        'importMeta',
        'topLevelAwait',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'typescript',
        'decorators-legacy',
      ]

      const result = transformSync(code, {
        babelrc: false,
        configFile: false,
        // filename: id,
        parserOpts: {
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
          decoratorsBeforeExport: true,
        },
        plugins: [require('@babel/plugin-transform-react-jsx')],
        sourceMaps: true,
      })
      ctx.type = 'application/javascript'
      ctx.body = result.code
    } else {
      return next();
    }
  })
}