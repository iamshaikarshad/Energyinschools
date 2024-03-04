import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { isNil } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import cloudBg from '../../../../images/Dashboard_V2_Arts/off_peaky_cloud_bg.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

import getOrdinal from '../../../../utils/getOrdinal';
import roundToNPlaces from '../../../../utils/roundToNPlaces';

const styles = theme => ({
  root: {
    position: 'absolute',
    width: '22%',
  },
  specRoot: {
    transform: 'scale(1.15, 1.15)',
  },
  blockWrapper: {
    height: '100%',
    position: 'relative',
  },
  placeHeader: {
    fontFamily: DASHBOARD_FONTS.primary,
    color: 'rgb(255, 255, 255)',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: '2%',
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  avatar: {
    height: 80,
    width: 'auto',
    [theme.breakpoints.up('xl')]: {
      height: 90,
    },
  },
  valueBlock: {
    backgroundImage: `url(${cloudBg})`,
    backgroundSize: '100% 100%',
    position: 'absolute',
    left: '0%',
    top: '-75%',
    width: '100%',
    height: '80%',
    transform: 'scale(1.1, 1)',
  },
  value: {
    fontSize: 14,
    lineHeight: 1.2,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
  unit: {
    lineHeight: 1,
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 12,
    [theme.breakpoints.up('xl')]: {
      fontSize: 14,
    },
  },
  ordinalIndicator: {
    display: 'inline-block',
    verticalAlign: 'super',
  },
});

const LeagueMemberComponent = ({
  classes, placeHeader, avatar, value, unit, rank, isSpecific,
}) => {
  if (isNil(value)) return null;
  return (
    <Grid container justify="flex-end" alignItems="center" className={classNames(classes.root, isSpecific ? classes.specRoot : '')}>
      <Grid item container direction="column" justify="center" alignItems="center" xs={12} className={classes.blockWrapper} wrap="nowrap">
        <Grid container direction="column" justify="center" alignItems="center" className={classes.valueBlock}>
          <Typography className={classes.value}>
            {roundToNPlaces(value, 1)}
          </Typography>
          <Typography className={classes.unit}>
            {unit}
          </Typography>
        </Grid>
        <Typography className={classes.placeHeader} noWrap>
          {placeHeader}
          <span>, {rank}</span>
          <span className={classes.ordinalIndicator}>{getOrdinal(rank).ordinalIndicator}</span>
        </Typography>
        <img src={avatar} className={classes.avatar} alt="avatar" />
      </Grid>
    </Grid>
  );
};

LeagueMemberComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  placeHeader: PropTypes.string,
  avatar: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  unit: PropTypes.string,
  rank: PropTypes.number.isRequired,
  isSpecific: PropTypes.bool,
};

LeagueMemberComponent.defaultProps = {
  placeHeader: '',
  avatar: '',
  value: null,
  unit: '',
  isSpecific: false,
};

export default withStyles(styles)(LeagueMemberComponent);
