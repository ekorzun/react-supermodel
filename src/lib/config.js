import agent from 'superagent'

const config  = {
  agent,
  auth: '',
  prefix: '',
  withCredentials: false,
  accept: 'json',
  onSuccess: f => f,
  onError: f => f,
  getError: () => false,
}

const setConfig = opts => {
  Object.assign(config, opts)
}


const getConfig = opt =>
  config[opt]

export {
  getConfig,
  setConfig,
}