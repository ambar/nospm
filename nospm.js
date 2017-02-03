let forEach = Function.call.bind([].forEach)

let removeSpm = (url, next) => {
  let search = url.search
  if (!search) return

  let query = parseQuery(search.slice(1))
  if (query.spm) {
    delete query.spm
    let param = toParam(query)
    next(url.origin + url.pathname + (param ? '?' + param : '') + url.hash)
  }
}

let parseQuery = (param) => {
  return param.split('&')
    .map((pair) => pair.split('='))
    .reduce((o, p) => { o[p[0]] = decodeURIComponent(p[1]); return o }, {})
}

let toParam = (object) => {
  return Object.keys(object)
    .map((key) => key + '=' + encodeURIComponent(object[key]))
    .join('&')
}

let removeLinkSpm = (link) => {
  removeSpm(link, (newUrl) => {
    link.href = newUrl
  })
}

let removeLocationSpm = () => {
  removeSpm(location, (newUrl) => {
    history.replaceState(null, document.title, newUrl)
  })
}

let isLink = (node) => {
  return node && node.nodeName === 'A'
}

let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    let type = mutation.type
    if (type === 'attributes') {
      if (mutation.attributeName === 'href' && isLink(mutation.target)) {
        removeLinkSpm(mutation.target)
      }
    } else if (type === 'childList' || type === 'subtree') {
      forEach(mutation.addedNodes, (node) => {
        if (isLink(node)) {
          removeLinkSpm(node)
        }
      })
    }
  })
})

observer.observe(document.body, {attributes: true, childList: true, subtree: true})
forEach(document.links, removeLinkSpm)
removeLocationSpm()
