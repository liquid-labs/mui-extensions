import React from 'react'
import { branch, compose, lifecycle, renderComponent, renderNothing, setDisplayName, withProps, withState } from 'recompose'
import { CenteredProgress } from '@liquid-labs/mui-extensions'

const tooLong = 5000; // ms

const withAwait = (awaitChecks, isBlocked, completionPropName = 'fulfilled') => (Component) => {
  const figureStatus = (props) => {
    const blocked = isBlocked && isBlocked(props)
    return {
      blocked  : blocked,
      awaiting : !blocked && awaitChecks && (
        typeof awaitChecks === 'function'
          ? awaitChecks(props)
          : awaitChecks.length > 0 // there is a awaitChecks
              && awaitChecks.some((el) => (props[el] === null || props[el] === undefined))) // and something is missing
    }
  }

  const startChecker = ({checker, setChecker, setCheckStatus}) => {
    if (checker) {
      clearTimeout(checker)
    }
    setChecker(setTimeout(() => setCheckStatus('timeToCheck'), tooLong))
  }

  const clearChecker = ({checker, setChecker, setCheckStatus}) => {
    clearTimeout(checker)
    setChecker(null)
  }

  const statusHandler = (props) => {
    const {awaiting, blocked, checkStatus, setCheckStatus, setInfoMessage, setErrorMessage} = props
    if (checkStatus === 'timeToCheck' && awaiting) {
      clearChecker(props)
      setCheckStatus('checked')
      if (!blocked) {
        typeof awaitChecks === 'function'
          ? setInfoMessage(`Required conditions not yet met.`, true)
          : setInfoMessage(`Required properties ${awaitChecks.map(item => `'${item}'`).join(', ')} have not yet resolved. We'll keep trying...`, true)
      }
    }
    else if (!awaiting && blocked) {
      clearChecker(props)
      if (typeof blocked === 'string') {setErrorMessage(blocked)}
    }
  }

  return compose(
    setDisplayName('withAwait'),
    withState('checkStatus', 'setCheckStatus', null),
    // TODO: I suspect this is a bug on our part, but we were seing instances
    // where we were getting warnings about 'set state from unmounted components'
    // caused by the lingering timer; it looked like the unmount was happening right
    // after the mount before the 'setState(checker) could take effect. There may
    // be something else going on, though.
    withState('checker', 'setChecker', null),
    withProps(figureStatus),
    lifecycle({
      componentDidMount() {
        startChecker(this.props)
        statusHandler(this.props)
      },
      componentDidUpdate() {
        statusHandler(this.props)
      },
      componentWillUnmount() {
        clearChecker(this.props)
      }
    }),
    withProps(({awaiting, blocked}) => ({
      [completionPropName] : !awaiting && !blocked
    })),
    branch(({blocked}) => Boolean(blocked),
      renderNothing),
    branch(({awaiting}) => Boolean(awaiting),
      // Pass as function to keep from propogating props to CenteredProgress
      renderComponent(() => <CenteredProgress />)),
  )(Component);
}

export { withAwait }
