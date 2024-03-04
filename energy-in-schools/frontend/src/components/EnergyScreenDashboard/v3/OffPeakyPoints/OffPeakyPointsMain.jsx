import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import PreviewComponent from '../CommonComponents/PreviewComponent';

import mainBg from '../../../../images/Dashboard_V2_Arts/off_peaky_bg.svg';
import offPeakyChartImg from '../../../../images/Dashboard_V3_Arts/off_peaky_electricity_use_chart.png';
import penguinRicoImg from '../../../../images/Dashboard_V2_Arts/rico_cut.svg';
import messageTextBg from '../../../../images/Dashboard_V2_Arts/off_peaky_message_bg_cut.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    backgroundImage: `url(${mainBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  },
  header: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 35,
    },
  },
  textBlocksContainer: {
    padding: '10px 20px',
    height: '90%',
    maxWidth: '35%',
    [theme.breakpoints.up('xl')]: {
      padding: 40,
    },
  },
  messagesContainer: {
    height: '80%',
    [theme.breakpoints.up('xl')]: {
      flexGrow: 1,
    },
  },
  commonMessageBlock: {
    margin: '20px 0 0',
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '40%',
    overflow: 'hidden',
    [theme.breakpoints.up('xl')]: {
      margin: '10px 0 0',
    },
  },
  commonMessageText: {
    fontFamily: DASHBOARD_FONTS.primary,
    color: 'rgb(255, 255, 255)',
    fontWeight: 900,
    fontSize: 24,
    padding: 10,
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
      padding: 16,
    },
  },
  penguinMessageBlock: {
    margin: '10px 0 0',
    backgroundColor: 'rgba(51, 85, 186, 0.5)',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '60%',
    position: 'relative',
    overflow: 'hidden',
  },
  penguinMessageWrapper: {
    height: '70%',
    background: `url(${messageTextBg}) no-repeat`,
    backgroundSize: '100% 100%',
  },
  penguinMessageText: {
    fontFamily: DASHBOARD_FONTS.primary,
    padding: '10px 16px 16px 10px',
    fontWeight: 900,
    fontSize: 24,
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
      marginRight: 26,
      padding: '16px 20px 0 16px',
    },
  },
  penguinIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: '50%',
    borderBottomRightRadius: '25px',
  },
  offPeakyChartContainer: {
    marginLeft: 25,
    padding: '10px 0',
    height: '90%',
    position: 'relative',
    [theme.breakpoints.up('xl')]: {
      marginLeft: 0,
      padding: 40,
    },
  },
  offPeakyChartImg: {
    height: '75%',
    width: '97%',
    marginTop: 10,
    backgroundImage: `url(${offPeakyChartImg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    [theme.breakpoints.up('xl')]: {
      height: '90%',
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

const OffPeakyPoints = ({ classes, previewMessages, messagesSlider }) => (
  <Grid container direction="row" className={classes.root} wrap="nowrap">
    <Grid item container direction="column" className={classes.textBlocksContainer} wrap="nowrap">
      <Grid item container alignItems="center">
        <Typography className={classes.header}>
          How to be an off-peak champion!
        </Typography>
      </Grid>
      <Grid item container direction="column" className={classes.messagesContainer} wrap="nowrap">
        <Grid item container justify="center" className={classes.penguinMessageBlock}>
          <Grid container className={classes.penguinMessageWrapper}>
            <Typography className={classes.penguinMessageText}>
              4-7pm is peak time when more fossil fuel is used to make electricity
            </Typography>
          </Grid>
          <img src={penguinRicoImg} alt="penguin Rico" className={classes.penguinIcon} />
        </Grid>
        <Grid item className={classes.commonMessageBlock}>
          <Typography className={classes.commonMessageText}>
            Between 4pm and 7pm homes and businesses use a lot of electricity
          </Typography>
        </Grid>
        <Grid item className={classes.commonMessageBlock}>
          <Typography className={classes.commonMessageText}>
            What can you do at school and at home to use less at peak times?
          </Typography>
        </Grid>
      </Grid>
    </Grid>
    <Grid item container direction="column" className={classes.offPeakyChartContainer}>
      <Grid item container alignItems="center">
        <Typography className={classes.header}>
          Great Britain&apos;s electricity use on a working day
        </Typography>
      </Grid>
      <Grid item className={classes.offPeakyChartImg} />
    </Grid>
    <Grid item container direction="row" className={classes.previewSlider}>
      <PreviewComponent
        previewMessages={previewMessages}
        sliderComponent={messagesSlider}
      />
    </Grid>
  </Grid>
);

OffPeakyPoints.propTypes = {
  classes: PropTypes.object.isRequired,
  previewMessages: PropTypes.array.isRequired,
  messagesSlider: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
};

export default withStyles(styles)(OffPeakyPoints);
