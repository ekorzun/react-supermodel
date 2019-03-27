import { Model } from '../../src'

export default new Model({
  name: 'User',
  api: {
    get: {
      url: '/users/:userid',
      export: data => {
        console.log('data: ', data);
        return { ...data, userid: data.id }
      }
    },
    create: 'POST /users',
    list: {
      url: '/users',
      import: r => r,
      export: data => data,
    },
    delete: 'DELETE /users/:id',
    update: {
      url: 'put /users/:id',
    },
  }
})