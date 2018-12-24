import React from 'react'
import Model from './model'
// import ModelConnector from './model-connector'
import storageConnector from './storage-connector'

const ModelConnect = (...args) => {
  const cursors = {}
  const connectors = {}

  args.forEach(arg => {
    if(arg instanceof Model || (arg && arg.getConnector)) {
      const connector = arg.getConnector()
      connectors[connector.name] = connector
      cursors[`${connector.name}_watcher`] = ['$api', connector.name]
    } else {
      // @todo add dynamic cursors support
      if(arg && typeof arg === 'object') {
        Object.keys(arg)
          .forEach(key => {
            cursors[key] = arg[key].split('.')
          })
      }
    }
  })

  return (Component) => {
    const ConnectedComponent = storageConnector(cursors, Component)
    return class extends React.PureComponent {
      render(){
        return (
          <ConnectedComponent
            {...connectors}
            {...this.props}
          />
        )
      }
    }
  }
}

export {
  ModelConnect,
  ModelConnect as default,
}