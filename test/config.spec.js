
import { expect } from 'chai';
import { setConfig, getConfig } from '../src'

describe('Config', () => {
  it('Setting and getting cofiguration', () => {
    
    setConfig({
      foo: 'bar'
    })

    expect(getConfig('foo')).to.equal('bar')
  });
});