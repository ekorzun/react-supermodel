import connect from './lib/connect'
import Model from './lib/model'
import {setConfig, getConfig} from './lib/config'

export {
	setConfig,
	getConfig,
	Model,
	connect
}

export default connect

if(typeof module !== 'undefined') {
	module.exports = connect
}