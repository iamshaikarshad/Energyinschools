import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles/index';

import schoolAvatar from '../../images/school.svg';
import RootDialog from './RootDialog';

const styles = theme => ({
  content: {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    align: 'center',
  },
  avatar: {
    flex: '0 0 auto',
    marginRight: theme.spacing(1),
    borderRadius: 0,
  },
});

const ApproveSchoolDialog = ({
  classes, isOpened, schoolName, onSubmit, onClose,
}) => (
  <RootDialog
    isOpened={isOpened}
    onClose={onClose}
    title="Are you sure you want to approve request?"
    onSubmit={onSubmit}
    submitLabel="Approve"
  >
    <div className={classes.content}>
      <div className={classes.avatar}>
        <Avatar alt="School" src={schoolAvatar} classes={{ root: classes.avatar }} />
      </div>
      <div className={classes.content}>
        <Typography
          variant="body2"
          component="span"
        >
          {schoolName}
        </Typography>
      </div>
    </div>
  </RootDialog>
);


ApproveSchoolDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  schoolName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(ApproveSchoolDialog);
