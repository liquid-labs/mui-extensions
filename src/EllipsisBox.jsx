import React from 'react'

export const EllipsisBox = ({children}) =>
  <div style={{
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'}}
  >
    { children }
  </div>
