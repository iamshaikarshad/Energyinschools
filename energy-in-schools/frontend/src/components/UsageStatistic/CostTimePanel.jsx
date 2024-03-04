import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';

import costIcon from '../../images/cost.svg';
import timeIcon from '../../images/time.svg';
import upArrow from '../../images/up_arrow.svg';
import roundToNPlaces from '../../utils/roundToNPlaces';
import { getLondonTimezone } from '../../utils/timeUtils';

const styles = theme => ({
  root: {
    padding: '8px 40px',
    opacity: 0.8,
    borderRadius: '7px',
    fontFamily: 'Roboto',
    backgroundImage: 'linear-gradient(to right, #00bcd4, #007ae2 49%, #6ce4f4);',
    [theme.breakpoints.down('md')]: {
      padding: '8px 15px',
      minHeight: 96,
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
    justifyContent: 'space-around',
  },
  costTimePanelWrapper: {
    padding: '10px 30px 10px 40px',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  tariffConstTimeWrapper: {
    textAlign: 'center',
  },
  costIcon: {
    height: 22,
    padding: 3,
    [theme.breakpoints.down('xs')]: {
      height: 18,
      paddingBottom: 0,
    },
  },
  timeIcon: {
    position: 'relative',
    top: 5,
    height: 22,
    padding: 3,
    [theme.breakpoints.down('xs')]: {
      height: 16,
      paddingBottom: 0,
      top: 0,
    },
  },
  price: {
    paddingRight: 5,
    fontSize: 31,
    fontWeight: 500,
    color: '#fff',
    lineHeight: 1.32,
    [theme.breakpoints.down('xs')]: {
      fontSize: 21,
    },
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 1.5,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    },
  },
  timeRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 1.81,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    },
  },
  timeRangeContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  verticalDivider: {
    borderRight: '1px solid white',
  },
  periodTab: {
    minWidth: 90,
  },
  selectWrapper: {
    paddingRight: 30,
    width: 200,
  },
  selectUnderline: {
    '&:before': {
      borderBottom: '2px solid #0000006b',
    },
    '&:after': {
      borderBottom: '2px solid #0000006b',
    },
  },
});

class CostTimePanel extends React.Component {
  getTariffsForOneProviderOnly = (tariffs) => {
    const selectedProviderAccountId = tariffs.length ? tariffs[0].provider_account_id : null;
    return tariffs.filter(tariff => tariff.provider_account_id === selectedProviderAccountId);
  };

  /**
   * @param tariffs {Tariff[]}
   */
  markMostExpensive = (tariffs) => {
    const tariffsCopy = JSON.parse(JSON.stringify(tariffs));
    if (tariffsCopy.length > 1) {
      const mostExpensiveTariff = tariffsCopy
        .reduce((prev, current) => (prev.watt_hour_cost < current.watt_hour_cost ? current : prev));

      const mostExpensiveTariffOccurrences = tariffsCopy
        .reduce((count, current) => (current.watt_hour_cost === mostExpensiveTariff.watt_hour_cost ? count + 1 : count), 0);

      if (mostExpensiveTariffOccurrences === 1) {
        mostExpensiveTariff.isMostExpensive = true;
      }
    }
    return tariffsCopy;
  };

  /**
   *
   * @param tariff {Tariff}
   * @param index
   * @param array
   * @return {*}
   */
  renderItem = (tariff, index, array) => {
    const { classes } = this.props;
    const {
      watt_hour_cost: wattHourCost,
      active_time_start: activeTimeStart,
      active_time_end: activeTimeEnd,
      active_date_end: activeDateEnd,
      isMostExpensive,
    } = tariff;
    const safePrice = roundToNPlaces((wattHourCost || 0) * 1000 * 100, 1);
    const londonTimezone = getLondonTimezone();

    const starTimeString = moment(`${activeTimeStart}${londonTimezone}`, 'HH:mm:ssZ')
      .format('h:mm A');
    const endTimeString = moment(`${activeTimeEnd || '00:00:00'}${londonTimezone}`, 'HH:mm:ssZ')
      .format('h:mm A');

    const timeString = `${starTimeString} - ${endTimeString}`;

    const showDivider = index + 1 < array.length && array.length > 1;
    const xs = Math.round(10 / array.length);

    return (
      <React.Fragment key={index}>
        <Grid item xs={xs} container alignItems="center" justify="space-around">
          <Grid item>
            <div className={classes.tariffConstTimeWrapper}>
              <img alt="Cost" src={costIcon} className={classes.costIcon} />
              <span className={classes.price}>{safePrice}</span>
              <span className={classes.priceLabel}>P/kWh</span>
            </div>
            <div className={classes.tariffConstTimeWrapper}>
              <img alt="Time" src={timeIcon} className={classes.timeIcon} />
              <span className={classes.timeRange}>{timeString}</span>
            </div>
          </Grid>
          {activeDateEnd ? (
            <Grid item className={classes.timeRangeContainer}>
              <span className={classes.timeRange}>valid until {activeDateEnd}</span>
            </Grid>
          ) : (
            isMostExpensive && (
              <Grid item className={classes.timeRangeContainer}>
                <img
                  alt="Increased"
                  src={upArrow}
                  style={{
                    position: 'relative',
                    top: 5,
                    height: 22,
                    padding: 3,
                  }}
                />
                <span className={classes.timeRange}>INCREASED COST</span>
              </Grid>
            )
          )}
        </Grid>
        {showDivider ? <div className={classes.verticalDivider} /> : null}
      </React.Fragment>
    );
  };

  render() {
    const {
      classes, currentTariffs,
    } = this.props;
    return (
      <div className={classes.costTimePanelWrapper}>
        <Grid container justify="space-between" className={classes.root}>
          {this.markMostExpensive(this.getTariffsForOneProviderOnly(currentTariffs)).map(this.renderItem)}
        </Grid>
      </div>
    );
  }
}

CostTimePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  currentTariffs: PropTypes.array.isRequired,
};

export default compose(withStyles(styles))(CostTimePanel);
