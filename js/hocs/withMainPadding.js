import { compose, withPropsOnChange } from 'recompose'

import { withScreenBreakpoints } from './withScreenBreakpoints'
import { withTheme } from '@material-ui/core/styles'

const paddingDefFactory = (spacingUnit) => (top, side, bottom) => ({
  mainPaddingNumbers : {
    top    : top * spacingUnit,
    side   : side * spacingUnit,
    bottom : bottom * spacingUnit,
  },
  mainPaddingStyle : {
    paddingTop    : `${Math.min(8, top * spacingUnit)}px`,
    paddingLeft   : `${side * spacingUnit}px`,
    paddingRight  : `${side * spacingUnit}px`,
    paddingBottom : `${Math.min(0, bottom * spacingUnit)}px`,
    // padding: `${top*spacingUnit}px ${side*spacingUnit}px ${bottom*spacingUnit}px`
  }
})

const regularizeOverride = (override, keys) => {
  if (!override) {
    return {}
  }
  if (typeof override === 'number') {
    return keys.reduce((acc, key) => ((acc[key] = override) || true) && acc, {})
  }
  else {
    return override
  }
}

const withMainPadding = (options = {}) => {
  // This is all the stuff we can compute from the theme
  const determinePaddingSpec = ({theme}) => {
    const breakpointSpec = options.breakpointSpec || theme.breakpoints
    const { keys:xKeys } = breakpointSpec
    const spacingUnit = options.spaceingUnit
      || (theme.spacing && theme.spacing.unit)
      || 8
    const topPaddingOverride = regularizeOverride(
      options.topPadding || options.horizontalPadding)
    const sidePaddingOverride = regularizeOverride(options.sidePadding)
    const bottomPaddingOverride = regularizeOverride(
      options.bottomPadding || options.verticalPadding)
    const paddingDef = paddingDefFactory(spacingUnit)
    const paddingSpec = options.paddingSpec
      || xKeys.reduce((acc, key, i) =>
        (acc[key] = paddingDef(
          topPaddingOverride[key] || (Math.ceil(i /2)),
          sidePaddingOverride[key] || (Math.ceil(i /2)),
          bottomPaddingOverride[key] || (Math.ceil(i /2)),
        )) && acc,
      {}
      )
    const mainPaddingStyle = (theme) => ({
      mainPaddingSides : xKeys.reduce((acc, key) =>
        acc[theme.breakpoints.up(key)] = {
          paddingLeft  : paddingSpec[key]['paddingLeft'],
          paddingRight : paddingSpec[key]['paddingRight'],
        } && acc,
      {})
    })

    return {
      paddingSpec      : paddingSpec,
      mainPaddingStyle : mainPaddingStyle
    }
  }

  // Now we define the function that does the runtime style generation
  // TODO: pay attention to x & y independently
  /*const genPaddingStyle = (paddingSpec, xBreakpoint) =>
    ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].reduce(
      (acc, styleKey) =>
        ((acc[styleKey] = paddingSpec[xBreakpoint][styleKey]) || true) && acc,
      {})*/

  return compose(
    withTheme(),
    withPropsOnChange(
      ['theme'],
      determinePaddingSpec
    ),
    withScreenBreakpoints(options),
    withPropsOnChange(['paddingSpec', 'xBreakpoint'],
      ({paddingSpec, xBreakpoint}) => paddingSpec[xBreakpoint]
    )
  )
}

export {
  withMainPadding,
  paddingDefFactory
}
