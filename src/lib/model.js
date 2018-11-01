import agent from 'superagent'
import aprefix from 'superagent-prefix'
import asuffix from 'superagent-suffix'
import { expandURL } from './utils'
import ModelConnector from './model-connector'
import { getConfig } from './config'
import Emmett from 'emmett'

class Model extends Emmett {

  constructor(opts) {
    super()
    this.name = opts.name
    this.idKey = opts.idKey || 'id'
    this.dataItemKey = opts.dataItemKey || 'data'
    this.dataListKey = opts.dataListKey || 'data'
    this.optimistic = opts.optimistic !== undefined ? opts.optimistic : {}
    this._createApi(opts.api)
  }

  _createApi(api) {
    this.api = {}
    Object.keys(api).forEach(method => {
      this.api[method] = this.createEndpoint(api[method])
      if(!this[method]){
        this._createApiMethod(method)
      }
    })
  }

  _createApiMethod(method) {
    alert(`Unsupported`)
    this[method] = (...args) => {
      const endpoint = this.api[method].apply(this, args)
      return endpoint
    }
  }

  createEndpoint(endpoint) {
    if (typeof endpoint === 'string') {
      const fn = params => expandURL(endpoint, params)
      return fn
    }
    const fn = params => expandURL(endpoint.url, params)
    fn.import = endpoint.import
    fn.append = endpoint.append
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
    this.emit(`${method}Before`, endpoint.data)
    const { $onResponse, ...data } = endpoint.data
    const append = getConfig('append')
    if(append) {
      const appendedData = typeof append === 'function' ? append(endpoint.originalData, this, method) : append
      Object.assign(data, appendedData)
    }
    return this.request(endpoint, data)
      .catch(err => {
        this.emit(`${method}Error`, err)
        throw err
      })
      .then(response => {
        const { body } = response
        this.emit(`${method}Success`, body)
        $onResponse && $onResponse(body)
        const rawBody = body[key] || body
        // console.log('rawBody: ', key, rawBody)
        const importData = this.api[method].import
        const rawData = importData ? importData(rawBody) : rawBody
        validate && validate(rawData)
        return rawData
      })
  }


  request({ method, url }, data) {
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
    const suffix = getConfig('suffix')
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
    if (suffix) {
      request.use(asuffix(typeof suffix === 'function' ? suffix() : suffix))
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