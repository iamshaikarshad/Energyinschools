import React from 'react';
import PropTypes from 'prop-types';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import {
  Table, TableBody, TableCell, TableRow,
} from '@material-ui/core';

import { MUG_METER_RATE_TYPE } from '../SchoolRegistration/constants';

import roundToNPlaces from '../../utils/roundToNPlaces';

const styles = {
  table: {
    marginLeft: 10,
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
      fontSize: 15,
    },
  },
};

const NonTimeOfUseTable = ({ resultData, classes, onClickTariffPrice }) => {
  const { result_id: resultId } = resultData;
  return (
    <Table className={classes.table}>
      <TableBody>
        {(resultData.tariff_rate_infos || []).map((rateInfo, index) => {
          const { rate_meter_type: rateMeterType, total_cost: totalCost } = rateInfo;
          if (isNil(rateMeterType) || isNil(totalCost)) return null;
          const rateMeterTypeLabel = rateMeterType === MUG_METER_RATE_TYPE.SINGLE ? 'Total Cost' : rateMeterType;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={`non_time_of_use_table_rate_meter_type_${resultId}_${index}`}>
              <TableCell className={classes.tableCell}>{rateMeterTypeLabel}</TableCell>
              <TableCell
                className={classes.priceTableCell}
                onClick={onClickTariffPrice}
                style={{ color: '#36babd', fontWeight: 600 }}
              >
                £{roundToNPlaces(totalCost, 1)}
              </TableCell>
            </TableRow>
          );
        })}
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

NonTimeOfUseTable.propTypes = {
  resultData: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  onClickTariffPrice: PropTypes.func.isRequired,
};

export default withStyles(styles)(NonTimeOfUseTable);
