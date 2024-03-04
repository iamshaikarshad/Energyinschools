import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles/index';
import { DeleteOutlineRounded } from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';

import DateTimePicker from '../DateTimePicker/DateTimePicker';
import RootDialog from './RootDialog';

const styles = theme => ({
  uploadButton: {
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0px 1px 0px 1px rgba(0,0,0,0.2), 0px 1px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)',
    borderRadius: 2,
    padding: '0px 8px',
    marginTop: '10px',
    textTransform: 'none',
    fontWeight: 400,
    fontSize: 16,
    border: '1px outset rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(224, 224, 224, 0.7)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  hint: {
    fontSize: 12,
    padding: 8,
    marginTop: 8,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
      paddingLeft: 0,
    },
  },
  colorSelector: {
    width: '100%',
    paddingRight: 0,
  },
});

class CsvParserDialog extends React.Component {
  addSensorDataForm = null;

  onFormSubmit = () => {
    const { onSubmit, sensorsToAdd } = this.props;
    onSubmit(sensorsToAdd);
  };

  clearEventFiles = (event) => {
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'text';
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'file';
  }

  uploadCsvFiles = (event) => {
    const { csvParserSubmit } = this.props;
    const uploadedFiles = event.target.files;
    this.clearEventFiles(event);
    const uploadedArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < uploadedFiles.length; i++) {
      uploadedArray.push(uploadedFiles[i]);
    }

    csvParserSubmit(uploadedArray);
  }

  render() {
    const {
      isOpened,
      onClose,
      title,
      classes,
      deleteSensorToAdd,
      sensorsToAdd,
      handleSensorsToAddStartTimeChange,
      handleSensorToAddNameChange,
      handleColorChange,
    } = this.props;
    const submitDisabled = sensorsToAdd.filter(sensor => sensor.duplicated).length > 0 || sensorsToAdd.filter(sensor => sensor.badTime).length > 0;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        submitButtonDisabled={submitDisabled}
        onSubmit={() => this.addSensorDataForm.submit()}
        submitLabel="Add"
      >
        <ValidatorForm
          ref={(el) => {
            this.addSensorDataForm = el;
          }}
          onSubmit={this.onFormSubmit}
        >
          {sensorsToAdd.map((sensor, index) => {
            const key = `sensor_${index}`;
            const latestAvailableTime = moment()
              .subtract(sensor.logDuration, 'seconds')
              .startOf('seconds')
              .format('DD-MM-YYYY   hh:mm');
            return (
              <React.Fragment key={key}>
                <Grid container alignItems="stretch">
                  <Grid
                    container
                    item
                    alignItems="center"
                    xs={10}
                  >
                    <TextValidator
                      fullWidth
                      autoComplete="off"
                      error={sensor.duplicated}
                      helperText={sensor.duplicated ? 'duplicate entry, please change name.' : ''}
                      type="text"
                      value={sensor.name}
                      label="Group name: "
                      margin="dense"
                      style={{ marginBottom: 13 }}
                      name="sensor"
                      onChange={(event) => { event.persist(); handleSensorToAddNameChange(event, index); }}
                    />
                    <Grid container>
                      <Grid item md={6} sm={12} style={{ paddingRight: 20 }}>
                        <DateTimePicker
                          value={sensor.time}
                          onChange={date => handleSensorsToAddStartTimeChange(date, index)}
                          error={sensor.badTime}
                          disableFuture
                          label="Log start time"
                          helperText={sensor.badTime ? `Start time should not be after ${latestAvailableTime}` : ''}
                        />
                      </Grid>
                      <Grid item md={6} sm={12} className={classes.colorSelector}>
                        <SelectValidator
                          onChange={e => handleColorChange(e.target.value, index)}
                          value={sensor.color ? sensor.color : 'red'}
                          label="Select color"
                          style={{ width: '100%' }}
                        >
                          <MenuItem key="red" value="red">Red</MenuItem>
                          <MenuItem key="green" value="green">Green</MenuItem>
                          <MenuItem key="blue" value="blue">Blue</MenuItem>
                          <MenuItem key="yellow" value="yellow">Yellow</MenuItem>
                        </SelectValidator>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2}>
                    <Button onClick={() => deleteSensorToAdd(index)}>
                      <DeleteOutlineRounded />
                    </Button>
                  </Grid>
                </Grid>
              </React.Fragment>
            );
          })}
          <Grid container>
            <label htmlFor="raised-button-file">
              <Button variant="contained" component="span" className={classes.uploadButton}>
                Upload csv files
              </Button>
              <input
                accept="text/csv"
                className={classes.input}
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={this.uploadCsvFiles}
              />
            </label>
            <Typography className={classes.hint}>
              Only csv files are allowed.
            </Typography>
          </Grid>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

CsvParserDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
  sensorsToAdd: PropTypes.array.isRequired,
  title: PropTypes.string,
  isOpened: PropTypes.bool,
  onClose: PropTypes.func,
  csvParserSubmit: PropTypes.func.isRequired,
  deleteSensorToAdd: PropTypes.func.isRequired,
  handleColorChange: PropTypes.func.isRequired,
  handleSensorsToAddStartTimeChange: PropTypes.func.isRequired,
  handleSensorToAddNameChange: PropTypes.func.isRequired,
};
CsvParserDialog.defaultProps = {
  onSubmit: null,
  title: '',
  isOpened: false,
  onClose: null,
};

export default compose(withStyles(styles))(CsvParserDialog);
