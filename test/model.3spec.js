import { expect } from 'chai'
import './helpers/setconfig'

import { Model } from '../src'

const User = new Model({
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

describe('Model API calls', () => {
  
  it('Fetching an object by id', done => {
    User.get(1).then(user => {
      expect(user.id).to.equal(1)
      done()
    })
  })


  it('Deleting an object by id', done => {
    User.delete(1).then(user => {
      done()
    })
  })


  it('Updating an object by id', done => {
    User.update(1, {
      name: 'korzun'
    }).then(user => {
      expect(user.name).to.equal('korzun')
      done()
    })
  })

  it('Creating an object', done => {
    User.create({
      name: 'korzun'
    }).then(user => {
      expect(user.name).to.equal('korzun')
      expect(user.id).to.equal(11)
      done()
    })
  })


  it('Fetching list without `dataListKey`', done => {
    User.list().then(users => {
      expect(users.length).to.equal(10)
      expect(users[0].id).to.equal(1)
      done()
    })
  })


})