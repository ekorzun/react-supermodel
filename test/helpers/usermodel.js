import { Model } from '../../src'

export default new Model({
  name: 'User',
  api: {
    get: '/users/:id',
    create: 'POST /users',
    list: {
      url: '/users',
      import: r => r
    },
    delete: 'DELETE /users/:id',
    update: {
      url: 'put /users/:id',
    },
  }
})