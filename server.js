const Koa = require('koa')
const htmlRewritePlugin = require('./plugins/htmlResolvePlugin')
const serveStaticPlugin = require('./plugins/serveStaticPlugin')
const tsRewritePlugin = require('./plugins/tsResolvePlugin')
const rewriteModulePlugin = require('./plugins/rewriteModulePlugin')
const moduleResolvePlugin = require('./plugins/moduleResolvePlugin')
const cssRewritePlugin = require('./plugins/cssRewritePlugin')
const svgResolvePlugin = require('./plugins/svgResolvePlugin')
const { preBuild } = require('./es-build');

function createServer() {
  const app = new Koa()
  const root = process.cwd()
  const context = {
    app,
    root,
  }

  const resolvePlugins = [
    // 重写html，插入需要的代码
    htmlRewritePlugin,
    cssRewritePlugin,
    svgResolvePlugin,
    rewriteModulePlugin,
    tsRewritePlugin,
    moduleResolvePlugin,
    serveStaticPlugin,
  ]
  resolvePlugins.forEach((f) => f(context))
  return app
}

preBuild().then((v) => {
  createServer().listen(3000, () => {
    console.log('start up!')
  })
})
