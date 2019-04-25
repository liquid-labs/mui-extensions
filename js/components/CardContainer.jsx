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
  layoutToBreakpoint=false, balanceRows=true, sidePadding,
  fixedSizeCards=true, minCardSize=300, preferredCardSize=320, spacing,
  className, children,
  rowProps, ...props}) => {

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
  const effectiveWidth = rawWidth - (sidePadding !== undefined ? sidePadding : mainPaddingSpec[breakpoint].side) * 2
  const iterativeCardTester = (cardSize) => {
    let test = 1
    while ((test + 1) * cardSize + spacing * (test) <= effectiveWidth) test += 1
    // TODO: add option to 'grid' children, include 'itemProps' to apply to imposed <Grid> in that case
    // TODO: only lock to 12-factor if we 'grid' the children (in which case grid size = 12/cardsPerRow)
    return floorTo12Factor(test)
  }
  const preferredCardsPerRow = iterativeCardTester(preferredCardSize)
  const cardsPerRow = preferredCardsPerRow > 1
    ? preferredCardsPerRow
    : iterativeCardTester(minCardSize)

  const totalRows = Math.ceil((children.length + 0.0) / cardsPerRow)
  let childrenMapped = 0
  const rowGroups = [[]]
  React.Children.forEach(children, (child, i) => {
    let lastGroup = rowGroups[rowGroups.length - 1]
    if (lastGroup.length >= cardsPerRow
        || (balanceRows
            && (totalRows - 1) === rowGroups.length // penultimate row
            && (lastGroup.length == (children.length - childrenMapped)
                || lastGroup.length == children.length - childrenMapped + 1))) {
      lastGroup = []
      rowGroups.push(lastGroup)
    }
    if (!child.key) {
      console.warn("Please define a unique 'key' for each CardContainer child. Missing for: ", child)
    }
    // Re spacing: 'spacing' is set to zero and we manage spacing between the
    // cards ourselves. Like the standard 'Grid' spacing, the spacing is between
    // items internally and cards laid out with 'flex-start', for example, will
    // be flush against the container side.
    // see https://material-ui.com/layout/grid/#nested-grid (used v3.9.3)
    // TODO: to get the spacing right, need to split the left/right padding. this will require taking the 'balance' logic above and abstracting it so we can apply to the groups push and perform a lookahead to ask "is this the last card?" and "is there a next card?"
    child = React.cloneElement(child, {
        style : Object.assign({
          minWidth    : minCardSize,
          maxWidth    : preferredCardSize,
          paddingTop  : rowGroups.length > 1 ? spacing + 'px' : 0,
          paddingLeft : lastGroup.length > 0 ? spacing + 'px' : 0,
        }, child.style)
      })

    lastGroup.push(child)
    childrenMapped += 1
  })

  let count = 0
  const rowKeys = rowGroups.map((rowGroup, i) =>
    `row-${rowGroup.reduce((acc, child, j) => `${acc}-${child.key || count++}`, '')}`
  )

  // TODO: add 'colSpacing' <- should effect top/bottom, but not side? (does it already?)
  // see note above 'Re spacing'
  return (
    <Grid container className={className} spacing={0} {...props}>
      { rowGroups.map((rowGroup, i) =>
        <Grid justify="center" alignItems="stretch" {...rowProps} key={rowKeys[i]} item xs={12} container spacing={0}>
          { rowGroup }
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
  rowProps         : PropTypes.object
}

export {
  CardContainer
}
