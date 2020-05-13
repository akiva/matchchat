const argv = require('minimist')(process.argv.slice(2), {
  alias: { p: 'port' },
  default: { p: 8000 },
})

process.title = require('./package.json').name

const server = require('./lib/server')

server.listen(process.env.PORT || argv.port, () =>
  console.log(`Server running at http://localhost:${server.address().port}`)
)

require('./lib/socket/server')(server)
