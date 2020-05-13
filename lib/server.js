const http = require('http')
const fs = require('fs')
const path = require('path')
const trumpet = require('trumpet')()
const browserify = require('browserify')
const app = require('./app')
const sheetify = require('sheetify')
const { pipeline } = require('stream')

module.exports = http.createServer((req, res) => {
  if (req.url === '/favicon.ico')
    return res.statusCode = 204 && res.end()

  if (req.url === '/bundle.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
    return pipeline(
      browserify('./lib/app', { debug: true })
        .transform('sheetify/transform')
        .bundle(),
      res,
      err => err
        ? console.error('Browserify pipeline failed.', err)
        : console.log('Browserify pipeline succeeded.')
    )
  }

  const state = {}
  const html = app.toString(req.url, state)
  const tr = trumpet.select('body').createWriteStream({ outer: true })
  res.writeHead(200, { 'Content-Type': 'text/html' })
  pipeline(
    fs.createReadStream(path.resolve('./static/index.html')),
    tr,
    res,
    err => err
      ? console.error('HTML pipeline failed.', err)
      : console.log('HTML pipeline succeeded.')
  )
})
