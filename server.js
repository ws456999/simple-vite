const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const app = new Koa()
const { transformSync } = require('@babel/core')
const { esModuleBuild, preBuild } = require('./es-build')

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
    ctx.body = rewriteImport(result.code)
  } else if (url.startsWith('/@modules/')) {
    const modulesName = url.replace('/@modules/', '')
    const isJs = modulesName.indexOf('.js') > -1
    const body = fs.readFileSync(
      `${__dirname}/.gvite/${modulesName}${isJs ? '' : '.js'}`,
      'utf-8'
    )
    ctx.type = 'application/javascript'
    ctx.body = body
  } else if (url.endsWith('.css')) {
    const p = path.join(__dirname, url)
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
  }
})

function rewriteImport(content) {
  return content.replace(/ from ['"](\S.*\S)['"]/g, (s1, s2) => {
    if (s2.startsWith('.') || s2.startsWith('./') || s2.startsWith('../')) {
      if (!s2.endsWith('.ts') && !s2.endsWith('.tsx')) {
        let list = ['.ts', '.tsx']
        list.forEach((v) => {
          const isExist = fs.existsSync(__dirname, s2 + v)
          isExist && (end = v)
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
}

preBuild().then(v => {
  app.listen(3000, () => {
    console.log('start up!')
  })
})
