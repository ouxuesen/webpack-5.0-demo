async function getCompoment() {
  const { default: _ } = await import('lodash')
  const element = document.createElement('br')
  const divEle = document.createElement('p')
  divEle.innerHTML = _.join(['annter', 'app', " "])
  return [element, divEle]
}
getCompoment().then((elements) => {
  elements.forEach(ele => {
    let dom = document.body
    dom.appendChild(ele)
  })
})