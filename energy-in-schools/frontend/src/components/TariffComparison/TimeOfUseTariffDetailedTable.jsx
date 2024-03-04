import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableHead, TableBody, TableCell, TableRow, Grid, Typography,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import {
  WEEKDAYS, WEEKENDS, TIME_OF_USE_TARIFF_COLOR_KEYS, TIME_OF_USE_TARIFF_COLOR_MAP,
} from './constants';

const styles = {
  root: {
    width: '100%',
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 500,
    padding: '8px 16px',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  table: {
    minWidth: 720,
    borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  },
  tableRow: {
    height: 30,
  },
  tableHeadCell: {
    borderRight: 'solid 1px lightgrey',
    fontSize: 10,
    fontWeight: 600,
  },
  tableCell: {
    backgroundColor: 'green',
    width: '3.5%',
    paddingTop: 0,
    borderBottom: 0,
  },
  tableDayCell: {
    width: '16%',
    fontSize: 14,
    fontWeight: 500,
  },
};

const GREY_COLOR = 'lightgrey';
const createDayColorMap = () => Object.assign({}, Array.from({ length: 24 }, () => GREY_COLOR));

// component code may be simplified by using WEEKDAYS_DAY_COLOR_MAP, WEEKENDS_DAY_COLOR_MAP constants if TIME_OF_USE_TARIFF_DATA_MOCK stays constant

class TimeOfUseTariffDetailedTable extends React.Component {
  state = {
    weekdaysUnitRateColors: createDayColorMap(),
    weekendsUnitRateColors: createDayColorMap(),
  };

  componentDidMount() {
    const { data } = this.props;

    this.setState({
      weekdaysUnitRateColors: this.getDaysUnitRateColors(data.weekdays),
      weekendsUnitRateColors: this.getDaysUnitRateColors(data.weekends),
    });
  }

  getDaysUnitRateColors = data => (
    Object.keys(TIME_OF_USE_TARIFF_COLOR_KEYS).reduce((res, color) => (
      Object.assign(res, this.getDayColorMap(data[color], TIME_OF_USE_TARIFF_COLOR_MAP[color]))
    ), {})
  );

  getDayColorMap = (data, color) => (
    data.reduce((res, range) => {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);

      for (let i = start; i < end; i += 1) {
        res[i] = color;
      }
      return res;
    }, {})
  );

  renderTableRows = (days, unitRateColors) => {
    const { classes } = this.props;

    return (
      Object.values(days).map(day => (
        <TableRow key={day} className={classes.tableRow}>
          <TableCell className={classes.tableDayCell}>{day}</TableCell>
          {Object.keys(unitRateColors).map(hour => (
            <TableCell
              key={`weekday-${day}-hour-${hour}-color`}
              className={classes.tableCell}
              padding="none"
              style={{ backgroundColor: unitRateColors[hour] }}
            />
          ))}
        </TableRow>
      ))
    );
  };

  render() {
    const { classes } = this.props;
    const { weekdaysUnitRateColors, weekendsUnitRateColors } = this.state;
    const hours = Array.from({ length: 24 }, (_, index) => index);

    return (
      <Grid container className={classes.root}>
        <Grid container>
          <Typography className={classes.title}>
            Time Of Use
          </Typography>
        </Grid>
        <Grid container className={classes.tableContainer}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow className={classes.tableRow}>
                <TableCell padding="none" className={classes.tableHeadCell} />
                {hours.map((hour, index) => (
                  <TableCell padding="none" className={classes.tableHeadCell} key={hour}>
                    {index % 2 === 0 && `${hour}:00`}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderTableRows(WEEKDAYS, weekdaysUnitRateColors)}
              {this.renderTableRows(WEEKENDS, weekendsUnitRateColors)}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    );
  }
}

TimeOfUseTariffDetailedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default withStyles(styles)(TimeOfUseTariffDetailedTable);
