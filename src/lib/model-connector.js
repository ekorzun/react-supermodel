import {dynamicNode} from 'baobab'
import agent from 'superagent'
import prefix from 'superagent-prefix'
import Model from './model'
import { config } from './config'


const getDefaultConnectorState = () => ({
  items: {
    // [id]: {Object}
  },
  dynamic: {},
  collections: {
    // [collection–key] : [id1, id2, id3]
    all: [
      // id1, id2, id3
    ]
  },
  isLoading: {},
  errors: {},
  cached: {},
})

const log = msg => {
  console.log(msg)
}


class ModelConnector {

  constructor(model) {
    const {name} = model
    this.tree = config.tree
    this.model = model
    this.name = model.name
    const $state = this.tree.select('$api')
    if(!$state.get(name)) {$state.select(name).set(getDefaultConnectorState())}
    this.$state = this.tree.select('$api', name)
  }

  createDynamicList(key){
    const {$state, model} = this
    $state.select('dynamic', key).set(dynamicNode({
      cursors: {
        items: ['$api', model.name, 'items'],
        isLoading: ['$api', model.name, 'isLoading', key],
        collection: ['$api', model.name, 'cached', key],
      },
      get: ({ collection, isLoading, items }) => ({
        isLoading,
        data: collection.data.map(id => items[id])
      })
    }))
  }

  createDynamicCollection(key){
    const {$state, model} = this
    $state.select('dynamic', key).set(dynamicNode({
      cursors: {
        items: ['$api', model.name, 'items'],
        isLoading: ['$api', model.name, 'isLoading', key],
        collection: ['$api', model.name, 'collections', key],
      },
      get: ({ collection, isLoading, items }) => ({
        isLoading,
        data: collection.data.map(id => items[id])
      })
    }))
  }

  get(id, collection = 'all') {
    const { model, $state } = this
    const possibleCached = $state.get('items', id)
    if (possibleCached) {
      log(`${model.name}.get(${id}) from cache`)
      return possibleCached
    }
    
    const $item = $state.select('items', id)
    $item.set({isLoading: true, data: {}})
    
    // log(`${this.name}.get(${id}) 🏀 requesting by url ${requestUrl}`)
    model.get(id)
      .then(item => {
        if(!item) {return}
        $item.merge({
          error: false,
          isLoading: false,
          data: {
            ...$item.get('data'),
            ...item,
          }
        })
        const $collection = $state.select('collections', collection);
        if (!$collection.select(item_id => item_id === id).exists()){
          $collection.push(id)
        }
      })
      .catch(response => {
        $item.merge({
          isLoading: false,
          error: true,
        })
      })
    return $item.get()
  }

  updateById(id, props) {
    const { $state, model } = this
    const { $key, ...params } = props
    params[model.idKey] = id
    const requestUrl = model.api.update(params)
    const $item = $state.select('items', id)

    const optimisticUpdate = model.optimistic && (model.optimistic === true || model.optimistic.update)

    if ($item.exists()) {
      !optimisticUpdate && $item.set('isLoading', true)
    } else {
      $item.set({isLoading: true, data: {}})
    }
    
    if (optimisticUpdate) {
      $item.select('data').merge({
        ...props,
      })
    }

    return model.update(id, props)
      .then(item => {
        $item.select('data').merge({
          ...props,
          ...item,
        })
        return item
      })
      .catch(err => {
        throw err.response.body
      })
  }


  delete(id, params = {}) {
    const { $state, model } = this
    const $item = $state.select('items', id)
    if (!$item.exists()) {return Promise.resolve(true)}
    const optimisticDelete = model.optimistic && (model.optimistic === true || model.optimistic.delete)

    const deleteItem = () => {
      const $cached = $state.select('cached')
      Object.keys($cached.get()).forEach(key => {
        const $itemToDelete = $cached.select(key, 'data', itemid => {
          return itemid === id
        })
        if ($itemToDelete.exists()) {
          $itemToDelete.unset()
        }
      })
      const $collections = $state.select('collections')
      Object.keys($collections.get()).forEach(key => {
        const $itemToDelete = $collections.select(key, itemid => {
          return itemid === id
        })
        if ($itemToDelete.exists()) {
          $itemToDelete.unset()
        }
      })
    }

    if (optimisticDelete) {
      deleteItem()
      $item.unset()
    } else {
      $item.set('isDeleting', true)
    }

    return model.delete(id, params)
      .then(item => {
        if(!optimisticDelete) {
          deleteItem()
          $item.unset()
        }
        return item
      })
      .catch(err => {
        throw err.response.body
      })
  }



  create(props = {}, collection = 'all') {
    const { $state, model } = this
    const {$key, ...params} = props
    const optimisticCreate = model.optimistic && (model.optimistic === true || model.optimistic.create)
    const tempID = optimisticCreate ? +new Date : null
    
    return (function (
      optimisticCreate,
      tempID,
      $key,
      params
    ){
    if (optimisticCreate) {
        $state.select('items').merge({
          [tempID]: {
            isCreating: true,
            data: {
              [model.idKey]: tempID,
              ...params,
            },
          }
        })
        $state.select('collections', collection).push(tempID)
        if ($key) {
          $state.select('cached', $key, 'data').push(tempID)
        }
      }

      return model.create(params)
        .then(item => {
          const id = item[model.idKey]
          if (!optimisticCreate) {
            $state.select('items').merge({
              [id]: {
                data: {
                  ...params,
                  ...item,
                },
              }
            })

            $state.select('collections', collection).push(id)
            if ($key) { $state.select('cached', $key, 'data').push(id) }

          } else {

            $state.select('items').merge({
              [id]: {
                data: {
                  ...params,
                  ...item,
                },
              }
            })
            
            $state.select('cached', $key, 'data', id => id === tempID).set(id)
            $state.select('collections', collection, id => id === tempID).set(id)
            $state.select('items', tempID).unset()
          }

          return item
        })
        .catch(err => {
          throw err.response.body
        })
    })(
      optimisticCreate,
      tempID,
      $key,
      params
    )
  }


  list(query = {}, collection = 'all'){
    const {
      $key,
      $onResponse,
      ...params
    } = query
    
    const key = ($key || (params ? JSON.stringify(params) : 'default'))
    const { model, $state } = this
    const $items = $state.select('items')
    const $cache = $state.select('cached', key) 
    const possibleCached = $cache.get()

    if (possibleCached)  {
      return {
        isLoading: possibleCached.isLoading,
        data: possibleCached.data
          .map(id => $items.get(id))
          .filter(x => x)
      }
    }
    
    $cache.set({isLoading: true, data: [],})

    model.list(params)
      .then(items => {
        
        $cache.set({
          isLoading: false,
          data: items.map(item => item[model.idKey])
        })

        $items.merge(items.reduce((acc, item) => {
          $state.select('collections', collection).push(item[model.idKey])
          acc[item[model.idKey]] = {data: item}
          return acc
        }, {}))
        // $isLoading.set(false)
      })
      .catch(err => {
        $cache.set('isLoading', false)
        // $isLoading.set(false)
      })
    
    return $cache.get()
  }


  all(collection = 'all'){
    const {$state, model} = this
    // const items = this.list(query, collection)
    return {
      data: this.$state
        .get('collections', collection)
        .map(id => {
          return $state.get('items', id)
        })
        .filter(x => x)
    }
  }


  drop(opts) {
    if(!opts) {
     this.$state.set(getDefaultConnectorState())
    }
    return this
  }

  
}

export default ModelConnector