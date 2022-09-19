export default function html(s, ...e) {
  self.$e ||= (n,e,c=e.target) => {
    while (!c.tagName.match(/-/)) c = c.parentNode
    c[e.target.getAttribute(n)]?.call(c,e)
  }
  return new String(s
    .reduce((a,v,i) => a += v+[e[i]].flat()
    .map(x => x instanceof String ? x : x === 0 ? x : String(x || '')
    .replace(/[<>'"]/g, c => `&#${c.charCodeAt(0)}`)).join``, "")
    .replace(/( (@(\w+))=["'])/g, (_,v,m,n) =>
      document.body.setAttribute(`on${n}`,`$e('${m}',event)`)||v))
}

