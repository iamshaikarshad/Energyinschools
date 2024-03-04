import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';

import notificationBell from '../../../images/bell_dark.svg';
import RootDialog from '../../dialogs/RootDialog';

const styles = theme => ({
  dialogContent: {
    width: 500,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 300,
      padding: 10,
    },
  },
  cardHeaderFont: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.27,
  },
  avatar: {
    borderRadius: 0,
    height: 40,
    width: 37,
    marginRight: 10,
  },
});

const AlertDeleteDialog = ({
  classes, isOpened, onClose, name, onSubmit,
}) => (
  <RootDialog
    isOpened={isOpened}
    onClose={onClose}
    title="Are you sure you want to delete the alert applet?"
    onSubmit={onSubmit}
    submitLabel="Delete"
    classes={{ dialogContent: classes.dialogContent }}
  >
    <Grid container justify="center" alignItems="center">
      <Avatar alt="Logo" src={notificationBell} classes={{ root: classes.avatar }} />
      <Typography className={classes.cardHeaderFont}>{name}</Typography>
    </Grid>
  </RootDialog>
);

AlertDeleteDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(AlertDeleteDialog);
