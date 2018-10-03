export const config  = {
  auth: '',
  prefix: '',
  withCredentials: false,
  accept: 'json',
  onSuccess: f => f,
  onError: f => f,
}

export default opts =>
  Object.assign(config, opts)