import React from 'react'

import Grid from '@material-ui/core/Grid'

export const NestedGrid = ({children, style, ...props}) => {
  const ourStyle = {width : 'initial', margin : 0, padding : 0}
  const finalStyle = Object.assign(ourStyle, style)
  return (
    <Grid style={finalStyle} {...props}>
      {children}
    </Grid>
  )
}
