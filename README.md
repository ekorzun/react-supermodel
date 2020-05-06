# react-supermodel
Supercharged REST-api wrapper for React. 

## Features
- Works out of the box
- Backend-agnostic 
- Cache control
- Optimistic/Pessimistic strategies for UI/data updating
- Immutable state

## Demo

- Gif
- https://codesandbox.io/s/04poy3y2kp

---

- [react-supermodel](#react-supermodel)
  - [Features](#features)
  - [Demo](#demo)
  - [Installation](#installation)
    - [Through yarn](#through-yarn)
    - [Through NPM](#through-npm)
  - [Get started](#get-started)
  - [1. Setup](#1-setup)
      - [options.tree – *required*](#optionstree-%e2%80%93-required)
      - [options.accept](#optionsaccept)
      - [options.auth](#optionsauth)
      - [options.prefix](#optionsprefix)
      - [options.withCredentials](#optionswithcredentials)
  - [2. Create model](#2-create-model)
      - [modelOptions.name – required](#modeloptionsname-%e2%80%93-required)
      - [modelOptions.idKey](#modeloptionsidkey)
      - [modelOptions.dataItemKey](#modeloptionsdataitemkey)
      - [modelOptions.dataListkey](#modeloptionsdatalistkey)
      - [modelOptions.api – required](#modeloptionsapi-%e2%80%93-required)
      - [modelOptions.api.url](#modeloptionsapiurl)
      - [modelOptions.api.import](#modeloptionsapiimport)
      - [modelOptions.api.export](#modeloptionsapiexport)
      - [modelOptions.optimistic](#modeloptionsoptimistic)
    - [3. Create connection](#3-create-connection)
  - [Working with connectors](#working-with-connectors)
    - [Getting connector](#getting-connector)
    - [.get( id )](#get-id)
  - [Dataflow concepts](#dataflow-concepts)
  - [Examples](#examples)
  - [Using Baobab as application's store](#using-baobab-as-applications-store)
  - [Using with redux / etc](#using-with-redux--etc)
  - [Using without React](#using-without-react)
  - [Development & test](#development--test)
  - [Licence](#licence)




## Installation

### Through yarn
```
yarn add react-supermodel baobab
```

### Through NPM
```
npm install react-supermodel baobab --save
```

## Get started

## 1. Setup
The first thing you need to do is to init main config.
Typically, your app's top-level component or main file like `index.js` will probably contains this config.

```javascript
import { setConfig } from 'react-supermodel'
setConfig( options )
```

#### options.tree – *required*
Baobab instance. Make sure you have an `$api` cursor in your tree – it's required. 

```javascript
import Baobab from 'baobab'
import { setConfig } from 'react-supermodel'
const tree = new Baobab({
  $api: {}, //
  whateverYouNeedThere: {}, 
})
setConfig({ tree })
```

#### options.accept
Accept header for request. Default is `json`
See – https://visionmedia.github.io/superagent/#setting-accept


#### options.auth
`Authorization` header. Default is empty string. Can be `string` or `function`.
For example:

```javascript
{
  auth: `Bearer: USER_TOKEN`,
  // Or using dynamic token
  auth: () => `Bearer: ${window.ComputeUserToken()}`,
}
```

#### options.prefix
Base URL prefix. Can be `string` or `function`. All model's requests will be prefixed with it.
If you are going to use custom domain as prefix, make sure you know about CORS and credentials (see below).

```javascript
setConfig({ prefix: '/api' })
// Or custom domain
setConfig({ prefix: 'http://customdomain.com/api' })
// Or custom function
setConfig({ prefix: () => `/api/${window.API_VERSION_CONFIG}` })
```

#### options.withCredentials
This option enables the ability to send cookies from the origin, however only when Access-Control-Allow-Origin is not a wildcard ("*"), and Access-Control-Allow-Credentials is "true".
See – https://visionmedia.github.io/superagent/#cors


## 2. Create model

Once you've setuped supermodel's config, you'll need to create model.
Basically model describes how to store/import/export and sync local data with an API provided data. 


```javascript
import { Model } from 'react-supermodel'
const UserModel = new Model({
  
  name: 'User', // This will be the name in props for connected component
  api: {
    get: '/users/:id', // :id will be replaced for real user is by connector
    list: '/users',
    create: 'POST /users',  // Also you can speciafy request's method with first-word prefix like GET, POST. DELETE, PUT
    delete: 'DELETE /users/:id',
    update: 'PUT /users/:id',
  }
})
```

#### modelOptions.name – required
`name` key contains the name of the model. It'll be passed to `Component` props via `connect` function.

#### modelOptions.idKey
`idKey` is the name for unique key of your objects. By default it is equal to `id`.
For example, if your API has users collection contains an objects like `{user_id: 1, user_name: 'admin'}`, you should set up `idKey` as `user_id`.

#### modelOptions.dataItemKey
Default is `data`. Name of the key from your API response when requesting a single object.

#### modelOptions.dataListkey
Default is `data`. Name of the key from your API response when requesting a list.

#### modelOptions.api – required
The most important option. `api` is an object that describes how to work with your API. `api` has several predefined special keys which have a mapped dataflow methods like `get`, `list`, `create`, `delete`. You can also create your own methods. [Working with connectors](#working-with-connectors)

Each property can be `string` contains an url pattern or an `object`.
If you need to manipulate with response data, you should and object condiguration. 

Here is an example how to add an extra property `full_name` to user object.

```javascript
{
  api: {
    get: {
      url: '/user/:id', // the same if it was a string
      import( user ) {
        return {
          ...user,
          full_name: `${user.last_name} ${user.first_name}`
        }
      }
    }
  }
}
```

#### modelOptions.api.url
- URL string.
- Can be absolute starting with protocol (`http://api2.mysite.com/api`) or relative (`/api`), which will be prefixed with `modelOptions.prefix` prop. 
- Can be prefixed with method (`"POST /api"`)
- All urls can be interpolated with some data. 

Examples: 

- If you call `User.get( 1 )` with an url like `/users/:id`, **Supermodel** will interpolate it like `/users/1`. 

- If url will look like `/users`, **Supermodel** will interpolate it like `/users?id=1`

- If url will look like `POST /users` **Supermodel** will send send *POST* request with JSON-payload like `{id:1}`. But if you need both (Request body and GET param), you should define an url like `/POST /users?id=:id`.


#### modelOptions.api.import
One of the most advanced feature. Basically it is simple data-processing function which describes how to import API data to storage. It is an entry point to convert or modify incoming data. 

```javascript
import( user ) {
  return {
    ...user,
    // Adding fullname property
    full_name: `${user.last_name} ${user.first_name}`,
    // Adding formatted birthdate string property from backend UNIX timestamp
    birthdate: moment(user.birth_timestamp * 1000).format('DD.MM.YYYY'),
  }
}
```


#### modelOptions.api.export
It is simple data-processing function which describes how to export your data to API. For example, user changed his `birthdate`:

```javascript
export( user ) {
  return {
    // birth_timestamp is the name of propery stored on backend
    // So we should send it as UNIX timestamp
    birth_timestamp: moment(user.birthdate).unix() 
  }
}
```


#### modelOptions.optimistic
– WIP: UI/data updating strategy


### 3. Create connection

```javascript
import connect from 'react-supermodel'
import UserModel from './models/UserModel'

@connect(UserModel)
class App extends Component {}
```

That's it.

---

## Working with connectors
Once you've added connector to your component, you a ready to use it.

### Getting connector

```javascript
@connect(UserModel)
class App extends Component {
  render(){
    const { User } = this.props // Get UserModel's connector from props
    // ...
  }
}
```

Model's connector provides some predefined methods like `get`, `list`, `create`, `delete`, `update` and `all` using own dataflow inside.

### .get( id )
Designed for using inside Component's `render` method.
```
const user = User.get(1)
return (<pre>{JSON.stringify(user)}</pre>)
```



## Dataflow concepts 


## Examples
```javascript
import connect from 'react-supermodel'
import UserModel from './models/UserModel'
@connect(UserModel)
class App extends Component {
  render(){
    // Get UserModel's connector from props
    const { User } = this.props
    // Getting users list from an API
    const users = User.list()
    // Showing progress indicator while users are loading
    if( users.isLoading ) {
      return 'Loading ...'
    }
    return (
      <ul>
        {users.data.map({data} =>
          <li key={data.id}>{data.name}</li>
        )}
      </ul>
    )
  }
}
```



## Using Baobab as application's store
– WIP

## Using with redux / etc
– WIP

## Using without React
– WIP

## Development & test

```
git clone https://github.com/ekorzun/react-supermodel.git
cd react-supermodel
yarn install
yarn test
```

## Licence 
MIT.

