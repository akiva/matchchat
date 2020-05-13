const html = require('choo/html')
const sf = require('sheetify')
const prefix = sf('./styles.css')
const title = 'Welcome to MatchChat'

module.exports = function (state, emit) {
  if (state.title !== title) emit('DOMTitleChange', title)
  return html`<body>
    <main role="main" class=${prefix}>
      <h1>Welcome to MatchChat!</h1>
      <form onsubmit=${onSubmit}>
        <label>
          Please enter your name to join the chat queue:
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            required="true"
            autofocus="true"
            title="Username may not be blank."
            />
        </label>
        <button type="submit">Enter</button>
      </form>
    </main>
  </body>`

  function onSubmit (event) {
    event.preventDefault()
    const username = event.target.elements.username
    if (username.value.trim().length)
      return handleUsername(username.value.trim())
    else
      return document.forms[0].reportValidity()
  }

  function handleUsername (name) {
    return emit('ws:send', JSON.stringify({
      type:'user:join',
      name
    }))
  }
}
