import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Table, TableBody, TableCell, TableRow,
} from '@material-ui/core';

import roundToNPlaces from '../../utils/roundToNPlaces';

const styles = {
  table: {
    marginLeft: 20,
  },
  tableCell: {
    fontWeight: 500,
    fontSize: 14,
  },
  priceTableCell: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '15px',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scaleY(1.15)',
    },
  },
};

const TimeOfUseTable = ({ resultData, classes, onClickTariffPrice }) => {
  const {
    total_green_cost: totalGreenCost, total_amber_cost: totalAmberCost, total_red_cost: totalRedCost,
  } = resultData;
  return (
    <Table className={classes.table}>
      <TableBody>
        <TableRow>
          <TableCell className={classes.tableCell}>Green</TableCell>
          <TableCell
            className={classes.priceTableCell}
            style={{ color: 'green', fontWeight: 600 }}
            onClick={onClickTariffPrice}
          >
            £{roundToNPlaces(totalGreenCost, 1)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.tableCell}>Amber</TableCell>
          <TableCell
            className={classes.priceTableCell}
            style={{ color: '#FFBF00', fontWeight: 600 }}
            onClick={onClickTariffPrice}
          >
            £{roundToNPlaces(totalAmberCost, 1)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.tableCell}>Red</TableCell>
          <TableCell
            className={classes.priceTableCell}
            style={{ color: 'red', fontWeight: 600 }}
            onClick={onClickTariffPrice}
          >
            £{roundToNPlaces(totalRedCost, 1)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.tableCell}>Standing Charge</TableCell>
          <TableCell className={classes.tableCell}>£{roundToNPlaces(resultData.standing_charge, 2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.tableCell}>Est. Annual Spend</TableCell>
          <TableCell className={classes.tableCell}>£{roundToNPlaces(resultData.total_cost_excluding_vat, 1)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

TimeOfUseTable.propTypes = {
  resultData: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  onClickTariffPrice: PropTypes.func.isRequired,
};

export default withStyles(styles)(TimeOfUseTable);
