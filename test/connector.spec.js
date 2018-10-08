import { expect } from 'chai'
import './helpers/setconfig'

import UserModel from './helpers/usermodel'
const User = UserModel.getConnector()

describe('Model connector & store', () => {
  
  it('Fetching an object by id', done => {
    const user = User.get(1)
    expect(user.isLoading).to.equal(true)
    expect(user.data).to.deep.equal({})
    setTimeout(() => {
      const user = User.get(1)
      expect(user.isLoading).to.equal(false)
      expect(user.data.id).to.equal(1)
      done()
    }, 1800)
  })
  

  it('Resolving an error', done => {
    const user = User.get(100)
    expect(user.isLoading).to.equal(true)
    setTimeout(() => {
      const user = User.get(100)
      expect(user.isLoading).to.equal(false)
      expect(user.error).to.equal(true)
      done()
    }, 1800)
  })


  it('Getting an object by id from cache', () => {
    const user = User.get(1)
    expect(user.isLoading).to.equal(false)
    expect(user.data.id).to.deep.equal(1)
  })


  it('Should contain user #1 object in default collection', () => {
    const users = User.all()
    expect(users.data[0].data.id).to.equal(1)
  })


  it('Should not contain user #100 object in default collection', () => {
    const users = User.all()
    expect(users.data.length).to.equal(1)
  })


  it('Should update without optimistic strategy', done => {
    User.updateById(1, {name: 'korzun'})
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal('korzun')
        expect(User.get(1).data.name).to.equal('korzun')
        done()
      })
  })


  it('Should update using optimistic strategy', done => {
    UserModel.optimistic.update = true

    const req = User.updateById(1, {name: 'evgeny'})
    const user = User.get(1)

    expect(user.data.name).to.equal('evgeny')
    req.then(ResponseUser => {
        expect(ResponseUser.name).to.equal('evgeny')
        expect(User.get(1).data.name).to.equal('evgeny')
        done()
      })
  })



})