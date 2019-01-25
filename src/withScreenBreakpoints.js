import { compose, lifecycle, mapProps, withHandlers, withState } from 'recompose'

import { withTheme } from '@material-ui/core/styles'

/**
 * Works with the theme breakpoints by default.
 */
// TODO: turn into a provider / consumer pair
const withScreenBreakpoints = (options = {}) => compose(
  withTheme(),// TODO: move to 'themeBreakpoint'
  withState('xBreakpoint', 'setXBreakpoint', options.initialXBreakpoint || 'lg'),
  withState('resizeListener', 'setResizeListener'),
  withHandlers({
    onResize : ({xBreakpoint, setXBreakpoint, theme}) => () => {
      const windowWidth = window.innerWidth
      // TODO: forget taking specst from options where it's encoded in theme, just have user override theme
      const { keys, values } = options.breakpointSpec || theme.breakpoints
      let newXBreakpoint = 'xl'
      keys.some((key, i) => {
        if (values[key] > windowWidth) {
          newXBreakpoint = i - 1
          return true
        }
        return false
      })
      if (newXBreakpoint !== xBreakpoint) {
        setXBreakpoint(keys[newXBreakpoint])
      }
    }
  }),
  lifecycle({
    componentDidMount() {
      const { onResize, setResizeListener } = this.props
      onResize()
      setResizeListener(window.addEventListener('resize', onResize))
    },
    componentWillUnmount() {
      const { resizeListener } = this.props
      window.removeEventListener('resize', resizeListener)
    }
  }),
  mapProps(({setXBreakpoint, resizeListener, setResizeListener, theme, onResize, ...props}) => props)
)

export { withScreenBreakpoints }
