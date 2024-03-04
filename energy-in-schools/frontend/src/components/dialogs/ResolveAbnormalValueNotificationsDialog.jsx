import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  schoolNameInput: {
    minWidth: 250,
  },
});

class ResolveAbnormalValueNotificationsDialog extends PureComponent {
  state = {
    selectedSchoolId: 1,
  }

  onSelectChange = (event) => {
    const { value } = event.target;
    this.setState({
      selectedSchoolId: value,
    });
  }

  onFormSubmit = () => {
    const { dialogActionsSubmitButtonOnClick } = this.props;
    const { selectedSchoolId } = this.state;
    dialogActionsSubmitButtonOnClick(selectedSchoolId);
  };

  renderSchool = (school) => {
    const { location_id: schoolId, location_name: schoolName } = school;
    return (
      <MenuItem key={schoolId} value={schoolId}>
        {schoolName}
      </MenuItem>
    );
  }

  render() {
    const { selectedSchoolId } = this.state;
    const {
      classes,
      schools,
      inputLabel,
      dialogOpen,
      dialogTitle,
      onDialogClose,
      dialogActionsCancelButtonContent,
      dialogActionsSubmitButtonContent,
      dialogActionsCancelButtonOnClick,
    } = this.props;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={dialogOpen}
        onClose={onDialogClose}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <FormControl className={classes.formControl}>
            <InputLabel>{inputLabel}</InputLabel>
            <Select
              className={classes.schoolNameInput}
              value={selectedSchoolId}
              onChange={this.onSelectChange}
              input={<Input />}
            >
              {schools.map(school => this.renderSchool(school))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogActionsCancelButtonOnClick} color="primary">
            {dialogActionsCancelButtonContent}
          </Button>
          <Button onClick={this.onFormSubmit} color="primary">
            {dialogActionsSubmitButtonContent}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ResolveAbnormalValueNotificationsDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  schools: PropTypes.arrayOf(PropTypes.shape({
    location_id: PropTypes.number,
    location_name: PropTypes.string,
  })).isRequired,
  inputLabel: PropTypes.string,
  dialogOpen: PropTypes.bool.isRequired,
  dialogTitle: PropTypes.string,
  onDialogClose: PropTypes.func.isRequired,
  dialogActionsCancelButtonContent: PropTypes.string,
  dialogActionsSubmitButtonContent: PropTypes.string,
  dialogActionsCancelButtonOnClick: PropTypes.func.isRequired,
  dialogActionsSubmitButtonOnClick: PropTypes.func.isRequired,
};

ResolveAbnormalValueNotificationsDialog.defaultProps = {
  inputLabel: 'School name',
  dialogTitle: 'Resolve notifications in school',
  dialogActionsCancelButtonContent: 'Cancel',
  dialogActionsSubmitButtonContent: 'Submit',
};

export default withStyles(styles)(ResolveAbnormalValueNotificationsDialog);
