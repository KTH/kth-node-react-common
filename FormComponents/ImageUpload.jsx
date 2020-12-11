// @ts-check

const React = require('react')
const PropTypes = require('prop-types')

const { useEffect, useRef } = React

const { Badges } = require('../Helpers')
const { ensureObject, isObject } = require('../utils')

const { getCurrentInputData, setCurrentInputData } = require('./internals')

const propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  badges: PropTypes.string,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  dataBag: PropTypes.object,
  dataPath: PropTypes.string,
  currValue: PropTypes.string,
  setCurrValue: PropTypes.func,
  maxFileSize: PropTypes.number,
}

const defaultProps = {
  id: '',
  label: '',
  badges: '',
  className: '',
  dataBag: null,
  dataPath: '',
  currValue: '',
  setCurrValue: null,
  maxFileSize: null,
}

/**
 * https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/
 *
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.byteLength; index++) {
    binary += String.fromCharCode(bytes[index])
  }
  return window.btoa(binary)
}

/**
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
// eslint-disable-next-line no-unused-vars
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let index = 0; index < binaryString.length; index++) {
    bytes[index] = binaryString.charCodeAt(index)
  }
  return bytes.buffer
}

/**
 * `<ImageUpload />`
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.label]
 * @param {string} [props.badges]
 * @param {string} [props.className]
 * @param {object} [props.dataBag]
 * @param {string} [props.dataPath]
 * @param {object|null} [props.currValue]
 *    with shape { name, contentType, size, base64content }
 * @param {(newValue: object|null) => void} [props.setCurrValue]
 * @param {number} [props.maxFileSize] e.g. 1024 * 1024 (1 MByte)
 */
function ImageUpload(props) {
  const { id, label, className, dataBag, dataPath, currValue, setCurrValue, badges, maxFileSize } = props

  const hiddenFileInputRef = useRef(null)

  if (badges && !label) {
    // eslint-disable-next-line no-console
    console.warn("<ImageUpload/> can't show badges without label")
  }
  if (label && !id) {
    // eslint-disable-next-line no-console
    console.error("<ImageUpload/> failed - can't show label without ID")
    return null
  }

  const canAccessData = isObject(dataBag) && typeof dataPath === 'string' && dataPath !== ''
  const gotDirectData = typeof setCurrValue === 'function'

  let value = null
  let setValue = null

  if (canAccessData) {
    value = getCurrentInputData({ dataBag, dataPath })
    setValue = newValue => setCurrentInputData({ dataBag, dataPath, newValue })
  } else if (gotDirectData) {
    value = currValue
    setValue = newValue => setCurrValue(newValue)
  }

  if (setValue == null) {
    // eslint-disable-next-line no-console
    console.error('<ImageUpload/> failed - missing callback to update input')
    return null
  }

  const _handleUpload = function _handleUpload() {
    // eslint-disable-next-line react/no-this-in-sfc
    const newFile = ensureObject(this.files)[0]
    if (isObject(newFile) && newFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = event => {
        const buffer = event.target.result
        // @ts-ignore
        const size = buffer.byteLength
        if (typeof maxFileSize === 'number' && maxFileSize > 0 && size > maxFileSize) {
          return
        }
        // @ts-ignore
        const base64content = arrayBufferToBase64(buffer)
        setValue({ name: newFile.name, contentType: newFile.type, size, base64content })
      }
      reader.readAsArrayBuffer(newFile)
    }
  }

  useEffect(() => {
    hiddenFileInputRef.current.addEventListener('change', _handleUpload, false)
    return () => {
      if (hiddenFileInputRef.current) {
        hiddenFileInputRef.current.removeEventListener('change', _handleUpload)
      }
    }
  })

  const { name, contentType, base64content } = ensureObject(value)
  const hasImage = base64content != null && contentType.startsWith('image/')

  const labelElement =
    id && label ? (
      <label className="form-control-label" htmlFor={id}>
        {label}
        <Badges content={badges} />
      </label>
    ) : null

  const filenamePreview = hasImage ? `Filnamn: ${name}` : 'Ingen fil'

  const removeButton = hasImage ? (
    <button type="button" className="btn btn-secondary" onClick={() => setValue(null)}>
      Ta bort
    </button>
  ) : null

  const _openFileSelect = () => hiddenFileInputRef.current.click()

  let filesizeHint = null
  if (typeof maxFileSize === 'number' && maxFileSize > 0) {
    let sizeText = String(maxFileSize) + ' bytes'
    if (maxFileSize >= 1024) {
      if (maxFileSize >= 1024 * 1024) {
        sizeText = String(maxFileSize / 1024 / 1024) + ' megabytes'
      } else {
        sizeText = String(maxFileSize / 1024) + ' kilobytes'
      }
    }
    filesizeHint = <div className="ImageUpload-maxsize">{`(Maximal filstorlek: ${sizeText})`}</div>
  }

  return (
    <div className={`ImageUpload ${className}`.trim()}>
      {labelElement}
      <div id={id}>
        <div className="form-control">{filenamePreview}</div>
        {filesizeHint}
        <div className="ImageUpload-buttons">
          <button type="button" className="btn btn-primary" onClick={_openFileSelect}>
            Välj ny fil
          </button>
          {removeButton}
          <input ref={hiddenFileInputRef} type="file" accept="image/*" />
        </div>
      </div>
    </div>
  )
}

ImageUpload.propTypes = propTypes
ImageUpload.defaultProps = defaultProps

module.exports = ImageUpload
