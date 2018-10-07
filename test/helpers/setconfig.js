import Baobab from 'baobab'
import { setConfig } from '../../src'

const tree = new Baobab({
  $api: {}
})

setConfig({
  tree,
  prefix: 'https://jsonplaceholder.typicode.com',
})