import { expect } from 'chai'
import './helpers/setconfig'

import UserModel from './helpers/usermodel'
const User = UserModel.getConnector()

describe('Model connector & store', () => {
  
  it('Fetching an object by id', done => {
    const user = User.get(1)
    expect(user.isLoading).to.equal(true)
    expect(user.data).to.deep.equal({})
    const i = setInterval(() => {
      const user = User.get(1)
      expect(user.isLoading).to.equal(false)
      expect(user.data.id).to.equal(1)
      clearInterval(i)
      done()
    }, 1000)
  })
  

  it('Resolving an error', done => {
    const user = User.get(100)
    expect(user.isLoading).to.equal(true)
    const i = setInterval(() => {
      const user = User.get(100)
      expect(user.isLoading).to.equal(false)
      expect(user.error).to.equal(true)
      User.get(2)
      clearInterval(i)
      done()
    }, 1000)
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
      .catch(err => {
        console.error(err)
      })
  })


  it('Should update using optimistic strategy', done => {
    UserModel.optimistic.update = true

    const req = User.updateById(1, {name: 'evgeny'})
    const user = User.get(1)
    expect(user.data.name).to.equal('evgeny')
    expect(user.isUpdating).to.equal( true )

    req
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal('evgeny')
        expect(User.get(1).data.name).to.equal('evgeny')
        done()
      })
      .catch(err => {
        console.error(err)
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
      .catch(err => {
        console.error(err)
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
      .catch(err => {
        console.error(err)
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


  it('Fetching items with no params', done => {
    const users = User.list()
    expect(users.isLoading).to.equal(true)
    expect(users.data).to.deep.equal([])
    setTimeout(() => {
      const users = User.list()
      expect(users.data.length).to.equal(10)
      done()
    }, 2000)
  })


  it('Fetching items with params', done => {
    const users = User.list({page: 1})
    expect(users.isLoading).to.equal(true)
    expect(users.data).to.deep.equal([])
    setTimeout(() => {
      const users = User.list()
      expect(users.data.length).to.equal(10)
      done()
    }, 2000)
  })

  it('Fetching items by `$key`', done => {
    const users = User.list({$key: 'users'})
    expect(users.isLoading).to.equal(true)
    expect(users.data).to.deep.equal([])
    setTimeout(() => {
      const users = User.list()
      expect(users.data.length).to.equal(10)
      done()
    }, 2000)
  })

  it('Fetching items into other collection', done => {
    const users = User.list({
      sex: 'female',
    }, 'women')
    expect(users.isLoading).to.equal(true)
    expect(users.data).to.deep.equal([])
    setTimeout(() => {
      const users = User.list()
      expect(users.data.length).to.equal(10)
      done()
    }, 2000)
  })

  
  it('Getting items with no params from cache', () => {
    const users = User.list()
    expect(users.isLoading).to.equal(false)
    expect(users.data.length).to.equal(10)
  })


  it('Getting items with params from cache', () => {
    const users = User.list({page: 1})
    expect(users.isLoading).to.equal(false)
    expect(users.data.length).to.equal(10)
  })

  it('Getting items by `$key` from cache', () => {
    const users = User.list({$key: 'users'})
    expect(users.isLoading).to.equal(false)
    expect(users.data.length).to.equal(10)
  })

  it('Getting items into other collection from cache', () => {
    const users = User.list({
      sex: 'female',
    }, 'women')
    expect(users.isLoading).to.equal(false)
    expect(users.data.length).to.equal(10)
  })


  it('Ensure items exist in collections without duplicates', () => {
    const users = User.all()
    const women = User.all('women')
    expect(users.data.length > 10).to.equal(true)
    expect(women.data.length).to.equal(10)
  })




})