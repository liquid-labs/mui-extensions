import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Grid from '@material-ui/core/Grid'

import { makeStyles, useTheme } from '@material-ui/styles'
import { useViewportInfo } from '@liquid-labs/react-viewport-context'

const useCardContainStyles = makeStyles({
  root : {
    flexGrow : '1',
    margin   : 0,
    width    : 'initial'
  }
})

const floorTo12Factor = (n) => {
  if (n >= 12) return 12
  else {
    while ((12 % n) !== 0) n -= 1
    return n
  }
}
/**
 * Lays out children as cards row by row. The items in each row will be the
 * the same height.
 */
const CardContainer = ({
  layoutToBreakpoint=false,
  fixedSizeCards=true, minCardSize=300, preferredCardSize=320, spacing,
  className, children,
  GridProps, ...props}) => {

  const theme = useTheme()
  const spacingUnit = theme.spacing.unit

  const { breakpoint, mainPaddingSpec, width } = useViewportInfo()
  if (process.env.NODE_ENV !== 'production') {
    if (width === undefined && !layoutToBreakpoint) {
      console.warn("CardContainer 'layoutToBreakpoint' is 'false', but 'width' is not available from 'useViewPortInfo.'\nTry adding 'widthPlugin' to the 'ViewportContext' 'plugins'.")
    }
  }

  const classes = useCardContainStyles()
  className = classNames(classes.root, className)

  spacing = spacing || (() => {
    switch (breakpoint) {
    case 'xs': return 0
    case 'sm':
    case 'md': return spacingUnit
    case 'lg': return 2 * spacingUnit
    case 'xl': return 3 * spacingUnit
    default: return spacingUnit
    }
  })()

  const { values } = theme.breakpoints
  const rawWidth = (layoutToBreakpoint && values[breakpoint])
    || (width !== undefined && width)
    || values[breakpoint]
  const effectiveWidth = rawWidth - mainPaddingSpec[breakpoint].side * 2
  const iterativeCardTester = (cardSize) => {
    let test = 1
    while ((test + 1) * cardSize + spacing * (test) <= effectiveWidth) test += 1
    // TODO: also balance the cards, so we would prefer, for example 2/2 over 3/1
    // TODO: add option to 'grid' children, include 'itemProps' to apply to imposed <Grid> in that case
    // TODO: only lock to 12-factor if we 'grid' the children (in which case grid size = 12/cardsPerRow)
    return floorTo12Factor(test)
  }
  const preferredCardsPerRow = iterativeCardTester(preferredCardSize)
  const cardsPerRow = preferredCardsPerRow > 1
    ? preferredCardsPerRow
    : iterativeCardTester(minCardSize)

  const rowGroups = [[]]
  React.Children.forEach(children, (child, i) => {
    const lastGroup = rowGroups[rowGroups.length - 1]
    if (lastGroup.length >= cardsPerRow) {
      rowGroups.push([])
    }
    const key = `item-${child.key || i}`
    child = React.cloneElement(child, {
        style : {
          minWidth: minCardSize,
          maxWidth: preferredCardSize,
        }
      })

    rowGroups[rowGroups.length - 1].push(child)
  })

  let count = 0
  const rowKeys = rowGroups.map((rowGroup, i) =>
    rowGroup.reduce((acc, child, j) => `${acc}-${child.key || count++}`, '')
  )

  // TODO: add 'rowProps' prop
  // TODO: add 'colSpacing' <- should effect top/bottom, but not side? (does it already?)
  return (
    <Grid container spacing={8} className={className} {...props}>
      { rowGroups.map((childGroup, i) =>
        <Grid id={rowKeys[i]} key={rowKeys[i]} item xs={12} spacing={spacing} style={{display: 'flex', justifyContent: 'center', alignItems: 'stretch'}}>
          { childGroup }
        </Grid>
      )}
    </Grid>
  )
}

CardContainer.propTypes = {
  fixedSizeCards    : PropTypes.bool,
  minCardSize       : PropTypes.number,
  preferredCardSize : PropTypes.number,
  spacing           : PropTypes.number,
  className         : PropTypes.string,
  children          : PropTypes.node.isRequired,
  GridProps         : PropTypes.object
}

export {
  CardContainer
}
