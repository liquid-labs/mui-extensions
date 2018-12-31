import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'

import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'

import { withStyles } from '@material-ui/core/styles'

import { appActions } from '@liquid-labs/catalyst-core-ui'

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
  errorSnack: {
    background: theme.palette.error.light,
    color: theme.palette.error.contrast,
    border: `2px solid ${theme.palette.error.dark}`
  }
})

/**
 * Component to provide feedback to user. Uses a Snackbar component to display
 * user feedback in a dismissable box. Currently displays all messages in a
 * single element, though future versions will display (and style) messages
 * individually.
 */
const FeedbackBase = ({infoMessages, errorMessages, sticky, clearAppMessages, classes}) => {
  const messages = [...errorMessages, ...infoMessages]

  const open = Boolean(infoMessages.length > 0 || errorMessages.length > 0)
  const type = errorMessages.length > 0 ? 'error' : 'info'
  const message = messages.length > 1 ? <ul>{messages.map((msg, i) => <li key={i}>{msg}</li>)}</ul> : messages[0]

  // TODO: using 'i' as the key isn't great, but OK givin current uses. The problem is there's nothing in the message, other than the full message itself, which isn't a great key either.
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={open}
      autoHideDuration={type === 'info' && !sticky ? 2000 : null}
      onClose={clearAppMessages}
      ContentProps={{
        'aria-describedby': 'message-id',
        className: (type === 'error' && classes.errorSnack) || null
      }}
      message={<span id="message-id">{message}</span>}
      action={
        <IconButton
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={clearAppMessages}
        >
          <CloseIcon />
        </IconButton>
      }
    />
  )
}

const mapStateToProps = (state) => {
  const { errorMessages, infoMessages, sticky } = state.appState;

  return {
    errorMessages: errorMessages,
    infoMessages: infoMessages,
    sticky: sticky
  }
}

const mapDispatchToProps = (dispatch) => ({
  clearAppMessages: () => dispatch(appActions.clearAppMessages())
})

export const Feedback = compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(FeedbackBase)
