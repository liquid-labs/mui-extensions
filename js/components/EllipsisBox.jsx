import React from 'react'
import PropTypes from 'prop-types'

export const EllipsisBox = ({children}) =>
  <div style={{
    textOverflow : 'ellipsis',
    overflow     : 'hidden',
    whiteSpace   : 'nowrap'}}
  >
    { children }
  </div>

EllipsisBox.propTypes = {
  children : PropTypes.object.isRequired
}
