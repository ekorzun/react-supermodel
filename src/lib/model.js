import agent from 'superagent'
import aprefix from 'superagent-prefix'
import { expandURL } from './utils'
import ModelConnector from './model-connector'
import { getConfig } from './config'

class Model {

  constructor(opts) {
    this.name = opts.name
    this.idKey = opts.idKey || 'id'
    this.dataItemKey = opts.dataItemKey || 'data'
    this.dataListKey = opts.dataListKey || 'data'
    this.optimistic = opts.optimistic
    this._createApi(opts.api)
  }

  _createApi(api) {
    this.api = {}
    'get/list/create/update/delete'.split('/').forEach(method => {
      if (api[method]) {
        this.api[method] = this.createEndpoint(api[method])
      }
    })
  }

  createEndpoint(endpoint) {
    if (typeof endpoint === 'string') {
      const fn = params => expandURL(endpoint, params)
      return fn
    }
    const fn = params => expandURL(endpoint.url, params)
    fn.import = endpoint.import
    return fn
  }

  get(id) {
    const endpoint = this.api.get({ [this.idKey]: id })
    return this._makeRequest(endpoint, 'get', this.dataItemKey)
  }


  update(id, props) {
    props[this.idKey] = id
    const endpoint = this.api.update(props)
    return this._makeRequest(endpoint, 'update', this.dataItemKey)
  }

  create(props) {
    const endpoint = this.api.create(props)
    return this._makeRequest(endpoint, 'create', this.dataItemKey)
  }


  list(params) {
    const endpoint = this.api.list(params)
    const key = this.dataListKey
    return this._makeRequest(endpoint, 'list', key, items => {
      if (!Array.isArray(items)) {
        throw new Error(`Must be an array`)
      }
    })
  }

  delete(id, props = {}) {
    props[this.idKey] = id
    const endpoint = this.api.delete(props)
    return this._makeRequest(endpoint, 'delete', this.dataItemKey)
  }

  _makeRequest(endpoint, method, key, validate) {
    const { $onResponse, ...data } = endpoint.data
    return this._request(endpoint, data)
      .then(response => {
        const { body } = response
        $onResponse && $onResponse(body)
        const rawBody = body[key] || body
        // console.log('rawBody: ', key, rawBody)
        const importData = this.api[method].import
        const rawData = importData ? importData(rawBody) : rawBody
        validate && validate(rawData)
        return rawData
      })
  }


  _request({ method, url }, data) {
    const request = agent[method](url)
    if (data) {
      if (method === 'get') {
        request.query(data)
      } else {
        request.send(data)
      }
    }

    const accept = getConfig('accept')
    const withCredentials = getConfig('withCredentials')
    const prefix = getConfig('prefix')
    const auth = getConfig('auth')

    if (accept) {
      request.accept(accept)
    }
    if (withCredentials) {
      request.withCredentials()
    }
    if (prefix) {
      request.use(aprefix(typeof prefix === 'function' ? prefix() : prefix))
    }
    if (auth) {
      request.set(`Authorization`, typeof auth === 'function' ? auth() : auth)
    }
    return request
  }


  validate() { }
  isValid() { }
  createOrUpdate() { }
  getShema() { }
  createSchema() { }
  createConnector() { }


  getConnector() {
    if (this._connector) {
      return this._connector
    }
    return (this._connector = new ModelConnector(this))
  }
}


export default Model