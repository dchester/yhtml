import assert from 'assert'
import { suite } from './index.js'
import { parseHTML } from 'linkedom'
import html from '../yhtml.js'

function setup() {
  const { document, HTMLElement, customElements, window } = parseHTML(`<html><body></body></html>`)
  global.customElements = customElements
  global.document = document
  global.HTMLElement = HTMLElement
  global.self = window
}

setup();

function strip(str) {
  return str.replace(/\s+/msg, '')
}

suite('main', async test => {

  await test('render', async () => {
    class MyCounter extends HTMLElement {
      state = { count: 0 }
      increment() {
        this.state.count++
        this.render()
      }
      connectedCallback() {
        this.render()
      }
      render() {
        this.innerHTML = html`
          <button @click="increment">
            ${this.state.count}
          </button>
        `
      }
    }

    customElements.define('my-counter', MyCounter)
    const el = document.createElement('my-counter')
    document.body.appendChild(el)
    assert(el instanceof HTMLElement, 'we have an HTMLElement instance')
    assert.equal(strip(el.innerHTML), strip('<button @click="increment">0</button>'))
  })

  await test('escape', async () => {
    class MyDescription extends HTMLElement {
      connectedCallback() {
        this.render()
      }
      render() {
        const description = 'the <i>best</i>';
        this.innerHTML = html`
          <div id="safe">${description}</div>
          <div id="danger">${html([description])}</div>
        `
      }
    }

    customElements.define('my-description', MyDescription)
    const el = document.createElement('my-description')
    document.body.appendChild(el)
    await new Promise(r => setTimeout(r, 1000))
    assert.equal(strip(el.querySelector('#safe').innerText), strip('the <i>best</i>'));
    assert.equal(strip(el.querySelector('#danger').innerHTML), strip('the <i>best</i>'));
  })

})

