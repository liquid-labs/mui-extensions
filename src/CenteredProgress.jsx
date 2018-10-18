import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress';

import { withStyles } from '@material-ui/core/styles';

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
  }
}

const CenteredProgressBase = ({method, classes, style, ...props}) => {
  method = method || 'absolute'
  if (props.size && method === 'absolute') {
    style = style || {}
    const offset = `${props.size / 2}px`
    if (!style.marginTop) style.marginTop = offset
    if (!style.marginLeft) style.marginLeft = offset
  }
  if (method && method !== 'absolute') {
    return (
      <div className={classes[method]}>
        <CircularProgress style={style} {...props} />
      </div>
    )
  }
  else {
    return (
      <CircularProgress className={classes.absolute}
          style={style}
          {...props} />
    )
  }
}

export const CenteredProgress = withStyles(style)(CenteredProgressBase)
