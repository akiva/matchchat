const choo = require('choo')
const html = require('choo/html')
const sheetify = require('sheetify')
const app = choo()

sheetify('normalize.css')
sheetify('./style.css')

if (process.env.NODE_ENV !== 'production')
  app.use(require('choo-devtools')())
app.use(require('../socket/client/store'))
app.use(require('../room/store'))
app.use(require('../login/store'))

const auth = view => (state, emit) => state.user.loggedIn
  ? view(state, emit)
  : require('../login/view')(state, emit)

app.route('/', auth(require('../room/view')))
app.route('/404', notFound)
app.route('/*', notFound)

function notFound () {
  return html`<body>
    <p>404 Not Found</p>
  </body>`
}

module.exports = app.mount('body')
