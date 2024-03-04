import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import roundToNPlaces from '../../../utils/roundToNPlaces';

import { CHART_COMPONENT_DATA_KEY, CHART_COMPONENT_DATA_KEY_TOOLTIP_LABEL_KEY_MAP } from '../constants';

const styles = {
  root: {
    borderRadius: 10,
    background: '#2e2e2e',
    minWidth: 140,
    maxWidth: 200,
    minHeight: 70,
    padding: 10,
  },
  labelItemBlock: {
    '&:not(:first-child)': {
      marginTop: 12,
    },
  },
};

const ChartTooltip = (props) => {
  const { active, payload, classes } = props;

  if (active && payload && payload.length !== 0) {
    if (payload.length === 1 && payload[0].dataKey === CHART_COMPONENT_DATA_KEY.highlightValue) {
      return null; // do not show tooltip on highlighted area when there is no value
    }

    const {
      label, unit, labelFormat, dateFormatter,
    } = props;

    const dateLabelData = dateFormatter(label, labelFormat);

    return (
      <div className={classes.root}>
        {payload.map((item) => {
          const labelKey = CHART_COMPONENT_DATA_KEY_TOOLTIP_LABEL_KEY_MAP[item.dataKey];
          return labelKey ? (
            <div className={classes.labelItemBlock} key={item.dataKey}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <Typography variant="caption" style={{ color: 'white' }}>
                  {dateLabelData[labelKey]}
                </Typography>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="h6" style={{ color: 'white', fontSize: 15 }} align="center">
                  {`${roundToNPlaces(item.value, 2)} ${unit}`}
                </Typography>
              </div>
            </div>
          )
            : null;
        })
        }
      </div>
    );
  }

  return null;
};

ChartTooltip.propTypes = {
  classes: PropTypes.object.isRequired,
  payload: PropTypes.array,
  label: PropTypes.string,
  active: PropTypes.bool,
  unit: PropTypes.string.isRequired,
  labelFormat: PropTypes.string,
  dateFormatter: PropTypes.func,
};

ChartTooltip.defaultProps = {
  label: '',
  active: true,
  payload: [],
  labelFormat: 'D MMM YYYY HH:mm',
  dateFormatter: (label, labelFormat) => (
    {
      mainDataDateLabel: moment(label).format(labelFormat),
    }
  ),
};

export default withStyles(styles)(ChartTooltip);
