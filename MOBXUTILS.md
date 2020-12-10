# MobxUtils

The utilities in this directory are used at KTH Stockholm to integrate MobX stores into our React based frontends. As our applications use server-side rendering, the MobxUtils contain some functions which are only needed in such a setup.

# Contents

## [Section "How it works"](#how-it-works)

- [Default store, single store or multi store?](#default-store-single-store-or-multi-store)
- [Server/client or client only?](#serverclient-or-client-only)
- [Basic workflow - server/client](#basic-workflow---serverclient)
- [Basic workflow - client only](#basic-workflow---client-only)

## [Section "API"](#api)

- [announceStore()](#announcestore)
- [createStore()](#createstore)
- [createMultiStore()](#createmultistore)
- [getStoreState()](#getstorestate)
- [compressStoreDataIntoJavascriptCode()](#compressstoredataintojavascriptcode)
- [uncompressStoreDataFromDocument()](#uncompressstoredatafromdocument)
- [&lt;MobxStoreProvider/&gt;](#mobxstoreprovider)
- [useStore()](#usestore)
- [activateTestEnvironment()](#activatetestenvironment)

## [Section "Designing your stores"](#designing-your-stores)

- [Basic structure](#basic-structure)
- [Observables and actions](#observables-and-actions)
- [Asynchronous actions](#asynchronous-actions)
- [Use the default store outside of any other store](#use-the-default-store-outside-of-any-other-store)
- [Use the default store inside another store](#use-the-default-store-inside-another-store)
- [Replace the default store](#replace-the-default-store)

## [Section "Running unit tests"](#running-unit-tests)

- [Testing observer components using &lt;MobxStoreProvider/&gt;](#testing-observer-components-using-mobxstoreprovider)
- [Testing observer components w/o using &lt;MobxStoreProvider/&gt;](#testing-observer-components-wo-using-mobxstoreprovider)

# How it works

## Default store, single store or multi store?

You can use the MobxUtils in different modes which are related to the needed store-setup:

| **Default store mode**                                                                             | **Single store mode**                                       | **Multi store mode**                                                                                 |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| You use the default store, only - either the included one or you replace that with your own store. | You use only a named store w/o accessing the default store. | You use one or more named stores, possibly together with the default store (integrated or replaced). |

## Server/client or client only?

There are two general ways to use MobX in our application:

| **Server/client**                                                                                                                                                                                                           | **Client only**                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://img.shields.io/badge/SSR-grey)<br/>If you do server-side rendering (SSR) in your application you will most likely need a chance to prepare the stores on the server and send the data to the client afterwards. | ![](https://img.shields.io/badge/no%20SSR-grey)<br/>Without server-side rendering (SSR) it might be sufficient to create the stores inside the client just before using them. |
| The stores are created on the server. The prepared store-data is included in the HTML-document which is sent to the client, so that the client can use it to initialize the stores on its side.                             | The stores are created by the client, only. All initialization is done after the client-app has started, e.g. by requesting JSON-data from the server.                        |

## Basic workflow - server/client

| **Preparations on the server**                                                                                      | ![](https://img.shields.io/badge/SSR-server--side-brown)                                                                                     |
| :------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Register any store which might be used                                                                           | [`announceStore(storeId, initCallback)`](#announcestore)                                                                                     |
| _**Default store mode?**_<br/>2. Prepare some raw store-data<br/>3. Use actions to fill the store with initial data | <br/>[`const storeData = createStore()`](#createstore)<br/>_e.g._ `storeData.setLanguage('sv')`                                              |
| _**Single store mode?**_<br/>2. Prepare some raw store-data<br/>3. Use actions to fill the store with initial data  | <br/>[`const storeData = createStore(storeId)`](#createstore)<br/>_e.g._ `storeData.setLanguage('sv')`                                       |
| _**Multi store mode?**_<br/>2. Prepare some raw store-data<br/>3. Use actions to fill the store with initial data   | <br/>[`const storeData = createMultiStore(...storeIdList)`](#createmultistore)<br/>_e.g._ `storeData`**`.default`**`.setLanguage('sv')`      |
| 4. Prepare the JavaScript snippet<br/>which contains the compressed store                                           | [`const compressedStoreCode = compressStoreDataIntoJavascriptCode(storeData)`](#compressstoredataintojavascriptcode)                         |
| 5. Include the content of `compressedStoreCode`<br/>inside a `<script>`-section of your HTML-file                   | _e.g._ `html += '<script>' + compressedStoreCode + '</script>'`                                                                              |
| &nbsp;<br/>_(The HTML-document is sent to the client...)_<br/>&nbsp;                                                |                                                                                                                                              |
| **Usage in your client-app**                                                                                        | ![](https://img.shields.io/badge/SSR-client--side-green)                                                                                     |
| 6. Register any store which might be used<br/>- that's needed again                                                 | [`announceStore(storeId, initCallback)`](#announcestore)                                                                                     |
| 7. Grab the store data which was prepared<br/>on the server                                                         | [`const storeData = uncompressStoreDataFromDocument()`](#uncompressstoredatafromdocument)                                                    |
| _**Default store mode?**_<br/>8. Wrap your React app<br/>&nbsp;                                                     | [`<MobxStoreProvider storeData={storeData}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider)                                |
| _**Single store mode?**_<br/>8. Wrap your React app<br/>&nbsp;<br/>&nbsp;                                           | [`<MobxStoreProvider storeData={storeData}`<br/>` singleStoreId={storeId}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider) |
| _**Multi store mode?**_<br/>8. Wrap your React app<br/>&nbsp;                                                       | [`<MobxStoreProvider storeData={storeData}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider)                                |
| 9. Start working - access the data and actions<br/>of your MobX stores inside any React component of your app       | [`const store = useStore(storeId?)`](#usestore)                                                                                              |

## Basic workflow - client only

| **Usage in your client-app**                                                                                            | ![](https://img.shields.io/badge/no%20SSR-client--side-green)                                                                                                                                                  |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Register any store which might be used                                                                               | [`announceStore(storeId, initCallback)`](#announcestore)                                                                                                                                                       |
| _**Default store mode?**_<br/>2. Prepare some raw store data<br/>3. Wrap your React app<br/>&nbsp;<br/>&nbsp;           | <br/>[`const storeData = createStore()`](#createstore)<br/>[`<MobxStoreProvider storeData={storeData}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider)                                       |
| _**Single store mode?**_<br/>2. Prepare some raw store data<br/>3. Wrap your React app<br/>&nbsp;<br/>&nbsp;<br/>&nbsp; | <br/>[`const storeData = createStore(storeId)`](#createstore)<br/>[`<MobxStoreProvider storeData={storeData}`<br/>` singleStoreId={storeId}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider) |
| _**Multi store mode?**_<br/>2. Prepare some raw store data<br/>3. Wrap your React app<br/>&nbsp;<br/>&nbsp;             | <br/>[`const storeData = createMultiStore(...storeIdList)`](#createmultistore)[`<MobxStoreProvider storeData={storeData}>`<br/>&nbsp;` ...`<br/>`</MobxStoreProvider>`](#mobxstoreprovider)                    |
| 4. Start working - access the data and actions<br/>of your MobX stores inside any React component of your app           | [`const store = useStore(storeId?)`](#usestore)                                                                                                                                                                |

# API

## `announceStore()`

![](https://img.shields.io/badge/SSR-server--side%20+%20client--side-orange) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

`announceStore()` prepares the later usage of the MobX-store with the given ID.

This functions injects your own init-callbacks into the MobxUtils module. It's needed by `createStore()` and `createMultiStore()` in order to work properly.

> **Please note**<br/>MobxUtils already contains a Mobx-store with the ID `'default'`:
>
> - No preparation with `announceStore()` is needed for this default-store.
> - You might still want to call `announceStore('default', createDefaultStore)` if you need to replace the complete internal default-store with an own init-callback.

> **Please note**<br/>You find more information about init-callbacks in the chapter "[Designing your stores](#designing-your-stores)".

---

```js
announceStore(storeId, initCallback)
```

|                                       | **Arguments**                                                                                                                                                                                                          |
| ------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|            **storeId**<br/>`{string}` | Choose an internal name (e.g. `'program'`) to identify the correct MobX-store<br/>with `createStore()`, `useStore()` etc.                                                                                              |
| **initCallback**<br/>`{() => object}` | Give a function which shall be used by `createStore()` etc. to prepare the object<br/>which contains the MobX-store with it's initial data (e.g. `language`)<br/>and all needed action-methods (e.g. `setLanguage()`). |
|                                       | **Results**                                                                                                                                                                                                            |
|                                `null` | `announceStore()` returns nothing.                                                                                                                                                                                     |
|                               `Error` | It might throw an error, especially in case of invalid arguments.                                                                                                                                                      |

```js
// Example from "program-web"

const { createProgramStore, createSystemAdminStore } = require('./stores')

announceStore('program', createProgramStore)
announceStore('systemAdmin', createSystemAdminStore)
```

## `createStore()`

![](https://img.shields.io/badge/SSR-server--side-brown) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

`createStore()` prepares the usage of a single MobX store.

You can use it directly if you are going to work with the internal defaul store. Otherwise you need to register your stores with `announceStore()`, first.

> **Please note**<br/>Already if you want to combine one application store with the internal default store you are adviced to use `createMultiStore()`, instead.

---

```js
createStore(storeId?, defaultStore?)
```

|                                 | **Arguments**                                                                                                                                                                                                            |
| ------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      **storeId**<br/>`{string}` | _(optional)_<br/>The internal name (e.g. `'program'`) of the MobX-store.                                                                                                                                                 |
| **defaultStore**<br/>`{object}` | _(optional, this one is mostly used internally)_<br/>An already created default store which shall be injected into the new store. The init-callback of the new store will get the given default store as first argument. |
|                                 | **Results**                                                                                                                                                                                                              |
|                      `{object}` | `createStore()` returns an object with the data of the new store which can be used and changed directly. This object is meant to be later given to `compressStoreDataIntoJavascriptCode()` or `<MobxStoreProvider/>`.    |
|                         `Error` | The function might throw an error, especially if you are trying to create a store without announcing it first.                                                                                                           |

```js
// Example

const defaultStore = createStore()

defaultStore.setLanguage('sv')
```

```js
// Example from "program-web"
// (assuming the default store isn't needed at all,
//  otherwise createMultiStore() should be used)

const programStore = createStore('program')

programStore.parseUrlPathIntoItemCodes(req.params.codes)
```

## `createMultiStore()`

![](https://img.shields.io/badge/SSR-server--side-brown) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

`createMultiStore()` prepares the later usage of several MobX stores. It should also be used in case you want to prepare a single store which still needs access to the default store.

> **Please note**<br/>If you only need access to the default store, use `createStore()` instead.

---

```js
createMultiStore(...storeIdList?)
```

|                                     | **Arguments**                                                                                                                                                                                                 |
| ----------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **...storeIdList**<br/>`{string[]}` | _(optional)_<br/>The internally used names (e.g. `'program', 'dataAdmin'`) of all needed MobX-stores. (The default store doesn't have to be named here as it always will be included.)                        |
|                                     | **Results**                                                                                                                                                                                                   |
|                          `{object}` | `createMultiStore()` returns a container-object with the raw data to be later used by the MobX stores. It gives you direct access to the default store and all other requested stores through its properties. |
|                             `Error` | The function might throw an error, especially if you are trying to create a store without announcing it first.                                                                                                |

> **Please note**<br/>The object returned by `createMultiStore()` is meant to be later given to `compressStoreDataIntoJavascriptCode()` or `<MobxStoreProvider/>`.
>
> If you store the result - e.g. in `storeData` -, you can directly access the default store with `storeData.default`. A store with the internal name `program` would be accessible by `storeData.program` etc.

```js
// Example from "program-web"

const storeData = createMultiStore('program')

const { default: defaultStore, program: programStore } = storeData

defaultStore.setLanguage('sv')
programStore.parseUrlPathIntoItemCodes(req.params.codes)
```

```js
// Example from "program-web"
// (assuming the admin-page needs access to the program-store, too)

const storeData = createMultiStore('program', 'dataAdmin')

const { default: defaultStore, program: programStore, dataAdmin: adminStore } = storeData

defaultStore.setLanguage('sv')
await adminStore.queryProgramListAsync({ serverHost, serverAxios })
```

## `getStoreState()`

![](https://img.shields.io/badge/SSR-client--side-green) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

`getStoreState()` gives you the chance to interactively determine if the store with a given name was already announced - i.e. by `announceStore()` - or even activated - i.e. by `<MobxStoreProvider/>`.

---

```js
getStoreState(storeId?)
```

|                            | **Arguments**                                                                                                                                                        |
| -------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **storeId**<br/>`{string}` | _(optional)_<br/>The internal name (e.g. `'program'`) of the MobX-store. The default store is used if you omit this argument.                                        |
|                            | **Results**                                                                                                                                                          |
|                            | `getStoreState()` returns either `null`, `'pending'` or `'active'`                                                                                                   |
|                     `null` | It returns `null` if the store with the given internal name wasn't announced, yet.                                                                                   |
|                 `{string}` | It returns `'pending'` if the store was already injected with `announceStore()` but not yet activated with `<MobxStoreProvider/>`, e.g. outside of React components. |
|                            | It returns `'active'` inside of React components if the store with the given name was announced and then activated by a wrapping `<MobxStoreProvider/>`.             |
|                            | This function is not expected to throw any error.                                                                                                                    |

```js
// Example

if (getStoreState() === "active") {
  const { addProxy } = useStore()
  ...
}
```

## `compressStoreDataIntoJavascriptCode()`

![](https://img.shields.io/badge/SSR-server--side-brown) ![](https://img.shields.io/badge/no%20SSR-n/a-black)

> `compressStoreDataIntoJavascriptCode()` is used for setups with server-side rendering, where the raw store-data is created on the server and filled with some initial content.

This function takes the changed store-data and turns it into some HTML-code which should be embedded into a &lt;script&gt;-section of the main document before sending it to the client.

It can handle the data of single stores - i.e. from `createStore()` - as well as multi stores - i.e. from `createMultiStore()`.

> **Please note**<br/>In our setups this function is currently exported to the server as `getCompressedStoreCode()` from the "public" directory.

---

```js
compressStoreDataIntoJavascriptCode(storeData)
```

|                              | **Arguments**                                                                                                                                                                                                        |
| ---------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **storeData**<br/>`{object}` | Raw data of a store which was created with `createStore()` or `createMultiStore()` and which typically was already filled with some additional data.                                                                 |
|                              | **Results**                                                                                                                                                                                                          |
|                   `{string}` | `compressStoreDataIntoJavascriptCode()` always returns a string with Javascript code. (Normally this code will add an encoded version of the given data to an internally used property of the global Window-object.) |
|                              | An empty string is returned in case of errors, e.g. because of invalid input-data.                                                                                                                                   |
|                              | This function is not expected to throw any error.                                                                                                                                                                    |

```js
// Example from "program-web"
// (which uses handlebars on the server to create HTML ...)

const storeData = createMultiStore('program')
await _fillStoreDataOnServerSide({ storeData })

const compressedStoreCode = compressStoreDataIntoJavascriptCode(storeData)

res.render('react/index', {
  compressedStoreCode,
})
```

```handlebars
<!-- (... with markup like this in the handlebars-template) -->

<script>{{{compressedStoreCode}}}</script>
```

## `uncompressStoreDataFromDocument()`

![](https://img.shields.io/badge/SSR-client--side-green) ![](https://img.shields.io/badge/no%20SSR-n/a-black)

> This function is used for setups with server-side rendering, where the server creates the raw store-data and fills it with some initial content before sending the HTML-document to the browser.

It uses the results of the JavaScript-code which was prepared by `compressStoreDataIntoJavascriptCode()` on the server and then run inside the browser.

You will get the same raw store-data like the one which was created and changed on the server.

---

```js
uncompressStoreDataFromDocument()
```

|            | **Arguments**                                                                                                                                                                    |
| ---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|            | This function takes no arguments.                                                                                                                                                |
|            | **Results**                                                                                                                                                                      |
| `{object}` | `uncompressStoreDataFromDocument()` returns a container-object with the raw data to be later used by the MobX stores.                                                            |
|            | If no JavaScript-code was received from the server, the raw data of a freshly created default store is returned - i.e. in that case the result is the same like `createStore()`. |
|    `Error` | An error might be thrown, especially in case of invalid arguments.                                                                                                               |

```js
// Example

const storeData = uncompressStoreDataFromDocument()

const app = (
  <MobxStoreProvider storeData={storeData}>
    <StartPage />
  </MobxStoreProvider>
)

React.render(app, document.getElementById('app'))
```

## `<MobxStoreProvider/>`

![](https://img.shields.io/badge/SSR-client--side-green) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

`<MobxStoreProvider/>` is a component which will usually wrap the complete React-app - at least it should wrap all other components which need access to the stores.

It takes some raw store-data and turns it into a MobX-store. Every component which lies inside `<MobxStoreProvider/>` might then access the stores by using the `useStore()` hook.

---

```html
<MobxStoreProvider storeData singleStoreId?>{children}</MobxStoreProvider>
```

|                                  | **Props**                                                                                                                                                                                                            |
| -------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     **storeData**<br/>`{object}` | Raw store-data from `createStore()`, `createMultiStore()` or `uncompressStoreDataFromDocument()`.                                                                                                                    |
| **singleStoreId**<br/>`{object}` | _(optional)_<br/>(Only) If you prepared a single-store with `createStore(storeId)` and an own **storeId** (i.e. not `'default'`), you have to state this ID here, too. Omit this prop if you are using multi-stores. |
|           **children**<br/>`JSX` | Give your complete React-app, here, or just some components which are going to access the stores with `useStore()`.                                                                                                  |
|                                  | **Output**                                                                                                                                                                                                           |
|                            `JSX` | The output will contain nothing more than **children**, but MobX will be prepared in the background.                                                                                                                 |
|                          `Error` | An error might be thrown, especially in case of invalid props.                                                                                                                                                       |

```js
// Example from "program-web"

const storeData = createMultiStore('program')

const app = (
  <MobxStoreProvider storeData={storeData}>
    <StartPage />
  </MobxStoreProvider>
)

React.render(app, document.getElementById('app'))
```

```js
// Example from "program-web"

const storeData = createStore('program')

const app = (
  <MobxStoreProvider storeData={storeData} singleStoreId="program">
    <StartPage />
  </MobxStoreProvider>
)

React.render(app, document.getElementById('app'))
```

> Internally, `<MobxStoreProvider/>` uses React.Context and its `<Provider/>` component to provide the MobX-stores to you React-app.

## `useStore()`

![](https://img.shields.io/badge/SSR-client--side-green) ![](https://img.shields.io/badge/no%20SSR-client--side-green)

This function is a React hook which let's you access the current state of a prepared MobX-store.

> **Please note**<br/>`useStore()` can only be used inside functional React-components.

---

```js
useStore(storeId?)
```

|                            | **Arguments**                                                                                                                                       |
| -------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **storeId**<br/>`{string}` | _(optional)_<br/>The internal name (e.g. 'program') of the MobX-store you want to access. If you omit this argument, the default store is returned. |
|                            | **Results**                                                                                                                                         |
|                 `{object}` | `useStore()` returns the requested MobX-store in its current state.                                                                                 |
|                    `Error` | It might throw an error, especially if no store with the given ID (or default store, respectively) could be found.                                  |

> **Please note**<br/>In order to get access to the MobX-store with `useStore()`, two requirements must be fulfilled:
>
> - The component is wrapped into a matching `<MobxStoreProvider/>`. This will most likely happen indirectly by wrapping the complete React-app.
> - The component itself must be directly wrapped by MobX's `observer()` function before it is exported and used inside the React-app (see example below).

```js
// Example

import React from 'react'
import { observer } from 'mobx-react'

export default observer(Icon)

function Icon(props) {
  const { filename } = props
  const { addProxy } = useStore()

  const src = `${addProxy()}/static/icons/${filename}`

  return <img src={src} alt="" />
}
```

> Internally, `useStore()` uses React's `useContext()` hook to get access to the data provided by MobX and `<MobxStoreProvider/>`.

> The returned object actually is a `Proxy` created by MobX's `useLocalObservable()` hook earlier in connection with `<MobxStoreProvider/>`.

## `activateTestEnvironment()`

![](https://img.shields.io/badge/SSR-unit--tests-blue) ![](https://img.shields.io/badge/no%20SSR-unit--tests-blue)

`activateTestEnvironment()` can be used during unit-tests. It should be called in the beginning of your test-file, e.g. before `announceStore()`.

`useStore()` normally throws an error if a React component uses it without being wrapped in a matching `<MobxStoreProvider/>`. But now, `useStore()` will deliver dummy stores, instead.

---

```js
activateTestEnvironment()
```

This function takes no arguments. It returns nothing and never throws an error.

# Designing your stores

Most of the time, your application will need more functionality in the stores then what's already included in the default store. That's the reason why your application will have at least one "init-callback" - e.g. `createProgramStore()` - which you are going to register with `announceStore()`.

It's those "init-callbacks" which define the data-structures and actions of your stores.

## Basic structure

Such an "init-callback" is basically a function which returns a JavaScript-object containing all needed data (e.g. `currItemCodes`) as well as methods to mutate them (e.g. `setCurrItemCodes()`).

> **Please note**<br/>Never change internal data from a MobX-store outside of the store - create in-store actions for any needed kind of mutation.

```js
// Example from "program-web"

export default createProgramStore

function createProgramStore() {
  const store = {
    currItemCodes: [null, null],
    setCurrItemCodes(newList) {
      this.currItemCodes = newList
    },
  }
  return store
}
```

## Observables and actions

When working with React and MobX, it's good to understand the idea of having "observables" and "actions" in MobX-stores which are then used by "observers".

### 1. Observables

An "observable" is any kind of data which is kept in a MobX-store.

```js
// Example - only to demonstrate MobX w/o MobxUtils:
import { observable } from 'mobx'

const store = {
  currItemCodes: observable([null, null]),
  // ...
}
```

### 2. Actions

An "action" is a function that is used to mutate data in the MobX-store - and possibly also returns some data.

```js
// Example - only to demonstrate MobX w/o MobxUtils:
import { action } from 'mobx'

const store = {
  // ...
  setCurrItemCodes: action(function setCurrItemCodes(newList) {
    this.currItemCodes.replace(newList)
  }),
}
```

> **Please note**<br/>MobX also knows "computeds", i.e. functions that only read some observables and return more structured data. However, `useLocalObserver()` doesn't distinguish between "computeds" and "actions" - as long as you don't mark methods as "getters", e.g. with TypeScript or `Object.defineProperty()`.
>
> That said, with MobxUtils every in-store method usually is an "action".

### 3. Observers

An "observer" is any React component which will access MobX-stores and is automatically updated by MobX whenever related parts of the stores have changed.

```js
// Example
export default observer(SystemMessage)

function SystemMessage() {
  const { getSystemMessage } = useStore()
  const message = getSystemMessage()
  if (message) {
    return (
      <div className="alert alert-info" role="alert">
        {message}
      </div>
    )
  }
  return null
}
```

### But: No need to use MobX functions

There is normally **no need to use** `observable()`, `action()`, `computed()`, `set()`, `.replace()`, `isObservableArray()` etc. **anywhere inside the init-callbacks**.

MobxUtils wraps the result of any "init-callback" with the `useLocalObservable()` hook from MobX. This way every managed store is automatically turned into a "proxy":

- Every non-function in the store is recursively turned into an "observable", and
- Every (synchronous) function is wrapped by `action()`.

Best of all: This is also true for any later changes done inside the store!

This way it's easier to design your stores and to use the same code in server/client setups.

> You can read more about `makeAutoObservable()` and `observable()` on [mobx.js.org](https://mobx.js.org/observable-state.html#makeautoobservable).

> **Please note**<br/>If you have asynchronous methods in your store, you might need to use `runInAction()` at some places. (Read more about "asynchronous actions" in the next section.)

> **Please note**<br/>The described behaviour was tested with React v17, MobX v6 and mobx-react v7. It might be different with older versions and could of course change in future releases.

## Asynchronous actions

With version 6 of MobX you might get such a warning in the browser's console:

```
[MobX] Since strict-mode is enabled, changing (observed) observable values
without using an action is not allowed.
```

You might also experience that React components don't update even if the store is changed.

### The problem

> With MobxUtils every in-store method is automatically turned into an "action". But in case of asynchronous functions this is only true for the method's initial part before the first `await`.

A reason for the MobX-warning might be some asynchronous methods in your store that mutate observables **after** waiting for some Promises. In the following example, the final lines of `queryProgramListAsync()` are the problematic part:

```js
// Bad example: Init-callback from "program-web"
const store = {
  programListCache: { ready: false, data: {} },

  async queryProgramListAsync() {
    if (this.programListCache.ready === false) {
      const uri = getServerApiUri({ routeId: 'getDataAdminProgramList' })

      // "await" is already used before the mutation:
      const data = await queryServerApiAsync({ method: 'get', uri })

      // Those two lines will likely cause a warning in MobX v6:
      this.programListCache.ready = true
      this.programListCache.data = data
    }
  },

  async refreshProgramListAsync() {
    if (this.programListCache.ready) {
      // Those two lines will NOT cause a MobX-warning:
      this.programListCache.ready = false
      this.programListCache.data = {}
    }

    // "await" is only used after the mutation:
    await this.queryProgramListAsync()
  },
}
```

> You could deactivate the warning with MobX's `configure()` function and hope that MobX will still work as expected.
>
> MobX also has a special function `flow()` for this kind of situations. But first, you would have to turn your asynchronous method into a generator function which yields Promises. In the end it might be harder to understand what's going on.

One of the following proposals will possibly be a preferred solution.

### One solution: Use `runInAction()`

MobX has a tool-function called `runInAction()`. You can use this to turn the problematic part of your asynchronous method into an "action", manually.

```js
// Good example: Init-callback from "program-web"
import { runInAction } from 'mobx'

const store = {
  programListCache: { ready: false, data: null },

  async queryProgramListAsync() {
    if (this.programListCache.ready === false) {
      const uri = getServerApiUri({ routeId: 'getDataAdminProgramList' })
      const data = await queryServerApiAsync({ method: 'get', uri })

      runInAction(() => {
        this.programListCache.ready = true
        this.programListCache.data = data
      })
    }
  },

  // ...
}
```

### Another solution: Use a synchronous setter

If you move the problematic part of your method into a new synchronous function - e.g. `setProgramList()` -, this will automatically become an "action" because of MobxUtils. You can then call the new "action" from inside the asynchronous method.

```js
// Good example: Init-callback from "program-web"
const store = {
  programListCache: { ready: false, data: null },

  async queryProgramListAsync() {
    if (this.programListCache.ready === false) {
      const uri = getServerApiUri({ routeId: 'getDataAdminProgramList' })
      const data = await queryServerApiAsync({ method: 'get', uri })

      this.setProgramList(data)
    }
  },

  setProgramList(data) {
    this.programListCache.ready = true
    this.programListCache.data = data
  },
}
```

## Use the default store outside of any other store

The default store which is shipped with this MobxUtils module already includes some general actions which might be useful for your application.

> See the implementation in file "defaultStore.js" of this module for more details.

In most of the setups the default store will be accessible from within your functional component.

```js
// Example

const { addProxy } = useStore()
```

> **Please note**<br/>If you use `createStore(storeId)` with any other store-ID than `'default'`, you won't get access to the default store. Use `createMultiStore(storeId)`, instead.

## Use the default store inside another store

You might possibly want to access the default store even from within some other store (e.g. to use `serverPaths`). This can be enabled by adding **defaultStore** as argument to your "init-callback" and saving the received value in your raw store-data like this:

```js
// Example from "program-web"

export default createProgramStore

function createProgramStore(defaultStore) {
  return {
    defaultStore,

    itemDataCache: observable({}),
    async queryProgramDataAsync(code) {
      const { defaultStore } = this

      const uri = getServerApiUri({ defaultStore, routeId: 'getProgramSummaryByCode' })
      const data = await queryServerApiAsync({ method: 'get', uri, params: { code } })

      set(this.itemDataCache, { [code]: data })
    },
  }
}
```

## Replace the default store

If you need to change the functionality of the default store, it's a good way to replace the complete "init-callback" of the internal default store with `announceStore('default', callback)` in the same way like you register any other store.

> It could be a good idea to use the file "createDefaultStore.js" as a template.

# Running unit tests

Whenever you want to test a observer component, i.e. a React component which contains `useStore()` to access a MobX-store, there are two ways to do this:

- with `<MobxStoreProvider/>` or
- without `<MobxStoreProvider/>`

> **Please note**<br/>The following examples contain unit-tests for the following `<Icon/>` component. The given component uses the integrated default store. The later examples are based on Jest and React Testing Library.
>
> ```js
> // Example: Icon.jsx
>
> import React from 'react'
> import { observer } from 'mobx-react'
>
> export default observer(Icon)
>
> function Icon(props) {
>   const { filename } = props
>   const { addProxy } = useStore()
>
>   const src = `${addProxy()}/static/icons/${filename}`
>
>   return <img src={src} alt="" />
> }
> ```

## Testing observer components using `<MobxStoreProvider/>`

One way is to follow the "Basic workflow - client only" in your tests, too:

- You might need to use `announceStore()`, first.
- Create a test-store with `createStore()` or `createMultiStore()`.
- Inside every test, wrap the component with `<MobxStoreProvider/>`.

> **Please note**<br/>Our example component only accesses the integrated default store - that's why there is no need for `announceStore()` in the following code.

```js
// Example: Icon.test.jsx

import React from 'react'
import { render } from '@testing-library/react'

const defaultStore = createStore()
defaultStore.setBrowserConfig({ proxyPrefixPath: { uri: '/test-app' } })

describe('<Icon/>', () => {
  it('- when given a filename - creates output as expected', () => {
    const { container } = render(
      <MobxStoreProvider storeData={defaultStore}>
        <Icon filename="test.png" />
      </MobxStoreProvider>
    )

    expect(container.firstChild).toMatchInlineSnapshot(`
      <img src="/test-app/static/icons/test.png" alt="" />
    `)
  })
})
```

## Testing observer components w/o using `<MobxStoreProvider/>`

Another way is to use `activateTestEnvironment()`.

> This will activate a special test-mode inside MobxUtils. If a component then contains the `useStore()` hook without being wrapped inside a matching `<MobxStoreProvider/>`, a dummy-store with initial content will be returned by `useStore()` instead of throwing an error.

This allows you to write simpler tests for your components, but you loose the chance to manipulate the store before it is used by the observer component:

- Call `activateTestEnvironment()` in the beginning of your test-file.
- You might still need to use `announceStore()` - in case your components are not only accessing the integrated default store.

> **Please note**<br/>Feel free to combine both approaches. If you want to change the content of the store inside your test, you still can use `createStore()` and `<MobxStoreProvider/>` in some of the tests.

```js
// Example: Icon.test.jsx

import React from 'react'
import { render } from '@testing-library/react'

activateTestEnvironment()

describe('<Icon/>', () => {
  it('- when given a filename - creates output as expected', () => {
    const { container } = render(<Icon filename="test.png" />)

    expect(container.firstChild).toMatchInlineSnapshot(`
      <img src="/static/icons/test.png" alt="" />
    `)
  })
})
```
