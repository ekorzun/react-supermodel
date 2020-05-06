import { expect } from 'chai'
import './helpers/setconfig'

import UserModel from './helpers/usermodel'


describe('Model connector & store', () => {

  const User = UserModel.getConnector()
  
  it('Fetching an object by id', done => {
    const user = User.get(1)
    expect(user.isLoading).to.equal(true)

    const i = setInterval(() => {
      const user = User.get(1)
      if (user.isLoading) { return }
      expect(!user.isLoading).to.equal(true)
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
      if (user.isLoading) {return}
      expect(user.isLoading).to.equal(false)
      expect(user.error).to.equal(true)
      clearInterval(i)
      done()
    }, 1000)
  })


  it('Getting an object by id from cache', () => {
    const user = User.get(1)
    expect(!user.isLoading).to.equal(true)
    expect(user.data.id).to.deep.equal(1)
  })


  it('Should contain user #1 object in default collection', () => {
    const users = User.all()
    expect(users.data[0].data.id).to.equal(1)
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
      .create({ 
        name: 'korzun',
        // id: 444, // json placeholder hack ;(
      })
      .then(ResponseUser => {
        expect(ResponseUser.name).to.equal('korzun')
        expect(User.get(ResponseUser.id).data.name).to.equal('korzun')
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
      ).to.equal(-1)

      done()
    })
  })

  it('Should create using optimistic strategy', done => {
    User.drop()
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


  it('Should delete using optimistic strategy', done => {
    UserModel.optimistic.delete = true
    User.get(1)
    const i = setInterval(_ => {
      if(!User.get(1).isLoading) {
        clearInterval(i)
        const req = User.delete(1).catch(e => e)
        expect(
          User
            .all()
            .data
            .findIndex(u => u.data.id === 1)
        ).to.equal(-1)
        req.then(_ => done())
      }
    }, 1000)
  })

  it('Fetching items with no params', done => {
    User.drop()
    const users = User.list()
    expect(users.isLoading).to.equal(true)

    const i = setInterval(() => {
      const users = User.list()
      if(!users.isLoading) {
        clearInterval(i)
        expect(users.data.length).to.equal(10)
        done()
      }
      
    }, 1000)
  })


  it('Fetching items with params', done => {
    const users = User.list({random: 1})
    expect(users.isLoading).to.equal(true)

    const i = setInterval(() => {
      const users = User.list()
      if (!users.isLoading) {
        clearInterval(i)
        expect(users.data.length).to.equal(10)
        done()
      }
    }, 1000)
  })

  it('Fetching items by `$key`', done => {
    const query = { $key: 'users' }
    const users = User.list(query)
    expect(users.isLoading).to.equal(true)
    const i = setInterval(() => {
      const users = User.list(query)
      if (!users.isLoading) {
        clearInterval(i)
        expect(users.data.length).to.equal(10)
        done()
      }
    }, 1000)
  })

  it('Fetching items into other collection', done => {
    const query = {sex: 'female',}
    const users = User.list(query, 'women')
    expect(users.isLoading).to.equal(true)
    expect(users.data).to.deep.equal([])

    const i = setInterval(() => {
      const users = User.list(query)
      if (!users.isLoading) {
        clearInterval(i)
        expect(users.data.length).to.equal(10)
        done()
      }
      
    }, 1000)
  })


  
  it('Getting items with no params from cache', () => {
    const users = User.list()
    expect(users.isLoading).to.equal(false)
    expect(users.data.length).to.equal(10)
  })


  it('Getting items with params from cache', () => {
    const users = User.list({ random: 1})
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
    expect(users.data.length).to.equal(10)
    expect(women.data.length).to.equal(10)
  })




})