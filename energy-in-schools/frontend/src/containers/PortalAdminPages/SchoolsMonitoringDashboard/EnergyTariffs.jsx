import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import EnergyTariffsTable from './EnergyTariffsTable';

import objectHasNonEmptyValue from '../../../utils/objectHasNonEmptyValue';

import {
  TARIFF_USE_TYPE,
  TARIFF_USE_TYPE_SCHOOL_METRICS_RESPONSE_PROP,
  STATUS_COLOR,
} from './constants';

const styles = theme => ({
  root: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  title: {
    width: '100%',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: 21,
    textAlign: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  contentContainer: {
    padding: 8,
  },
  tableWrapper: {
    marginBottom: 12,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  noData: {
    fontSize: 18,
    color: STATUS_COLOR.alert,
  },
});

const EnergyTariffs = ({ classes, tariffs }) => {
  const tariffsAvailable = objectHasNonEmptyValue(tariffs);
  return (
    <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
      <Grid item xs={12} container justify="center">
        <Typography className={classes.title}>
          Energy Tariffs
        </Typography>
      </Grid>
      <Grid item xs={12} container className={classes.contentContainer}>
        {tariffsAvailable ? (
          <Grid item xs={12} container className={classes.tableWrapper}>
            <EnergyTariffsTable
              tariffs={tariffs[TARIFF_USE_TYPE_SCHOOL_METRICS_RESPONSE_PROP[TARIFF_USE_TYPE.normal]] || []}
            />
          </Grid>
        ) : (
          <Grid item container xs={12} justify="center" alignItems="center">
            <Typography className={classes.noData}>
              No tariff!
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

EnergyTariffs.propTypes = {
  classes: PropTypes.object.isRequired,
  tariffs: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(EnergyTariffs);
