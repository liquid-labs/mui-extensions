import React from 'react'
import classNames from 'classnames'

import { withStyles } from '@material-ui/core/styles'

import IconButton from '@material-ui/core/IconButton'

const styles = {
  tinyButton: {
    width: '24px',
    height: '24px',
    '& svg': {
      height: '18px',
      width: '18px',
    }
  },
  // placement styles
  bottomRight: {
    position: 'absolute',
    bottom: '8px',
    right: '8px'
  },
  floatRight: {
    float: 'right'
  }
}

const TinyIconButtonBase = ({children, classes, placement, className, ...props}) => {
  className = classNames(className, classes.tinyButton, classes[placement])
  return (
    <IconButton className={className} {...props}>{children}</IconButton>
  )
}

export const TinyIconButton = withStyles(styles)(TinyIconButtonBase)
