import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { NO_SELECTED_METER_ID } from './constants';

const styles = {
  formControl: {},
  selectRoot: {
    width: 250,
  },
};

class MeterSelect extends React.PureComponent { // need it as separate component in order to decrease delay of change on select
  state = {
    selectedMeterId: NO_SELECTED_METER_ID,
  };

  onSelectMeter = (e) => {
    const energyMeterBillingInfoId = e.target.value;
    const { onChange } = this.props;
    this.setState(
      {
        selectedMeterId: energyMeterBillingInfoId,
      },
      () => { onChange(energyMeterBillingInfoId); },
    );
  }

  render() {
    const {
      classes, metersBillingData,
    } = this.props;

    const { selectedMeterId } = this.state;

    return (
      <FormControl className={classes.formControl}>
        <InputLabel>Select meter by id</InputLabel>
        <Select
          className={classes.selectRoot}
          label="Energy meter billing info"
          margin="dense"
          name="energyMeterId"
          onChange={this.onSelectMeter}
          value={selectedMeterId}
        >
          {metersBillingData.map(meterData => (
            <MenuItem key={meterData.id} value={meterData.id}>{meterData.meter_id}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}

MeterSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  metersBillingData: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

MeterSelect.defaultProps = {
  onChange: () => {},
};

export default withStyles(styles)(MeterSelect);
