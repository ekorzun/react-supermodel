import { expect } from 'chai'
import './helpers/setconfig'

import { Model } from '../src'

const User = new Model({
  name: 'User',
  api: {
    myget: {
      sync: true,
      url: '/users/:id',
      export: (data = {}) => {
        return {
          ...data,
        }
      }
    },
  }
})

describe('Advanced', () => {
  
  it('Custom request method', () => {
    const user = User.getConnector().myget({id:1})
    expect(user.isLoading).to.equal(true)
  })
  
  
  it('Custom request method awaiting', done => {
    const f = () => {
      const user = User.getConnector().myget({id:1})
      if (user.isLoading) {
        return setTimeout(f)
      }
      done()
    }
    f()
  })
  
  it('Custom request method result', () => {
    const user = User.getConnector().myget({id:1})
    console.log(user)
  })

  // it('Custom request method should be cached', done => {
  //   User.myget({
  //     id: 1
  //   }).then(user => {
  //     expect(user.id).to.equal(1)
  //     done()
  //   })
  // })


  // it('custom data export', done => {
  //   User.myget({
  //     my_user_id: 1
  //   })
  //   .catch(err => {
  //     console.error(err)
  //     done()
  //   })
  //   .then(user => {
  //     console.log('user: ', user);
  //     expect(user.id).to.equal(1)
  //     done()
  //   })
  // })

})