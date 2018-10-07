const config  = {
  auth: '',
  prefix: '',
  withCredentials: false,
  accept: 'json',
  onSuccess: f => f,
  onError: f => f,
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