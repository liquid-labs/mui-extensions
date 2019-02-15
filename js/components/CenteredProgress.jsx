import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import { Centered } from './Centered'

const CenteredProgress = ({method, size, ...props}) => {
  method = method || 'absolute'
  size = size || 40
  return (
    <Centered method={method} size={size} {...props}>
      { (props) => <CircularProgress {...props} /> }
    </Centered>
  )
}

export { CenteredProgress }
