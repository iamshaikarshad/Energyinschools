import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import { energyTypeTab } from './constants';

import {
  TEMPERATURE_STATISTIC,
  USAGE_CARD_TYPES,
  UNIT_TO_LABEL_MAP,
  SMART_THINGS_SENSOR_CAPABILITY,
} from '../../constants/config';

import electricityIcon from '../../images/electricity_usage.svg';
import gasIcon from '../../images/gas_usage.svg';
import solarIcon from '../../images/sun_usage.svg';
import temperatureIcon from '../../images/temperature.svg';
import smartMeteringIcon from '../../images/smart_metering.svg';
import smartPlugIcon from '../../images/smart_plug_white.svg';
import questionIcon from '../../images/question_mark_white_icon.svg';

import roundToNPlaces from '../../utils/roundToNPlaces';
import truncateText from '../../utils/truncateText';

const MAX_TEXT_LENGTH = Object.freeze({
  normal: 30,
  enlarged: 60,
});

const styles = theme => ({
  wrapper: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: 47,
  },
  cardRoot: {
    width: 135,
    height: 170,
    padding: theme.spacing(1),
    borderRadius: 39,
    wordWrap: 'break-word',
  },
  listItem: {
    marginBottom: theme.spacing(1.5),
  },
  valueContainer: {
    width: '100%',
    borderRadius: 28,
    textAlign: 'center',
    padding: theme.spacing(0.5),
    boxShadow: 'none',
    lineHeight: 'normal',
  },
  valueUnit: {
    fontSize: 9,
    fontWeight: 500,
  },
  value: {
    fontSize: 18,
    fontWeight: 500,
  },
  location: {
    color: theme.palette.common.white,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: '15px',
    textTransform: 'uppercase',
    width: '100%', // important: for correct cross-browser text breaking
  },
  summary: {
    color: theme.palette.common.white,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 1.44,
    textTransform: 'uppercase',
  },
});

const SELECTED_ITEM_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 1)',
  transform: 'scale(1.05, 1.05)',
};

const ENERGY_TYPE_TAB_TO_AVATAR_MAP = Object.freeze({
  [energyTypeTab.electricity]: electricityIcon,
  [energyTypeTab.gas]: gasIcon,
  [energyTypeTab.solar]: solarIcon,
  [energyTypeTab.smartPlug]: electricityIcon,
  [energyTypeTab.unknown]: questionIcon,
  [TEMPERATURE_STATISTIC.type]: temperatureIcon,
});

const getCardStyle = (type, extraType) => {
  switch (type) {
    case USAGE_CARD_TYPES.ELECTRICITY:
      return {
        cardColour: '#2699fb',
        avatarImage: electricityIcon,
      };
    case USAGE_CARD_TYPES.GAS:
      return {
        cardColour: '#f38f31',
        avatarImage: gasIcon,
      };
    case USAGE_CARD_TYPES.SOLAR:
      return {
        cardColour: '#ffbb3c',
        avatarImage: solarIcon,
      };
    case USAGE_CARD_TYPES.TEMPERATURE:
      return {
        cardColour: '#eebb3c',
        avatarImage: temperatureIcon,
      };
    case USAGE_CARD_TYPES.SUMMARY:
      return {
        cardColour: '#00bcd4',
        avatarImage: ENERGY_TYPE_TAB_TO_AVATAR_MAP[extraType] || questionIcon,
      };
    case SMART_THINGS_SENSOR_CAPABILITY.powerMeter:
      return {
        cardColour: 'rgb(0, 200, 245)',
        avatarImage: smartMeteringIcon,
      };
    case USAGE_CARD_TYPES.SMART_PLUG:
      return {
        cardColour: 'rgb(3, 188, 245)',
        avatarImage: smartPlugIcon,
      };
    case USAGE_CARD_TYPES.UNKNOWN:
      return {
        cardColour: 'rgba(0, 0, 0, 0.7)',
        avatarImage: questionIcon,
      };
    default:
      return {
        cardColour: '#eebb3c',
        avatarImage: temperatureIcon,
      };
  }
};

const UsageCard = ({
  classes, type, unit, value, meterName, location, selected, summaryLabel, placesAfterDot, extraType,
}) => {
  const cardStyle = getCardStyle(type, extraType);
  const unitLabel = UNIT_TO_LABEL_MAP[unit];

  const maxNameLength = location ? MAX_TEXT_LENGTH.normal : MAX_TEXT_LENGTH.enlarged;

  return (
    <Grid item className={classes.wrapper} style={selected ? SELECTED_ITEM_STYLE : {}}>
      <Card classes={{ root: classes.cardRoot }} style={{ backgroundColor: cardStyle.cardColour }}>
        <Grid container justify="center" className={classes.listItem}>
          <img alt="Logo" src={cardStyle.avatarImage} style={{ height: 22 }} />
        </Grid>
        <Grid container justify="center" className={classes.listItem}>
          <Paper elevation={1} className={classes.valueContainer}>
            <Typography variant="h1" className={classes.value} style={{ color: cardStyle.cardColour }}>{roundToNPlaces(value, placesAfterDot)}</Typography>
            <Typography variant="caption" className={classes.valueUnit} style={{ color: cardStyle.cardColour }}>{unitLabel}</Typography>
          </Paper>
        </Grid>
        <Grid container justify="center" className={classes.listItem} style={{ paddingTop: 10 }}>
          {type === 'SUMMARY' ? (
            <Typography variant="h2" className={classes.summary}>{summaryLabel}</Typography>
          ) : (
            <React.Fragment>
              <Typography variant="h2" className={classes.location}>
                {truncateText(meterName, maxNameLength)}
              </Typography>
              <Typography variant="h2" className={classes.location}>
                {truncateText(location, MAX_TEXT_LENGTH.normal)}
              </Typography>
            </React.Fragment>
          )}
        </Grid>
      </Card>
    </Grid>
  );
};

UsageCard.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  location: PropTypes.string,
  meterName: PropTypes.string,
  value: PropTypes.number,
  selected: PropTypes.bool,
  summaryLabel: PropTypes.string,
  placesAfterDot: PropTypes.number,
  extraType: PropTypes.string,
};

UsageCard.defaultProps = {
  location: '',
  meterName: '',
  value: 0,
  selected: false,
  summaryLabel: 'TOTAL CONSUMPTION',
  placesAfterDot: 2,
  extraType: USAGE_CARD_TYPES.ELECTRICITY,
};

export default withStyles(styles)(UsageCard);
