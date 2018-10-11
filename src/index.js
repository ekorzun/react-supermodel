import connect from './lib/connect'
import Model from './lib/model'
import {setConfig, getConfig} from './lib/config'

export {
	setConfig,
	getConfig,
	Model,
	connect,
	connect as default
}

// if(typeof exports !== 'undefined') {
// 	exports = connect
// 	exports.setConfig = setConfig
// 	exports.getConfig = getConfig
// 	exports.Model = Model
// }