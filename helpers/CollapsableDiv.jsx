// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { useEffect, useRef } = React

const { Animation, prepareAsyncSafeState } = require('../utils')

const propTypes = {
  open: PropTypes.bool.isRequired,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  transitionLengthMS: PropTypes.number,
}

const defaultProps = {
  className: '',
  children: null,
  transitionLengthMS: 500,
}

function _setFinalStyle({ container, newOpen }) {
  const wrapper = container.firstChild

  if (newOpen) {
    container.removeAttribute('style')
    wrapper.removeAttribute('style')
  } else {
    wrapper.setAttribute('style', 'display: none;')
    container.removeAttribute('style')
  }
}

function _turnIntoStyleString(styleObject) {
  const properties = Object.keys(styleObject)
  if (properties.length === 0) {
    return null
  }

  const styleString = properties.map(key => `${key}: ${styleObject[key]};`).join(' ')
  return styleString
}

function _resetAnimation({ animation, newOpen, container, transitionLengthMS }) {
  const wrapper = container.firstChild

  if (animation != null) {
    animation.abort()
  }

  const newAnimation = new Animation()

  const currHeights = { container: null, wrapper: null }
  const currStyles = { container: {}, wrapper: {} }

  newAnimation.addAction(0, () => {
    const containerRect = container.getBoundingClientRect()
    currHeights.container = containerRect.height

    currStyles.container = {
      position: 'relative',
      overflow: 'hidden',
      height: `${currHeights.container}px`,
      transition: `height ${transitionLengthMS}ms ease-in-out`,
    }
    currStyles.wrapper = {
      display: 'block',
      position: 'absolute',
      width: '100%',
    }

    container.setAttribute('style', _turnIntoStyleString(currStyles.container))
    wrapper.setAttribute('style', _turnIntoStyleString(currStyles.wrapper))

    const wrapperRect = wrapper.getBoundingClientRect()
    currHeights.wrapper = wrapperRect.height
  })

  newAnimation.addAction(100, () => {
    currStyles.container.height = newOpen ? `${currHeights.wrapper}px` : 0
    container.setAttribute('style', _turnIntoStyleString(currStyles.container))
  })

  newAnimation.addAction(transitionLengthMS + 200, () => {
    _setFinalStyle({ container, newOpen })
  })

  newAnimation.init()

  return newAnimation
}

/**
 * `<CollapsableDiv />`
 * wraps the given children into a container which can be collapsed and expanded
 * by changing the "open" property. The transition will be animated.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} [props.className]
 * @param {JSX.Element|JSX.Element[]} [props.children]
 * @param {number} [props.transitionLengthMS]
 */
function CollapsableDiv(props) {
  const { open, className, children, transitionLengthMS } = props
  const { useAsyncSafeState } = prepareAsyncSafeState()

  const newOpen = open === true

  const [shallBeOpened, setShallBeOpened] = useAsyncSafeState(newOpen)
  const [animation, setAnimation] = useAsyncSafeState(null)

  const mainDivRef = useRef(null)

  useEffect(() => {
    const container = mainDivRef.current

    if (shallBeOpened === newOpen) {
      _setFinalStyle({ container, newOpen })
      return
    }

    const newAnimation = _resetAnimation({ animation, newOpen, container, transitionLengthMS })
    setShallBeOpened(newOpen)
    setAnimation(newAnimation)
  }, [newOpen])

  return (
    <div ref={mainDivRef} className={`${className} CollapsableDiv open-${shallBeOpened}`.trim()}>
      <div className="CollapsableDiv-wrapper">{children}</div>
    </div>
  )
}

CollapsableDiv.propTypes = propTypes
CollapsableDiv.defaultProps = defaultProps

module.exports = CollapsableDiv
