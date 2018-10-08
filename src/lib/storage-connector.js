import React from 'react'
import { getConfig } from './config'

class TreeConnector extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.onUpdate = this.onUpdate.bind(this)
    this._$watcher = getConfig('tree').watch(props.cursors)
    this.state = this._$watcher.get()
  }

  componentDidMount() {
    this._$watcher.on('update', this.onUpdate)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.tree !== this.props.tree) {return false}
    if(nextProps.cursors !== this.props.cursors) {return false}
    if(nextProps.Component !== this.props.Component) {return false}
    if (this.state !== nextState) { return true }
    return true
  }
  

  componentWillUnmount() {
    this._$watcher.release()
  }

  onUpdate(){
    this.setState(this._$watcher.get())
  }

  render() {
    const { Component, cursors, tree, ...props } = this.props
    return (
      <Component {...props} {...this.state} />
    )
  }
}


export default (cursors, Component) => {
  return (props) => (
    <TreeConnector Component={Component} cursors={cursors} {...props} />
  )
}