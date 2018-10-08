import React from 'react';
import ReactDOM from 'react-dom';
import { configure, mount } from 'enzyme';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() });

import './helpers/setconfig'
import './helpers/browser'
import UserModel from './helpers/usermodel'
import connect from '../src'


class App extends React.Component {
  render() {
    const { User } = this.props
    const users = User.list()
    
    if (users.isLoading) {
      return <h1 className='loading' />
    }

    return (
      <div>
        <h1 className={`users-${users.data.length}`} />
        <ul>
          {users.data.map(user => {
            const {data} = user
            return (
              <li key={data.id} className={`user ${user.isDeleting ? 'deleting' : ''} ${user.isCreating ? 'creating' : ''} ${user.isUpdating ? 'updating' : ''}`}>
                {data.id} – {data.name}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

const ConnectedApp = connect(UserModel)(App)
const UserConnector = UserModel.getConnector()


describe('App component testing', () => {

  const wrapper = mount(<ConnectedApp />)


  it('loading state', done => {
    expect(wrapper.find('.loading')).to.have.lengthOf(1)
    done()
  })

  it('has 10 users', done => {
    const i = setInterval(_ => {
      if (UserConnector.list().data.length) {
        clearInterval(i)
        wrapper.update()
        expect(wrapper.find('.users-10')).to.have.lengthOf(1)
        expect(wrapper.find('.user')).to.have.lengthOf(10)
        done()
      }
    }, 1000)
  })

  it('delete without optimistic', done => {
    UserModel.optimistic.delete = false
    const req = UserConnector.delete(1)
      .then(_ => {
        setTimeout(() => {
          wrapper.update()
          expect(wrapper.find('.users-9')).to.have.lengthOf(1)
          expect(wrapper.find('.user')).to.have.lengthOf(9)
          done()
        }, 1000);
      })

    wrapper.update()
    expect(wrapper.find('.deleting')).to.have.lengthOf(1)
  })


  it('optimistic delete', () => {
    UserModel.optimistic.delete = true
    const req = UserConnector.delete(2)
    wrapper.update()
    expect(wrapper.find('.users-8')).to.have.lengthOf(1)
    expect(wrapper.find('.user')).to.have.lengthOf(8)
  })


  it('optimistic create', done => {
    UserModel.optimistic.create = true
    const req = UserConnector.create({
      name: 'korzun'
    })
    
    wrapper.update()
    expect(wrapper.find('.users-9')).to.have.lengthOf(1)
    expect(wrapper.find('.creating')).to.have.lengthOf(1)
    done()
  })

})