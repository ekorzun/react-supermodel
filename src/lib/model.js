import Emmett from 'emmett'
import aprefix from 'superagent-prefix'
import asuffix from 'superagent-suffix'
import { expandURL } from './utils'
import ModelConnector from './model-connector'
import { getConfig } from './config'


class Model extends Emmett {

  constructor(opts) {
    super()
    if (!opts.name) {
      throw new Error('name prop is missing')
    }
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
        this._createApiMethod(method, endpoint)
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

    const fn = params => typeof endpoint.url === 'string' 
       ? expandURL(endpoint.url, params)
      : expandURL(endpoint.url(params, endpoint), params)

    fn.import = endpoint.import
    fn.export = endpoint.export
    fn.append = endpoint.append
    fn.accept = endpoint.accept || getConfig('accept')
    fn.encoding = endpoint.encoding || getConfig('encoding')
    fn.isBinary = endpoint.isBinary

    if(endpoint.isGetter) {
      this
        .getConnector()

    }
    
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
    const type = typeof id
    const params = (type === 'string' || type === 'number')
      ? {[this.idKey]: id}
      : id
    return this._makeRequest(params, 'get', this.dataItemKey)
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
    const fn = this.api[method]

    payload = (fn && fn.export) ? fn.export((payload || {})) : (payload || {})

    
    const append = getConfig('append')
    const getError = getConfig('getError')
    
    
    if(append) {
      const appendedData = typeof append === 'function' ? append(payload, this, method) : append
      Object.assign(payload, appendedData)
    }

    this.emit(`${method}Before`, payload)
    const { $onResponse, ...data } = payload
    

    const endpoint = fn(data)
    // console.log('endpoint: ', endpoint);

    return this.request(endpoint, endpoint.data, payload, fn)
      .then(response => {
        const err = getError(response)
        if (err) {
          throw err
        }
        return response
      })
      .catch(err => {
        this.emit(`${method}Error`, err)
        throw err
      })
      .then(response => {
        const { body } = response
        if( body ) {
          this.emit(`${method}Success`, body)
          $onResponse && $onResponse(body)
          const rawBody = body[key] || body
          // console.log('rawBody: ', key, rawBody)
          const importData = this.api[method].import
          const rawData = importData ? importData(rawBody) : rawBody
          validate && validate(rawData)
          return rawData
        }
        return response
      })
  }


  request({ method, url }, data, originalData, fn) {
    let request = this.agent[method](url)

    const accept = getConfig('accept')
    const withCredentials = getConfig('withCredentials')
    const prefix = getConfig('prefix')
    const suffix = getConfig('suffix')
    const auth = getConfig('auth')
    const headers = getConfig('headers')
    const unsetHeaders = getConfig('unsetHeaders')

    if (fn.isBinary) {
      request
        .responseType('blob')
        // .parse((res, callback) => {
        //   res.data = ''
        //   res.setEncoding('binary')
        //   res.on('data', (chunk) => {
        //     res.data += chunk
        //   })
        //   res.on('end', () => {
        //     callback(null, new Buffer(res.data, 'binary'));
        //   })
        // })
        // .buffer()
    }

    if (accept) {
      const _accept = typeof accept === 'function' ? accept({ method, url }, data, originalData) : accept
      request.accept(_accept)
    }
    if (withCredentials) {
      request.withCredentials(
        typeof withCredentials === 'function' ? withCredentials({ method, url }, data, originalData) : withCredentials
      )
    }
    if (prefix) {
      request.use(aprefix(typeof prefix === 'function' ? prefix({ method, url }, data, originalData) : prefix))
    }
    if (suffix) {
      request.use(asuffix(typeof suffix === 'function' ? suffix({ method, url }, data, originalData) : suffix))
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

    if(headers) {
      if (Array.isArray(headers)) {
        headers.forEach(h => request.set(h.key, h.value))
      }
    }

    if(unsetHeaders) {
      if (Array.isArray(unsetHeaders)) {
        unsetHeaders.forEach(h => request.unset(h))
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