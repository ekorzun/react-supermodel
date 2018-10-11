## react-supermodel
Supercharged REST-api wrapper for React. 


- [react-supermodel](#react-supermodel)
- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
  - [Through yarn](#through-yarn)
  - [Through NPM](#through-npm)
- [Get started](#get-started)
  - [1. Setup](#1-setup)
    - [options.tree – required](#optionstree--required)
    - [options.accept](#optionsaccept)
    - [options.auth](#optionsauth)
    - [options.prefix](#optionsprefix)
    - [options.withCredentials](#optionswithcredentials)
    - [options.onSuccess](#optionsonsuccess)
    - [options.onError](#optionsonerror)
  - [2. Create model](#2-create-model)
    - [modelOptions.name – required](#modeloptionsname--required)
    - [modelOptions.idKey](#modeloptionsidkey)
    - [modelOptions.dataItemKey](#modeloptionsdataitemkey)
    - [modelOptions.dataListkey](#modeloptionsdatalistkey)
    - [modelOptions.optimistic](#modeloptionsoptimistic)
    - [modelOptions.api – required](#modeloptionsapi--required)
  - [3. Create connection](#3-create-connection)
- [Examples](#examples)
- [Using Baobab as application's store](#using-baobab-as-applications-store)
- [Using with redux / etc](#using-with-redux--etc)
- [Using without React](#using-without-react)
- [Development & test](#development--test)
- [Licence](#licence)

## Demo

Gif

## Features
– Works out of the box
– Cache control
– Optimistic/Pessimistic strategies for UI/data updating
– Backend-agnostic 
– Immutable state
– 

## Installation

### Through yarn
```
yarn add react-supermodel
```

### Through NPM
```
npm install react-supermodel --save
```

## Get started

### 1. Setup
The first thing you need to do is to init main config.
Typically, your app's top-level component or main file like `index.js` will probably contains this config.

```javascript
import {setConfig} from 'react-supermodel'
setConfig( options )
```

#### options.tree – required
Baobab instance. Make sure you have an `$api` cursor in your tree. 
```javascript
import Baobab from 'baobab'
import {setConfig} from 'react-supermodel'
const tree = new Baobab({$api: {}})
setConfig({tree})
```

#### options.accept
Accept header for request. Default is `json`
See – https://visionmedia.github.io/superagent/#setting-accept

#### options.auth
Authorization header. Default is empty string. Can be `string` or `function`.
For example:
```javascript
{
  auth: `Bearer: USER_TOKEN`,
  // Or using dynamic token
  auth: () => `Bearer: ${window.ComputeUserToken()}`,
}
```

#### options.prefix
Base URL prefix. All model's requests will be prefixed with it.
If you are going to use custom domain as prefix, make sure you know about CORS and credentials (see below).
```javascript
setConfig({prefix: '/api'})
// Or custom domain
setConfig({prefix: 'http://customdomain.com/api'})
```

#### options.withCredentials
This option enables the ability to send cookies from the origin, however only when Access-Control-Allow-Origin is not a wildcard ("*"), and Access-Control-Allow-Credentials is "true".
See – https://visionmedia.github.io/superagent/#cors


#### options.onSuccess
–

#### options.onError
–


### 2. Create model

Main.

```javascript
import {Model} from 'react-supermodel'
const UserModel = new Model({
  name: 'User', // This will be the name in props for connected component
  api: {
    get: '/users/:id',
    list: '/users',
    create: 'POST /users',
    delete: 'DELETE /users/:id',
    update: 'PUT /users/:id',
  }
})
```


#### modelOptions.name – required
–

#### modelOptions.idKey
–

#### modelOptions.dataItemKey
–

#### modelOptions.dataListkey
–

#### modelOptions.optimistic
–

#### modelOptions.api – required
–

### 3. Create connection
```javascript
import connect from 'react-supermodel'
import UserModel from './models/UserModel'
@connect(UserModel)
```

## Examples
```javascript
import connect from 'react-supermodel'
import UserModel from './models/UserModel'
@connect(UserModel)
class App extends Component {
  render(){
    return (
      <ul>
        {this.props.User.list().data.map({data} =>
          <li key={data.id}>{data.name}</li>
        )}
      </ul>
    )
  }
}
```

## Using Baobab as application's store
–

## Using with redux / etc
–

## Using without React
–

## Development & test

```
git clone https://github.com/ekorzun/react-supermodel.git
cd react-supermodel
yarn install
yarn test
```

## Licence 
MIT.

