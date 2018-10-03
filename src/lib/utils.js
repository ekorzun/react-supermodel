
const REGEX_HAS_PARAMS = /\?\w+=/
const REGEX_URL_VALUE = /:([\w_]+)/gi
const REGEX_URL_QUERY = /([?&])([\w_-]+)=:([\w_-]+)/gi


const addURLParam = (url, param, value) =>
  `${url}${REGEX_HAS_PARAMS.test(url) ? '&' : '?'}${param}=${value}`

export const expandURL = (url, data = {}, method = 'get') => {

  const usedKeys = {}
  const tmp = url.split(' ')
  if (tmp.length > 1) {
    method = tmp[0].toLowerCase()
    url = tmp[1]
  }
  url = url
    .replace(REGEX_URL_VALUE, (match, dataKey) => {
      if (data[dataKey] !== undefined) {
        usedKeys[dataKey] = true
        return data[dataKey]
      }
      return ''
    })
    .replace(REGEX_URL_QUERY, (match, prefix, parameter, dataKey) => {
      if (data[dataKey] !== undefined) {
        usedKeys[dataKey] = true
        return `${prefix}${parameter}=${data[dataKey]}`
      }
      return ''
    })
  // Adding other params from data by key
  if (method === 'get') {
    for (let dataKey of Object.keys(data).filter(k => !usedKeys[k])) {
      if (data[dataKey] !== undefined) {
        url = addURLParam(url, dataKey, data[dataKey])
      }
    }
  }

  const dataWithoutUnusedKeys = Object
    .keys(data)
    .filter(key => !usedKeys[key])
    .reduce((acc, key) => {
      acc[key] = data[key]
      return acc
    }, {})

  // console.log('{method, route: url}: ', { method, route: url })
  return { method, url, data: dataWithoutUnusedKeys }

}