import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow } from 'enzyme';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() });


import {setConfig, getConfig} from '../dist/supermodel'

class App extends React.Component {
  render(){
    return (
      <div>
        <img />
      </div>
    )
  }
}




describe('App component testing', function () {
  it('renders welcome message', function () {
    const wrapper = shallow(<App />);
    const welcome = <h1 className='App-title'>Welcome to React</h1>;
    expect(wrapper.contains(welcome)).to.equal(true);
  });
});