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
      User.get(2)
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
    expect(user.isSaving).to.equal( true )

    req
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal('evgeny')
        expect(User.get(1).data.name).to.equal('evgeny')
        done()
      })
  })

  it('Should create without optimistic strategy', done => {
    User
      .create({ name: 'korzun' })
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal('korzun')
        expect(User.get(ResponseUser.id).data.name).to.equal('korzun')
        done()
      })
  })

  it('Should create using optimistic strategy', done => {
    UserModel.optimistic.create = true
    const name = 'korzun 123'
    const req = User.create({name})
    
    const newCreatedUser = User.all().data.find(u => u.data.name === name)
    expect(newCreatedUser.data.name).to.equal(name)
    expect(newCreatedUser.isCreating).to.equal(true)

    req
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal(name)
        expect(User.get(ResponseUser.id).data.name).to.equal(name)
        done()
      })
  })


  it('Should delete without optimistic strategy', done => {
    const req = User.delete(1)
    expect(User.get(1).isDeleting).to.equal(true)

    req.then(ResponseUser => {
        expect(
          User
            .all()
            .data
            .findIndex(u => u.data.id === 1)
        ).to.equal( -1 )
        done()
      })
  })

  it('Should delete using optimistic strategy', done => {
    UserModel.optimistic.delete = true
    const req = User.delete(2)
    expect(
      User
        .all()
        .data
        .findIndex(u => u.data.id === 2)
    ).to.equal(-1)

    req
      .then(ResponseUser => {
        done()
      })
  })



})