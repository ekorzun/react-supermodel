import Baobab from 'baobab'
import { setConfig } from '../../src'

const tree = new Baobab({
  $api: {}
}, {
  asynchronous: false
})

setConfig({
  tree,
  prefix: 'https://jsonplaceholder.typicode.com',
})