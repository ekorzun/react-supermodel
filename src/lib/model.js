import agent from 'superagent'
import aprefix from 'superagent-prefix'
import { expandURL } from './utils'
import { config } from './config'

class Model {

  constructor({
    idKey = 'id',
    dataItemKey = 'data',
    dataListkey = 'data',
    optimistic,
    name,
    api,
    props,
  }) {
    this.name = name
    this.idKey = idKey
    this.dataItemKey = dataItemKey
    this.dataListkey = dataListkey
    this.optimistic = optimistic
    this._createApi(api)
  }

  _createApi(api) {
    this.api = {}
    'get/list/create/update/delete'.split('/').forEach(method => {
      if(api[method]) {
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
    return this._makeRequest(endpoint, 'list', this.dataListKey, items => {
      if (!Array.isArray(items)) {
        throw new Error(`Must be an array`)
      }
    })
  }

  delete(id, props) {
    props[this.idKey] = id
    const endpoint = this.api.delete(props)
    return this._makeRequest(endpoint, 'delete', this.dataItemKey)
  }

  _makeRequest(endpoint, method, key, validate) {
    return this._request(endpoint, endpoint.data)
      .then(response => {
        const { body } = response
        const rawBody = body[key] || body
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

    const {
      accept,
      withCredentials,
      prefix,
      auth,
    } = config

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
  getConnector() { }
}


export default Model