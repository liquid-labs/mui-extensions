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
    return test
  }
  const preferredCardsPerRow = iterativeCardTester(preferredCardSize)
  const cardsPerRow = preferredCardsPerRow > 1
    ? preferredCardsPerRow
    : iterativeCardTester(minCardSize)

  const childrenGroups = [[]]
  React.Children.forEach(children, (child) => {
    const lastGroup = childrenGroups[childrenGroups.length - 1]
    if (lastGroup.length >= cardsPerRow) {
      childrenGroups.push([])
    }
    childrenGroups[childrenGroups.length - 1].push(child)
    // childrenGroups[childrenGroups.length - 1].push(React.cloneElement(child, { style: {minWidth: minCardSize, maxWidth: preferredCardSize} }))
  })
  let count = 0
  const groupKeys = childrenGroups.map((childGroup, i) =>
    childGroup.reduce((acc, child, j) => `${acc}-${child.key || count++}`, '')
  )

  return (
    <Grid item container spacing={0} className={className}
        direction="column" justify="center" {...props}
    >
      { childrenGroups.map((childGroup, i) =>
        <Grid key={groupKeys[i]} item container spacing={spacing} justify="center">
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
