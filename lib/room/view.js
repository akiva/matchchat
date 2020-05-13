const html = require('choo/html')
const sf = require('sheetify')
const prefix = sf('./styles.css')
const title = 'MatchChat'

module.exports = function (state, emit) {
  if (state.title !== title) emit('DOMTitleChange', title)

  return html`<body>
    <main role="main" class=${prefix}>
      ${heading(state.user.name)}
      ${status(state.room.roommate)}
      ${html`<dl id="messages">
        ${state.room.messages.length
          ? html`${state.room.messages.map(showMessage)}`
          : ''
        }
      </dl>`}
      ${commands()}
      <form onsubmit=${onSubmit}>
        <input
          type="text"
          name="message"
          placeholder="Enter a message"
          required="true"
          autofocus="true"
          title="Message may not be blank."
          disabled="${state.room.roommate && state.room.roommate.id ? false : true}"
          onkeydown=${onKeyDown}
          />
        <button type="submit">Send</button>
      </form>
    </main>
  </body>`

  function onKeyDown (event) {
    if (event.key !== 'Enter') {
      // TODO Handle actively typing notification for roommate
      // ie. "Bob is typing a message…"
    }
  }

  function onSubmit (event) {
    event.preventDefault()
    let messageElement = event.target.elements.message
    if (messageElement.value.trim().length)
      return handleMessageSend(messageElement.value.trim())
    return document.forms[0].reportValidity()
  }

  function handleMessageSend (msg) {
    // Detect if a command (close|leave) was issued
    const cmd = (/^\/(close ?|leave ?)/i).exec(msg)
    // Strip command text from rest of message
    if (cmd) msg = msg.replace(cmd[0], '')
    const type = cmd && /(close|leave)/i.test(cmd[1].split(' ')[0])
      ? 'leave'
      : 'message'
    const data = {
      type,
      sender: {
        id: state.user.id,
        name: state.user.name,
      },
    }
    if (type === 'message') data.message = msg
    return emit('ws:send', JSON.stringify(data))
  }

  function showMessage (message, index) {
    function getSender(message) {
      return message.type === 'room:abandoned'
        ? 'MatchChat'
        : message.sender.id === state.user.id ? 'You' : message.sender.name
    }
    const sender = getSender(message)
    return html`
      <dt>${sender}:</dt>
      <dd>${message.message}</dd>
    `
  }
}

function heading (name) {
  return html`<h1>Welcome to MatchChat${name ? ', ' + name : ''}!</h1>`
}

function commands () {
  return html`<p>
    You may type <code>/leave</code> or <code>/close</code> to attempt
    repairing with—or waiting for—another available chat user.
  </p>`
}

function status (roommate) {
  const text = roommate && roommate.name
    ? 'You are chatting with ' + roommate.name
    : 'You are in queue to speak with the next available user'
  return html`<p><strong>${text}</strong></p>`
}
