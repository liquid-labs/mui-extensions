import React from 'react'
import PropTypes from 'prop-types'
import { compose, withStateHandlers } from 'recompose'

import Popover from '@material-ui/core/Popover'
import { TinyIconButton } from './TinyIconButton'
import Typography from '@material-ui/core/Typography'
import HelpIcon from '@material-ui/icons/Help'

import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
  root : {
    float : 'right',
  },
  button : {
    cursor    : 'pointer',
    color     : theme.palette.grey[500],
    opacity   : '0.75',
    '&:hover' : {
      opacity : '1.0',
      color   : theme.palette.primary.main,
    }
  },
  helpPopover : {
    padding  : '5px',
    maxWidth : '25rem'
  },
})

const HelpBase = ({classes, helpOpen, helpClose, helpAnchor, help}) =>
  <div className={classes.root}>
    <TinyIconButton disableRipple onClick={helpOpen} className={classes.button} placement="floatRight">
      <HelpIcon />
    </TinyIconButton>
    <Popover open={Boolean(helpAnchor)}
        anchorOrigin={{horizontal : 'left', vertical : 'center'}}
        transformOrigin={{horizontal : 'right', vertical : 'top'}}
        anchorEl={helpAnchor}
        onClose={helpClose}>
      <Typography component="div" className={classes.helpPopover}>
        {help}
      </Typography>
    </Popover>
  </div>

HelpBase.propTypes = {
  classes    : PropTypes.object.required,
  helpOpen   : PropTypes.func.required,
  helpClose  : PropTypes.func.required,
  helpAnchor : Popover.propTypes.anchorEl,
  help       : PropTypes.onOfType([PropTypes.object, PropTypes.func, PropTypes.string])
}

export const Help = compose(
  withStyles(styles, { name : 'Help' }),
  withStateHandlers(
    { helpAnchor : null },
    {
      helpOpen : () => (event) => ({
        helpAnchor : event.target
      }),
      helpClose : () => () => ({
        helpAnchor : null
      })
    }
  ),
)(HelpBase)
