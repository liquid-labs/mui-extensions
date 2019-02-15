import React from 'react'

import { withStyles } from '@material-ui/core/styles'

const style = {
  // alignment styles, matched to 'method' property.
  absolute : {
    position   : 'absolute',
    top        : '50%',
    marginTop  : '-20px', // matches default size of 40; overriden if 'size' set
    left       : '50%',
    marginLeft : '-20px'
  },
  textAlign : {
    textAlign : 'center'
  },
  flex : {
    display        : 'flex',
    justifyContent : 'center',
    alignContent   : 'center',
    textAlign      : 'center'
  }
}

const Centered = withStyles(style)(({method, classes, style, children, ...props}) => {
  method = method || 'absolute'
  if (props.size && method === 'absolute') {
    style = style || {}
    const vOffset = `${(props.size.v || props.size) / 2}px`
    const hOffset = `${(props.size.h || props.size) / 2}px`
    if (!style.marginTop) style.marginTop = vOffset
    if (!style.marginLeft) style.marginLeft = hOffset
  }

  const allProps = {
    style: style,
    ...props
  }
  if (method && method !== 'absolute') {
    return (
      <div className={classes[method]}>
        { typeof children === 'function' ? children(allProps) : children }
      </div>
    )
  }
  else {
    return typeof children === 'function' ? children(allProps) : children
  }
})

export { Centered }
