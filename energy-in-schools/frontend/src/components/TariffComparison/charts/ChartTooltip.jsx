import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import roundToNPlaces from '../../../utils/roundToNPlaces';

const styles = {
  root: {
    borderRadius: 10,
    background: '#2e2e2e',
    minWidth: 140,
    maxWidth: 200,
    minHeight: 70,
    padding: 10,
  },
  text: {
    color: 'rgb(255, 255, 255)',
  },
};

const ChartTooltip = (props) => {
  const { active, payload, classes } = props;

  if (active && payload && payload.length !== 0) {
    const {
      label, unit, labelFormatter,
    } = props;

    return (
      <div className={classes.root}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <Typography className={classes.text}>
            {labelFormatter(label)}
          </Typography>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Typography className={classes.text} align="center">
            {`${roundToNPlaces(payload[0].value, 2)} ${unit}`}
          </Typography>
        </div>

      </div>
    );
  }

  return null;
};

ChartTooltip.propTypes = {
  classes: PropTypes.object.isRequired,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  active: PropTypes.bool,
  unit: PropTypes.string.isRequired,
  labelFormatter: PropTypes.func,
};

ChartTooltip.defaultProps = {
  label: '',
  active: true,
  payload: [],
  labelFormatter: () => '',
};

export default withStyles(styles)(ChartTooltip);
