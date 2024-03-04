import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { TextValidator, SelectValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import { CREATEABLE_SENSOR_TYPES } from '../FloorsMaps/constants';

import RootDialog from './RootDialog';

const styles = {
  dialogContent: {
    minWidth: 600,
  },
};

class EditSensorGoupDialog extends React.Component {
  state = {
    sensors: [],
  };

  editSensorGroupForm = null;

  componentWillReceiveProps(props) {
    this.setState({
      sensors: props.sensors,
    });
  }


  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { sensors } = this.state;
    onSubmit(sensors);
  };

  editSensorColor = (color, indexGroup) => {
    const { sensors } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensors));
    sensorsCopy[indexGroup].color = color;
    this.setState({ sensors: sensorsCopy });
  }

  editSensorNameGroup = (event, indexGroup) => {
    const { sensors } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensors));
    sensorsCopy[indexGroup].name = event.target.value;
    sensorsCopy[indexGroup].duplicated = sensors.some(sensor => sensor.name === event.target.value);
    this.setState({ sensors: sensorsCopy });
  };

  editSensorGroupTime = (event, indexGroup) => {
    const { sensors } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensors));
    sensorsCopy[indexGroup].time = event;
    sensorsCopy[indexGroup].badTime = moment(event).add(sensors[indexGroup].logDuration).isAfter(moment());
    this.setState({ sensors: sensorsCopy });
  };


  editSensorName = (event, indexGroup, sensorIndex) => {
    const { sensors } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensors));
    sensorsCopy[indexGroup].data[sensorIndex].name = event.target.value;
    this.setState({ sensors: sensorsCopy });
  }

  editSensorType = (event, indexGroup, sensorIndex) => {
    const { sensors } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensors));
    sensorsCopy[indexGroup].data[sensorIndex].type = event.target.value;
    this.setState({ sensors: sensorsCopy });
  }


  render() {
    const {
      isOpened,
      onClose,
      classes,
      title,
      sensorGroupIndex,
    } = this.props;
    const { sensors } = this.state;
    const currentGroupSensor = sensors && sensors[sensorGroupIndex];
    const submitDisabled = sensors.filter(sensor => sensor.duplicated).length > 0 || sensors.filter(sensor => sensor.badTime).length > 0;
    const latestAvailableTime = moment()
      .subtract(currentGroupSensor && currentGroupSensor.logDuration, 'seconds')
      .startOf('seconds')
      .format('DD-MM-YYYY   hh:mm');

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        submitButtonDisabled={submitDisabled}
        onSubmit={() => this.editSensorGroupForm.submit()}
        submitLabel="Edit"
      >
        <ValidatorForm
          ref={(el) => { this.editSensorGroupForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <Grid
            container
            spacing={6}
          >
            <Grid item xs={12} sm={6}>
              <TextValidator
                autoComplete="off"
                type="text"
                label="Edit Group Name"
                name="edit group name"
                error={currentGroupSensor && currentGroupSensor.duplicated}
                helperText={currentGroupSensor && currentGroupSensor.duplicated ? 'duplicate entry, please change name.' : ''}
                value={currentGroupSensor && currentGroupSensor.name}
                onChange={(event) => { this.editSensorNameGroup(event, sensorGroupIndex); }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Edit start time"
                disableFuture
                error={currentGroupSensor && currentGroupSensor.badTime}
                value={currentGroupSensor && currentGroupSensor.time}
                onChange={(event) => { this.editSensorGroupTime(event, sensorGroupIndex); }}
                helperText={currentGroupSensor && currentGroupSensor.badTime ? `Start time should not be after ${latestAvailableTime}` : ''}
              />
            </Grid>
          </Grid>
          <Grid item xs={4} style={{ paddingBottom: '10px' }}>
            <SelectValidator
              onChange={e => this.editSensorColor(e.target.value, sensorGroupIndex)}
              value={currentGroupSensor ? currentGroupSensor.color : 'red'}
              label="Select color"
              style={{ width: 202 }}
            >
              <MenuItem key="red" value="red">Red</MenuItem>
              <MenuItem key="green" value="green">Green</MenuItem>
              <MenuItem key="blue" value="blue">Blue</MenuItem>
              <MenuItem key="yellow" value="yellow">Yellow</MenuItem>
            </SelectValidator>
          </Grid>
          {currentGroupSensor && currentGroupSensor.data.map((item, sensorIndex) => {
            const key = `item_${sensorIndex}`;
            return (
              <Grid
                container
                spacing={6}
                key={key}
              >
                <Grid item xs={12} sm={6}>
                  <TextValidator
                    autoComplete="off"
                    type="text"
                    label="Edit Sensor Name"
                    name="edit sensor name"
                    value={item.name}
                    onChange={(event) => { this.editSensorName(event, sensorGroupIndex, sensorIndex); }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectValidator
                    label="Select type"
                    style={{
                      minWidth: 150,
                    }}
                    onChange={(event) => { this.editSensorType(event, sensorGroupIndex, sensorIndex); }}
                    value={item.type}
                  >
                    {CREATEABLE_SENSOR_TYPES.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </SelectValidator>
                </Grid>
              </Grid>
            );
          })}
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditSensorGoupDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  sensorGroupIndex: PropTypes.number,
  sensors: PropTypes.array,
};

EditSensorGoupDialog.defaultProps = {
  title: 'Edit',
  sensorGroupIndex: null,
  sensors: [],
};

export default compose(withStyles(styles))(EditSensorGoupDialog);
