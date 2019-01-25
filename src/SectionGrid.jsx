import React from 'react'
import { compose } from 'recompose'
import classNames from 'classnames'

import Grid from '@material-ui/core/Grid'
import { Help } from '@liquid-labs/mui-extensions'
import Paper from '@material-ui/core/Paper'
import { NestedGrid } from '@liquid-labs/mui-extensions'

import { withStyles } from '@material-ui/core/styles'

const style = (theme) => ({
  root: {
    display: 'flex',
  },
  paper: {
    flex: '1 1 auto',
    paddingBottom: '16px'
  },
  sectionTitle: {
    ...theme.typography.subheading,
    fontStyle: 'oblique',
    color: theme.palette.primary.main,
    fontWeight: 500,
    // with spacing 8, that's a normal bottom padding of 4; we maintain the same
    // distance overall with 0 + (3 + 2) + 1, adding a little extra spacing on
    // bottom to distance the header element
    paddingBottom: '0 !important',
    margin: '0 4px 3px 4px', // TODO: support non-8 spacings
    borderBottom: `1px solid ${theme.palette.primary.main}`
  }
})

const innerSpacing = 8

const SectionGrid = ({breakpoint, title, help, BottomContent, elevation,
    square, helpAnchor, helpOpen, helpClose,
    children, classes, className, ...props}) => {
  className = classNames(classes.root, className)
  elevation = elevation || (() => { switch (breakpoint) {
    case 'xs': return 0
    case 'sm': return 1
    case 'md': return 3
    case 'lg': return 5
    case 'xl': return 7
    default: return 3
  }})()
  square = square || breakpoint === 'xs'
  const gridSpec = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 4,
    xl: 3,
  }
  return (
    <Grid item {...props} {...gridSpec} className={className}>
      <Paper elevation={elevation} square={square}
          className={classNames(classes.paper)}
      >
        <NestedGrid
          spacing={innerSpacing} direction="column" alignItems="flex-start" container>
          {title && <Grid item style={{width: `calc(100% - ${innerSpacing}px`}} className={classes.sectionTitle}>
            {title}
            {help && <Help help={help} /> }
          </Grid>}
          <NestedGrid item container spacing={innerSpacing} style={{width: '100%'}}>
            {children}
          </NestedGrid>
          {BottomContent &&
          <Grid item style={{width: '100%'}}>
            <BottomContent />
          </Grid>
          }
        </NestedGrid>
      </Paper>
    </Grid>
  )
}

export default compose(
  withStyles(style, { name: 'SectionGrid' })
)(SectionGrid)
