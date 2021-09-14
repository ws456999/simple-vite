const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()
const { transformSync } = require('@babel/core')

app.use(async (ctx) => {
  const { url } = ctx.request


  if (url === '/') {
    const body = fs.readFileSync('./index.html')
    ctx.type = 'text/html'
    ctx.body = body
  } else if (url.endsWith('.tsx') || url.endsWith('.ts')) {
    const p = path.join(__dirname, url)

    const code = fs.readFileSync(p, 'utf8')

    const parserPlugins = [
      'jsx',
      'importMeta',
      // since the plugin now applies before esbuild transforms the code,
      // we need to enable some stage 3 syntax since they are supported in
      // TS and some environments already.
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
      plugins: [
        require('@babel/plugin-transform-react-jsx'),
        // require('@babel/plugin-transform-react-jsx-self'),
        // require('@babel/plugin-transform-react-jsx-source'),
      ],
      sourceMaps: true,
    })
    ctx.type = 'application/javascript'
    ctx.body = result.code;
  }
})

app.listen(3000, () => {
  console.log('start up!')
})