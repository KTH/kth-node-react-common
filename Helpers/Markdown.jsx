// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const MarkdownIt = require('markdown-it')

const propTypes = {
  markup: PropTypes.string,
  className: PropTypes.string,
}

const defaultProps = {
  markup: null,
  className: null,
}

const markdownEngine = new MarkdownIt({ breaks: true })

/**
 * &lt;Markdown/&gt;
 * takes some markup and turns it into HTML-elements.
 *
 * @param {object} props
 * @param {string} [props.markup]
 * @param {string} [props.className] Additional CSS-classes
 *
 * @returns {JSX.Element}
 */
function Markdown(props) {
  const { markup, className } = props

  const _className = className ? `Markdown ${className}` : 'Markdown'

  if (typeof markup !== 'string' || markup === '') {
    return <div className={_className} />
  }

  const __html = markdownEngine
    .render(markup)
    .replace(/<a href="([^"]+)">/g, '<a href="$1" target="_blank" rel="noopener noreferrer">')

  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html }} className={_className} />
}

Markdown.propTypes = propTypes
Markdown.defaultProps = defaultProps

module.exports = Markdown
