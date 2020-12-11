# kth-node-react-common ![alt text](https://api.travis-ci.org/KTH/kth-node-react-common.svg?branch=main)

KTH Stockholm has several applications which are based on React and support server-side rendering with Node.js, e.g. some smaller parts of https://www.kth.se. This package contains common utility functions and components used by those applications.

# Installation

- Install the package:

  ```js
  npm install @kth/kth-node-react-common
  ```

- Install the peer-dependencies of the package:

  ```js
  npm install axios react prop-types
  ```

# How to use

- Option 1: Import parts of the package and destructure them then:

  ```js
  // Examples (ES6 style):
  import { ReactUtils, ReactHelpers, FormHelpers, MobxUtils } from '@kth/kth-node-react-common'

  const { ensureObject, formatDate } = ReactUtils
  const { Breadcrumbs, SystemMessage } = ReactHelpers
  const { useDataBag, Input } = FormHelpers
  const { useStore } = MobxUtils
  ```

  ```js
  // Examples (CommonJS style):
  const { ReactUtils, ReactHelpers, FormHelpers, MobxUtils } = require('@kth/kth-node-react-common')

  const { ensureObject, formatDate } = ReactUtils
  const { Breadcrumbs, SystemMessage } = ReactHelpers
  const { useDataBag, Input } = FormHelpers
  const { useStore } = MobxUtils
  ```

- Option 2: Import sub-directory of the package and destructure them directly:

  ```js
  // Examples (ES6 style):
  import { ensureObject, formatDate } from '@kth/kth-node-react-common/utils'
  import { Breadcrumbs, SystemMessage } from '@kth/kth-node-react-common/helpers'
  import { useDataBag, Input } from '@kth/kth-node-react-common/FormHelpers'
  import { useStore } from '@kth/kth-node-react-common/MobxUtils'
  ```

  ```js
  // Examples (CommonJS style):
  const { ensureObject, formatDate } = require('@kth/kth-node-react-common/utils')
  const { Breadcrumbs, SystemMessage } = require('@kth/kth-node-react-common/helpers')
  const { useDataBag, Input } = require('@kth/kth-node-react-common/FormHelpers')
  const { useStore } = require('@kth/kth-node-react-common/MobxUtils')
  ```

- Option 3: Import parts of the package, destructure them twice directly:

  > This is only possible with CommonJS style imports.

  ```js
  // Examples (CommonJS style):
  const { ensureObject, formatDate } = require('@kth/kth-node-react-common').ReactUtils
  const { Breadcrumbs, SystemMessage } = require('@kth/kth-node-react-common').ReactHelpers
  const { useDataBag, Input } = require('@kth/kth-node-react-common').FormHelpers
  const { useStore } = require('@kth/kth-node-react-common').MobxUtils
  ```

# Package content

The different parts of this package are described in detail in the following Markdown files:

- [MobxUtils](./MOBXUTILS.md)
- Other utilities (tbd.)
- Helper components (tbd.)
- FormHelper components (tbd.)
