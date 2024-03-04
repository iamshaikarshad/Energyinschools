import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import LeagueComponent from '../CommonComponents/LeagueComponent';
import PreviewComponent from '../CommonComponents/PreviewComponent';

import mainBg from '../../../../images/Dashboard_V2_Arts/off_peaky_bg.svg';
import offPeakyPieChartImg from '../../../../images/Dashboard_V2_Arts/off_peaky_pie_chart.svg';
import penguinRicoImg from '../../../../images/Dashboard_V2_Arts/rico_cut.svg';
import messageTextBg from '../../../../images/Dashboard_V2_Arts/off_peaky_message_bg_cut.svg';

import roundToNPlaces from '../../../../utils/roundToNPlaces';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    backgroundImage: `url(${mainBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  },
  textBlock: {
    padding: '10px 20px',
    height: '80%',
    [theme.breakpoints.up('xl')]: {
      padding: 40,
    },
  },
  textBlockHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 35,
    },
  },
  valuesContainer: {
    height: '30%',
    paddingTop: 0,
  },
  valueBlock: {
    height: '100%',
    padding: 8,
    [theme.breakpoints.up('xl')]: {
      padding: 10,
    },
  },
  valueWrapper: {
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    borderRadius: 25,
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '100%',
  },
  pointsValue: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1.61,
    paddingLeft: 10,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '3px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 52,
    },
  },
  pointsUnit: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 24,
    },
  },
  permanentMessagesContainer: {
    height: '68%',
  },
  messagesWrapper: {
    padding: '12px 0px 12px 8px',
    height: '100%',
    [theme.breakpoints.up('xl')]: {
      padding: '12px 0px 12px 10px',
    },
  },
  offPeakyPieChartContainer: {
    padding: '12px 8px 12px 0px',
    height: '100%',
    [theme.breakpoints.up('xl')]: {
      padding: '12px 10px 12px 0px',
    },
  },
  offPeakyPieChartWrapper: {
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    borderRadius: '25px',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  offPeakyPieChartImg: {
    height: '90%',
    width: '90%',
    backgroundImage: `url(${offPeakyPieChartImg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  firstMessageBlock: {
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '41%',
    overflow: 'hidden',
  },
  firstMessageText: {
    fontFamily: DASHBOARD_FONTS.primary,
    color: 'rgb(255, 255, 255)',
    fontWeight: 900,
    fontSize: 16,
    padding: 10,
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
      padding: 16,
    },
  },
  secondMessageBlock: {
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '55%',
    position: 'relative',
    overflow: 'hidden',
  },
  secondMessageWrapper: {
    height: '70%',
    background: `url(${messageTextBg}) no-repeat`,
    backgroundSize: '100% 100%',
  },
  secondMessageText: {
    fontFamily: DASHBOARD_FONTS.primary,
    padding: '10px 16px 16px 10px',
    fontWeight: 900,
    fontSize: 16,
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
      padding: 16,
    },
  },
  winText: {
    display: 'inline-block',
    [theme.breakpoints.up('xl')]: {
      marginTop: 8,
    },
  },
  secondMessageIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: '50%',
    borderBottomRightRadius: '25px',
  },
  leagueContainer: {
    height: '100%',
    paddingTop: 10,
    position: 'relative',
    [theme.breakpoints.up('xl')]: {
      paddingTop: 40,
    },
  },
  leaguePointsUnit: {
    fontSize: 13,
    [theme.breakpoints.up('xl')]: {
      fontSize: 16,
    },
  },
  previewSlider: {
    position: 'absolute',
    height: '15%',
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
});

const OffPeakyPoints = ({
  classes, current, offPeakyLeagueData, previewMessages, messagesSlider, offPeakyYesterdayValue,
}) => {
  const points = roundToNPlaces(current, 1);
  const yesterdayValue = roundToNPlaces(offPeakyYesterdayValue, 1);
  return (
    <Grid container direction="row" className={classes.root} wrap="nowrap">
      <Grid container direction="column" item xs={6} className={classes.textBlock} wrap="nowrap">
        <Grid item container alignItems="center">
          <Typography className={classes.textBlockHeading}>
            Our school has earned
          </Typography>
        </Grid>
        <Grid item container className={classes.valuesContainer}>
          <Grid item xs={6} className={classes.valueBlock} style={{ paddingLeft: 0 }}>
            <Grid container direction="column" justify="center" className={classes.valueWrapper}>
              <Typography align="center" className={classes.pointsValue}>
                {points}
              </Typography>
              <Typography align="center" className={classes.pointsUnit}>
                off-peaky points
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={6} className={classes.valueBlock} style={{ paddingRight: 0 }}>
            <Grid container direction="column" justify="center" className={classes.valueWrapper}>
              <Typography align="center" className={classes.pointsValue}>
                {yesterdayValue}
              </Typography>
              <Typography align="center" className={classes.pointsUnit}>
                points earned yesterday
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container className={classes.permanentMessagesContainer}>
          <Grid item xs={6} className={classes.offPeakyPieChartContainer}>
            <Grid container justify="center" alignItems="center" className={classes.offPeakyPieChartWrapper}>
              <Grid className={classes.offPeakyPieChartImg} />
            </Grid>
          </Grid>
          <Grid item xs={6} container direction="column" justify="space-between" className={classes.messagesWrapper}>
            <Grid item container justify="center" className={classes.firstMessageBlock}>
              <Typography className={classes.firstMessageText}>
                <span>Help your school use less electricity between 4pm and 7pm to climb off-peaky mountain.</span><br />
                <span className={classes.winText}>The top school in January 2020 will win an amazing prize!!!</span>
              </Typography>
            </Grid>
            <Grid item container justify="center" className={classes.secondMessageBlock}>
              <Grid container className={classes.secondMessageWrapper}>
                <Grid item xs={10}>
                  <Typography className={classes.secondMessageText}>
                    4-7pm is peak time when more fossil fuel is used to make electricity
                  </Typography>
                </Grid>
              </Grid>
              <img src={penguinRicoImg} alt="pinguin Rico" className={classes.secondMessageIcon} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container direction="column" item xs={6} className={classes.leagueContainer}>
        <LeagueComponent
          classes={{
            leaguePointsUnit: classes.leaguePointsUnit,
          }}
          leagueData={offPeakyLeagueData}
        />
      </Grid>
      <Grid item container direction="row" className={classes.previewSlider}>
        <PreviewComponent
          previewMessages={previewMessages}
          sliderComponent={messagesSlider}
        />
      </Grid>
    </Grid>
  );
};

OffPeakyPoints.propTypes = {
  classes: PropTypes.object.isRequired,
  current: PropTypes.number.isRequired,
  offPeakyYesterdayValue: PropTypes.number,
  offPeakyLeagueData: PropTypes.object,
  previewMessages: PropTypes.array.isRequired,
  messagesSlider: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
};

OffPeakyPoints.defaultProps = {
  offPeakyLeagueData: null,
  offPeakyYesterdayValue: null,
};

export default withStyles(styles)(OffPeakyPoints);
