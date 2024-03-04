import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles/index';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import schoolAvatar from '../../images/school.svg';
import RootDialog from './RootDialog';

const styles = theme => ({
  content: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
  },
  schoolName: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    flex: '0 0 auto',
    marginRight: theme.spacing(2),
    borderRadius: 0,
  },
});

const MIN_REASON_STRING_LENGTH = 12;

class RefuseSchoolDialog extends React.Component {
  state = {
    reason: '',
  };

  form = null;

  onSubmitForm = () => {
    const { schoolId, onSubmit } = this.props;
    const { reason } = this.state;
    onSubmit(schoolId, reason);
  };

  onSubmitClick = () => {
    this.form.submit();
  };

  render() {
    const {
      classes, isOpened, schoolName, onClose,
    } = this.props;

    const { reason } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Are you sure you want to refuse request?"
        onSubmit={this.onSubmitClick}
        submitLabel="Refuse"
      >
        <div className={classes.content}>
          <div className={classes.schoolName}>
            <div className={classes.avatar}>
              <Avatar alt="School" src={schoolAvatar} classes={{ root: classes.avatar }} />
            </div>
            <div>
              <Typography
                variant="body2"
                component="span"
              >
                {schoolName}
              </Typography>
            </div>
          </div>
          <div>
            <ValidatorForm
              ref={(el) => {
                this.form = el;
              }}
              onSubmit={this.onSubmitForm}
            >
              <TextValidator
                label="Write a reason"
                name="refuseReason"
                multiline
                value={reason}
                onChange={event => this.setState({ reason: event.target.value })}
                margin="normal"
                fullWidth
                validators={['required', `minStringLength:${MIN_REASON_STRING_LENGTH}`]}
                errorMessages={['This field is required', `Minimum number of characters is equal to ${MIN_REASON_STRING_LENGTH}`]}
              />
            </ValidatorForm>
          </div>
        </div>
      </RootDialog>
    );
  }
}

RefuseSchoolDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  schoolId: PropTypes.number.isRequired,
  schoolName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(RefuseSchoolDialog);
