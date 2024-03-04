import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Grid, Typography,
} from '@material-ui/core';

import roundToNPlaces from '../../utils/roundToNPlaces';

const styles = {
  root: {},
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 500,
    padding: '8px 16px',
  },
  table: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  tableCellHead: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 500,
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tableCell: {
    fontWeight: 400,
    fontSize: 14,
  },
  noData: {
    width: '100%',
    textAlign: 'center',
    padding: '8px 16px',
    color: 'rgb(243, 20, 49)',
  },
};

const UnitRatesInfo = ({ classes, data, id }) => (
  <Grid container className={classes.root}>
    <Typography className={classes.title}>
      Unit Rates
    </Typography>
    {!isEmpty(data) ? (
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableCellHead}>Rate Type</TableCell>
            <TableCell className={classes.tableCellHead}>Unit Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => {
            const { rate_meter_type: rateMeterType, unit_rate: unitRate } = item;
            return (
            // eslint-disable-next-line react/no-array-index-key
              <TableRow key={`rates_infos_table_${id}_${index}`}>
                <TableCell className={classes.tableCell}>{rateMeterType}</TableCell>
                <TableCell className={classes.tableCell}>{roundToNPlaces(unitRate, 2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : (
      <Typography className={classes.noData}>No data!</Typography>
    )}
  </Grid>
);

UnitRatesInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    total_cost: PropTypes.number.isRequired,
    rate_meter_type: PropTypes.string.isRequired,
    unit_rate: PropTypes.number.isRequired,
  })).isRequired,
  id: PropTypes.number.isRequired,
};

export default withStyles(styles)(UnitRatesInfo);
