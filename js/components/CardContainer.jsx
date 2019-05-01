import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Grid from '@material-ui/core/Grid'

import { makeStyles, useTheme } from '@material-ui/styles'
import { useViewportInfo } from '@liquid-labs/react-viewport-context'

import * as msgs from '../msgs'

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

const defaultSpacingSpec = {
  'xs' : 0,
  'sm' : 1,
  'md' : 1,
  'lg' : 2,
  'xl' : 2,
}

const getSpacing = (breakpoint, spacingUnit, spacing) => {
  if (spacing === undefined) return defaultSpacingSpec[breakpoint] * spacingUnit
  else {
    const sType = typeof spacing
    return sType === 'function'
      ? getSpacing(breakpoint, spacingUnit, spacing(breakpoint))
      : sType === 'object'
        ? getSpacing(breakpoint, spacingUnit, spacing[breakpoint])
        : sType === 'number'
          ? spacing * spacingUnit
          : spacing
  }
}

const hasNext = (balanceRows, currRowCount, totalRows, currRowLength, cardsPerRow, childrenLeft) =>
  totalRows === 2 && currRowCount === 1
    ? ((currRowLength + childrenLeft) % 2) === 0
      ? currRowLength < childrenLeft
      : currRowLength <= childrenLeft
    : childrenLeft > 0 && currRowLength < cardsPerRow
      // prior to penultimate row
        && (currRowCount < totalRows - 1
            // for a balanced penultimate row, the question is:
            // "Am I at a point where there will be at least on less on the next row?"
            || (balanceRows && currRowCount === totalRows - 1 && currRowLength <= childrenLeft)
            || currRowCount === totalRows) // then we are the last row and we have children left, so true

// Penultimate and final layout:
// @ 1, 2, 3 -> no balance
// @ 4 -> 5 -> 3/2, 6 -> 4/2 (no balance)
// @ 5 -> 6 -> 4/2, 7 -> 4/3, 8 -> 5/3 (no balance)
// @ 6 -> 7 -> 4/3, 8 -> 5/3, 9 -> 5/4, 10 -> no balance
// @ 7 -> 8 -> 5/3, 9-> 5/4, 10 -> 6/4, 11-> 6/5, 12 -> 7/5 (no balance)

/**
 * Lays out children as cards row by row. The items in each row will be the
 * the same height.
 */
const CardContainer = ({
  layoutToBreakpoint=false, balanceRows=true, sidePadding,
  fixedSizeCards=true, minCardSize=300, preferredCardSize=320, spacing,
  topWeighting=1, bottomWeighting=2,
  className, children,
  rowProps, ...props}) => {

  const theme = useTheme()
  const spacingUnit = theme.spacing.unit

  const { breakpoint, mainPaddingSpec, width } = useViewportInfo()
  if (process.env.NODE_ENV !== 'production') {
    if (width === undefined && !layoutToBreakpoint) {
      console.warn(msgs.noWidthLayoutWarning)
    }
  }

  const classes = useCardContainStyles()
  className = classNames(classes.root, className)

  spacing = getSpacing(breakpoint, spacingUnit, spacing)

  const { values } = theme.breakpoints
  const rawWidth = (layoutToBreakpoint && values[breakpoint])
    || (width !== undefined && width)
    || values[breakpoint]
  const effectiveWidth = rawWidth - (sidePadding !== undefined ? sidePadding : mainPaddingSpec[breakpoint].side) * 2
  let cardSize = preferredCardSize

  const iterativeCardTester = (cardSize) => {
    let test = 1
    // TODO: if grid-locked, then we can stop testing after 12
    while ((test + 1) * cardSize + spacing * (test) <= effectiveWidth) test += 1
    // TODO: add option to 'grid' children, include 'itemProps' to apply to imposed <Grid> in that case
    // TODO: only lock to 12-factor if we 'grid' the children (in which case grid size = 12/cardsPerRow)
    return /* cardsPerRow */ floorTo12Factor(test)
  }

  const preferredCardsPerRow = iterativeCardTester(preferredCardSize)
  let cardsPerRow
  if (preferredCardsPerRow === 1) {
    cardsPerRow = iterativeCardTester(minCardSize)
    if (cardsPerRow > 1) cardSize = minCardSize
  }
  else {
    cardsPerRow = preferredCardsPerRow
  }

  const totalRows = Math.ceil((children.length + 0.0) / cardsPerRow)
  let childrenMapped = 0
  const rowGroups = [[]]

  React.Children.forEach(children, (child, i) => {
    let currGroup = rowGroups[rowGroups.length - 1]
    const info = {}
    const penultimateRow = rowGroups.length + 1 === totalRows
    if (!hasNext(balanceRows, rowGroups.length, totalRows, currGroup.length, cardsPerRow, children.length - childrenMapped)) {
      currGroup = []
      rowGroups.push(currGroup)
    }

    if (!child.key) {
      console.warn(msgs.warnChildKey, child)
    }
    // Re spacing: 'spacing' is set to zero and we manage spacing between the
    // cards ourselves. Like the standard 'Grid' spacing, the spacing is between
    // items internally and cards laid out with 'flex-start', for example, will
    // be flush against the container side.
    // see https://material-ui.com/layout/grid/#nested-grid (used v3.9.3)
    child = React.cloneElement(child, {
        style : Object.assign({
          width      : cardSize,
          marginTop  : rowGroups.length > 1 ? spacing + 'px' : 0,
          marginLeft : currGroup.length > 0 ? (spacing / 2) + 'px' : 0,
          marginRight : hasNext(balanceRows, rowGroups.length, totalRows, currGroup.length + 1, cardsPerRow, children.length - childrenMapped - 1) ? (spacing / 2) + 'px' : 0,
        }, child.props.style)
      })

    currGroup.push(child)
    childrenMapped += 1
  })

  let count = 0
  const rowKeys = rowGroups.map((rowGroup, i) =>
    `row-${rowGroup.reduce((acc, child, j) => `${acc}-${child.key || count++}`, '')}`
  )

  // TODO: add 'colSpacing' <- should effect top/bottom, but not side? (does it already?)
  // see note above 'Re spacing'
  // TODO: extract 'weighting' into a layout component
  return (
    <Grid container className={className} spacing={0} {...props} direction="column">
      { topWeighting > 0 && <Grid item style={{flex: `${topWeighting} 0 auto`}} xs={12}></Grid> }
      { rowGroups.map((rowGroup, i) =>
        <Grid justify="center" alignItems="stretch" {...rowProps} key={rowKeys[i]} item container spacing={0}>
          { rowGroup }
        </Grid>
      )}
      { bottomWeighting > 0 && <Grid item style={{flex: `${bottomWeighting} 0 auto`}} xs={12}></Grid> }
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
  CardContainer,
  /* pkg local */ floorTo12Factor,
  /* pkg local */ getSpacing,
  /* pkg local */ hasNext,
}
