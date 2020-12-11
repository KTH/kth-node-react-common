// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const propTypes = {
  content: PropTypes.string,
}

const defaultProps = {
  content: '',
}

/**
 * `<Badges />`
 *
 * @param {object} props
 * @param {string} [props.content]
 */
function Badges(props) {
  const { content } = props
  if (typeof content !== 'string' || content === '') {
    return null
  }

  const items = content.split(',').filter(text => text !== '')
  if (items.length === 0) {
    return null
  }

  const elements = items
    .map(text => {
      const [caption, type] = text.split(':')
      return caption ? (
        <span key={caption} className={`badge badge-${type || 'primary'}`}>
          {caption}
        </span>
      ) : null
    })
    .filter(item => item != null)

  return <span className="Badges">{elements}</span>
}

Badges.propTypes = propTypes
Badges.defaultProps = defaultProps

module.exports = Badges
