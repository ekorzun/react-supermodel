import { expect } from 'chai'
import './helpers/setconfig'

import { Model } from '../src'

const User = new Model({
  name: 'User',
  api: {
    myget: {
      url: '/users/:id',
      store: 'myusers',
      export: (data = {}) => {
        return {
          ...data,
          id: data.my_user_id
        }
      }
    },
  }
})

describe('Advanced', () => {
  
  it('Custom request method', done => {
    User.myget({
      id:1
    }).then(user => {
      expect(user.id).to.equal(1)
      done()
    })
  })

  // it('Custom request method should be cached', done => {
  //   User.myget({
  //     id: 1
  //   }).then(user => {
  //     expect(user.id).to.equal(1)
  //     done()
  //   })
  // })


  it('custom data export', done => {
    User.myget({
      my_user_id: 1
    })
    .catch(err => {
      console.error(err)
      done()
    })
    .then(user => {
      console.log('user: ', user);
      expect(user.id).to.equal(1)
      done()
    })
  })

})