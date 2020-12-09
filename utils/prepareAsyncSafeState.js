/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const { useEffect, useState } = require('react')

module.exports = prepareAsyncSafeState

/**
 * `useAsyncSafeState()`
 * can be used to replace the normal useState()-hook inside a functional React component
 * with a hook that only changes the state-variable if the related component is still mounted.
 *
 * Usage:
 * - Call prepareAsyncSafeState() in the beginning of your functional React component.
 * - Use the hook useAsyncSafeState() from the returned object instead of normal useState().
 *
 * Example snippet:
 *      function TestComponent(props) {
 *        const { useAsyncSafeState } = prepareAsyncSafeState()
 *        const [testState, setTestState] = useAsyncSafeState({ name: "Test" })
 *        ...
 *      }
 *
 * This might help to solve problems which produce the warning
 * "Can't perform a React state update on an unmounted component.".
 * Typical reasons for such problems is that you try to update a state
 * with setTimeout() or after a Promise resolves/rejects.
 */
function prepareAsyncSafeState() {
  let isMounted = true
  const gotUnmounted = () => {
    isMounted = false
  }

  useEffect(() => gotUnmounted, [])

  const useAsyncSafeState = initialValue => {
    const [state, setState] = useState(initialValue)
    const safeSetState = input => (isMounted ? setState(input) : null)
    return [state, safeSetState]
  }

  return { useAsyncSafeState }
}
