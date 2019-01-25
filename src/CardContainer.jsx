import React from 'react'
import classNames from 'classnames'
import { compose } from 'recompose'

import Grid from '@material-ui/core/Grid'

import { withMainPadding } from './withMainPadding'
import { withScreenBreakpoints } from './withScreenBreakpoints'
import { withStyles, withTheme } from '@material-ui/core/styles'

const styles = (theme) => ({
  root: {
    flexGrow: '1',
    margin: 0,
    width: 'initial'
  }
})

/**
 * Lays out children as cards row by row. Part of the motivation was to have a
 * Grid cells laid out where each item in the row grows as big as the biggest
 * item, but doesn't
 */
const CardContainer = ({
      fixedSizeCards=true, minCardSize=300, preferredCardSize=320, spacing,
      xBreakpoint,
      classes, className, children, mainPaddingNumbers, style, theme,
      GridProps, ...props}) => {
  className = classNames(classes.root, className)

  spacing = spacing || (() => { switch (xBreakpoint) {
    case 'xs': return 0
    case 'sm':
    case 'md': return 8
    case 'lg': return 16
    case 'xl': return 24
    default: return 8
  }})()

  const { values } = theme.breakpoints
  const effectiveWidth = values[xBreakpoint] - mainPaddingNumbers.side * 2
  const preferredCardsPerRow =
    Math.floor(effectiveWidth / (preferredCardSize + spacing))
  const cardsPerRow = preferredCardsPerRow > 1
    ? preferredCardsPerRow
    : Math.floor(effectiveWidth / (minCardSize + spacing)) || 1

  const childrenGroups = [[]]
  React.Children.forEach(children, (child) => {
    const lastGroup = childrenGroups[childrenGroups.length - 1]
    if (lastGroup.length >= cardsPerRow) {
      childrenGroups.push([])
    }
    childrenGroups[childrenGroups.length - 1].push(child)
  })
  const groupKeys = childrenGroups.map((childGroup) =>
    childGroup.reduce((acc, child) => `${acc}-${child.key}`, '')
  )

  return (
    <Grid item container spacing={0} className={className}
        direction="column" justify="center"
    >
      { childrenGroups.map((childGroup, i) =>
        <Grid key={groupKeys[i]} item container spacing={spacing} justify="center">
          { childGroup }
        </Grid>
      )}
    </Grid>
  )
}

export default compose(
  withStyles(styles, { name: 'CardContainer' }),
  withMainPadding(),
  withScreenBreakpoints(),
  withTheme(),
)(CardContainer)
