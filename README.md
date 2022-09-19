# yhtml

Tiny html tag function for rendering Web Component templates with event binding


### Introduction

This library implements a tag function to be used with custom elements. It brings sensible interpolation and event binding in just 481 bytes.  Rendering is via wholesale innerHTML replacement, but events are handled through event delegation, so they survive across renders.

```html
<my-counter></my-counter>

<script>
import html from 'yhtml'

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
</script>
```

### Installation

Install from the npm registry:
```
npm install yhtml
```

Or, of course your are free to embed it directly in your project.  Here is the library in its entirety:
```javascript
function html(s, ...e) {
  self.$e ||= (n, e, c=e.target) => {
    while (!c.tagName.match(/-/)) c = c.parentNode
    c[e.target.getAttribute(n)]?.call(c, e)
  }
  return new String(s
    .reduce((a,v,i) => a += v+[e[i]].flat()
    .map(x => x instanceof String ? x : x === 0 ? x : String(x || '')
    .replace(/[<>'"]/g, c => `&#${c.charCodeAt(0)}`)).join``, "")
    .replace(/( (@(\w+))=["'])/g, (_,v,m,n) =>
      document.body.setAttribute(`on${n}`,`$e('${m}',event)`)||v))
}
```

### Interpolation

This library brings a few nicities to interpolating html which are lacking by default with raw template strings.

Use short-circuit logic with `&&` when testing for truthiness:
```javascript
html`<div class="${isSelected && 'selected'}">`
```

Iterate over arrays of items with `map`:
```javascript
html`${items.map(item => html`<li>${item.title}</li>`)}`
```

Interpolated values are HTML-escaped by default.
```javascript
html`<span>Will be escaped: ${description}</span>`
```

To include html content as-is, invoke directly html as a function taking an array of raw content:
```javascript
html`<div>${html([sanitizedDescription])}</div>`
```

### Event binding

Bind events with `@event` attributes:

```javascript
class MyCounter extends HTMLElement {
  increment() {
    this.count++;
  },
  render() {
    html`<button @click="increment">+1</button>
  }
}
```

Events are handled via event delegation with handlers on window in order so that setting `innerHTML` in components can be as performant as possible.  As a consequence, any bound events must be ones that bubble.  So for example, instead of `focus` and `blur`, use `focusin` and `focusout`.


