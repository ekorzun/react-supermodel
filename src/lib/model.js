import Emmett from 'emmett'
import aprefix from 'superagent-prefix'
import asuffix from 'superagent-suffix'
import { expandURL } from './utils'
import ModelConnector from './model-connector'
import { getConfig } from './config'


class Model extends Emmett {

  constructor(opts) {
    super()
    this.agent = getConfig('agent')
    this.name = opts.name
    this.idKey = opts.idKey || 'id'
    this.dataItemKey = opts.dataItemKey || 'data'
    this.dataListKey = opts.dataListKey || 'data'
    this.optimistic = opts.optimistic !== undefined ? opts.optimistic : {}
    this.attributes = opts.attributes
    this._createApi(opts.api)
  }

  _createApi(api) {
    this.api = {}
    Object.keys(api).forEach(method => {
      // console.log('method: ', method);
      this.api[method] = this.createEndpoint(api[method])
      if(!this[method]){
        this._createApiMethod(method)
      }
    })
  }

  _createApiMethod(method) {
    // console.log('method: ', method);
    this[method] = (data) => {
      // const endpoint = this.api[method].call(this, data)
      return this._makeRequest(data, method)
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
    
    if(fn.store) {
      if(typeof fn.store === 'string') {
        this.getConnector().$state.set(fn.store, {
          data: null
        })
      }
      throw new Error(`Unsupported store type. Must be string`)
    }

    return fn
  }

  get(id) {
    return this._makeRequest({ [this.idKey]: id }, 'get', this.dataItemKey)
  }


  update(id, props) {
    props[this.idKey] = id
    return this._makeRequest(props, 'update', this.dataItemKey)
  }

  create(props) {
    return this._makeRequest(props, 'create', this.dataItemKey)
  }


  list(params) {
    return this._makeRequest(params, 'list', this.dataListKey, items => {
      if (!Array.isArray(items)) {
        throw new Error(`Must be an array`)
      }
    })
  }

  delete(id, props = {}) {
    props[this.idKey] = id
    return this._makeRequest(props, 'delete', this.dataItemKey)
  }

  _makeRequest(payload, method, key, validate) {
    payload = payload || {}
    const append = getConfig('append')
    
    
    if(append) {
      const appendedData = typeof append === 'function' ? append(payload, this, method) : append
      Object.assign(payload, appendedData)
    }
    
    this.emit(`${method}Before`, payload)
    const { $onResponse, ...data } = payload
    const endpoint = this.api[method](data)
    // console.log('endpoint: ', endpoint);

    return this.request(endpoint, endpoint.data, payload)
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


  request({ method, url }, data, originalData) {
    const request = this.agent[method](url)

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
      request.set(`Authorization`, typeof auth === 'function' ? auth({
        ...data, 
        ...originalData
      }, data, originalData) : auth)
    }

    if (data) {
      if (method === 'get') {
        request.query(data)
      } else {
        request.send(data)
      }
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