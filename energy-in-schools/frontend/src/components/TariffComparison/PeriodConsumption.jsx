import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { isEmpty } from 'lodash';

import ConsumptionBarsChart from './charts/ConsumptionBarsChart';

import { CONSUMPTION_PERIOD_DETAIL, PERIOD_CONSUMPTION_DATA_KEY, CONSUMPTION_PERIOD_CELL_COLOR_SETTER_MAP } from './constants';

import { UNIT_TO_LABEL_MAP } from '../../constants/config';

import { transformIntegerToHour, tooltipLabelFormatter } from './utils';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      minHeight: 350,
      height: 'auto !important',
    },
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontWeight: 500,
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
  chartContainer: {
    position: 'relative',
  },
  noDataBlock: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  noDataText: {
    fontSize: 18,
  },
});

const PeriodConsumption = ({ classes, period, data: { values, unit } }) => {
  const { title } = CONSUMPTION_PERIOD_DETAIL[period];

  return (
    <div className={classes.root}>
      <Grid container justify="center" alignItems="center" className={classes.header}>
        <Typography className={classes.headerText}>
          {title}
        </Typography>
      </Grid>
      <Grid container className={classes.chartContainer} justify="center" alignItems="center">
        <ConsumptionBarsChart
          xDataKey={PERIOD_CONSUMPTION_DATA_KEY.time}
          yDataKey={PERIOD_CONSUMPTION_DATA_KEY.value}
          data={values}
          unitLabel={UNIT_TO_LABEL_MAP[unit]}
          tooltipLabelFormatter={tooltipLabelFormatter}
          xTickFormatter={transformIntegerToHour}
          setCellColor={CONSUMPTION_PERIOD_CELL_COLOR_SETTER_MAP[period]}
        />
        {isEmpty(values) && (
          <Grid className={classes.noDataBlock}>
            <Typography className={classes.noDataText}>
              No data!
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

PeriodConsumption.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  period: PropTypes.string.isRequired,
};

export default withStyles(styles)(PeriodConsumption);
