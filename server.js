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
    ctx.body = rewriteImport(result.code);
  }
})

function rewriteImport (content) {
  return content.replace(/ from ['"](\S.*\S)['"]/g, (s1, s2) => {
    if (s2.startsWith('.') || s2.startsWith('./') || s2.startsWith('../')) {
      if (!s2.endsWith('.ts') && !s2.endsWith('.tsx' )) {
        let list = ['.ts', '.tsx'];
        list.forEach((v) => {
          const isExist = fs.existsSync(__dirname, s2 + v);
          isExist && (end = v);
        })
        if (end) {
          return s1.slice(0, -1) + end + s1.slice(-1)
        }
      }
      return s1
    } else {
      return ` from '/@modules/${s2}'`
    }
  })
};

app.listen(3000, () => {
  console.log('start up!')
})