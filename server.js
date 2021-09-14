const Koa = require('koa')
const fs = require('fs')
const app = new Koa()

app.use(async (ctx) => {
  const { url } = ctx.request


  if (url === '/') {
    const body = fs.readFileSync('./index.html')
    ctx.type = 'text/html'
    ctx.body = body
  }
})

app.listen(3000, () => {
  console.log('start up!')
})