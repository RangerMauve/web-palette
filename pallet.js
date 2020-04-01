const style = `
.web-palette-extension-palette {
  z-index: 99999999999999999999;

  position: fixed;
  left: 0;
  right: 0;
  top: 0px;
  margin: 0px auto;

  max-width: 420px;
  max-height: 80vh;

  overflow-y: auto;
  display: flex;
  flex-direction: column;

  background: rgba(0,0,0,0.7);
}

.web-palette-extension-button {
  background: none;
  border: 1px solid white;
  margin: 0px;
  padding: 1em;
  color: white;
  font-size: inherit;
}

.web-palette-extension-matcher {
  background: none;
  border: 1px solid white;
  margin: 0px;
  padding: 1em;
  color: white;
  font-size: inherit;}

.web-palette-extension-button:focus {
  background: white;
  color: black;
}
`

const PALETTE_ID = 'WEB_PALETTE_BOX'

const DEFAULT_COMMANDS = []

let displaying = false

window.addEventListener('keyup', onKeyPress)

const styleSheet = document.createElement('style')
styleSheet.appendChild(document.createTextNode(style))

document.querySelector('head').appendChild(styleSheet)

function getButtonCommands () {
  const buttons = [...document.querySelectorAll('button,[role=button],a,input,textarea')]

  return buttons.map((button) => {
    const label = getLabel(button)
    const command = () => button.focus()

    return { label, command, element: button }
  }).filter(({ element, label }) => label && isVisible(element))
}

function isVisible (element) {
  if (element.getAttribute('aria-hidden') === 'true') return false
  if (element.hasAttribute('hidden')) return false

  return true
}

function getLabel (element) {
  if (element.hasAttribute('aria-label')) return element.getAttribute('aria-label')
  if (element.title) return element.title

  // Special cases for input elements in a form
  if ((element.nodeName === 'INPUT') || (element.nodeName === 'TEXTAREA')) {
    if (element.id) {
      const label = document.querySelector(`[for="${element.id}"]`)
      if (label) return label.innerText
    }

    const parent = element.parentElement

    if (parent.nodeName === 'LABEL') {
      return parent.innerText
    }

    if (element.placeholder) return element.placeholder
  }

  if (element.innerText) return element.innerText
  if (element.id) return element.id
  if (element.name) return element.name

  return ''
}

function showPalette () {
  if (displaying) return
  displaying = true

  const commands = DEFAULT_COMMANDS.concat(getButtonCommands())

  const palette = buildPallette(commands)

  document.body.appendChild(palette)

  palette.firstElementChild.focus()
}

function buildPallette (commands) {
  const element = document.createElement('div')

  element.id = PALETTE_ID

  element.classList.add('web-palette-extension-palette')

  const matcher = document.createElement('input')

  matcher.classList.add('web-palette-extension-matcher')

  let filter = null

  matcher.oninput = updateFilter
  matcher.onkeyup = checkEnterAndSubmit

  element.appendChild(matcher)

  addButtons()

  return element

	function checkEnterAndSubmit(event) {
		const {key} = event

		if(key === "Enter") {
			element.querySelector('button').click()
		}
	}

	function updateFilter() {
    const value = matcher.value

    if (!value) {
      filter = null
    } else {
      const regexText = value.split(' ').reduce((result, letter) => `${result}.*${letter}`)
      filter = new RegExp(regexText, 'iu')
    }

    clearButtons()
    addButtons()
	}

  function clearButtons () {
    for (const button of element.querySelectorAll('button')) {
      element.removeChild(button)
    }
  }

  function addButtons () {
    for (const { label, command } of commands) {
      const button = document.createElement('button')

      if (filter) {
        const matches = label.match(filter)
        if (!matches) continue
      }

      button.innerText = label
      button.onclick = () => {
        command()
        hidePalette()
      }

      button.classList.add('web-palette-extension-button')

      element.appendChild(button)
    }
  }
}

function hidePalette () {
  if (!displaying) return
  displaying = false

  const palette = document.getElementById(PALETTE_ID)

  document.body.removeChild(palette)
}

function togglePalette () {
  if (displaying) hidePalette()
  else if (!displaying) showPalette()
}

function onKeyPress (event) {
  const { ctrlKey, key } = event

  if (ctrlKey && (key === 'e')) {
    togglePalette()
    event.stopPropagation()
  } else if (key === 'Escape') {
    hidePalette()
  }
}
