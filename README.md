## react-supermodel

Supercharged REST-api wrapper for React. 


## Demo

Gif

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

```
import {setConfig} from 'react-supermodel'
setConfig( options )
```

#### options.tree
Baobab instance

#### options.accept
Accept header for request. Default is `json`
See – https://visionmedia.github.io/superagent/#setting-accept

#### options.auth
Authorization header. Default is empty.

#### options.withCredentials
This option enables the ability to send cookies from the origin, however only when Access-Control-Allow-Origin is not a wildcard ("*"), and Access-Control-Allow-Credentials is "true".
See – https://visionmedia.github.io/superagent/#cors

#### options.auth
Authorization header. Default is empty.

#### options.prefix
Base url prefix.

#### options.onSuccess
//
#### options.onError
//


### 2. Create model

Main.

```
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

#### modelOptions.idKey
#### modelOptions.dataItemKey
#### modelOptions.dataListkey
#### modelOptions.optimistic
#### modelOptions.api – required

### 3. Create connection
```
import connect from 'react-supermodel'
import UserModel from './models/UserModel'
@connect(UserModel)
```

## Examples
```
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


## Using with redux / etc

## Licence 
MIT

