import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import penguinRicoImg from '../../../../images/Dashboard_V2_Arts/rico_cut.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';
import backgroundImage from '../../../../images/cloud_bg.png';
import mainBgImg from '../../../../images/big-facts-without-cloud.png';

const styles = theme => ({
  root: {
    backgroundImage: `url(${backgroundImage}), url(${mainBgImg})`,
    backgroundSize: '110% 100%',
    backgroundPosition: 'center 60%, center',
    height: '100%',
    padding: '2% 2% 0 4%',
    position: 'relative',
    '-webkit-transform': 'scaleX(-1)',
    transform: 'scaleX(-1)',
  },
  thinkImg: {
    '-webkit-transform': 'scaleX(-1)',
    transform: 'scaleX(-1)',
    position: 'absolute',
    bottom: 0,
    left: '10px',
    height: '28%',
    width: 'auto',
    overflow: 'visible',
  },
  messageText: {
    fontFamily: DASHBOARD_FONTS.primary,
    padding: '10px 16px 16px 10px',
    fontWeight: 900,
    fontSize: 28,
    maxWidth: '65%',
    '-webkit-transform': 'scaleX(-1)',
    transform: 'scaleX(-1)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 40,
      padding: 16,
    },
  },
  messageHeader: {
    marginBottom: 15,
  },
  schoolName: {
    color: '#049bd4',
    marginRight: 10,
  },
  problemsList: {
    margin: '28px 0',
    listStyleType: 'disc',
  },
});

const Intro = ({
  classes,
  schoolInformation,
}) => (
  <Grid container alignItems="center" justify="center" direction="column" className={classes.root} wrap="nowrap">
    <Grid container direction="row" justify="center" alignItems="center">
      <Typography className={classes.messageText}>
        <p className={classes.messageHeader}>
          <span className={classes.schoolName}>
            {schoolInformation.name}
          </span>
          is taking part in the Energy in Schools scheme.
        </p>
        Energy in Schools addresses 3 big energy problems:
        <ul className={classes.problemsList}>
          <li>Energy usage contributes to climate change;</li>
          <li>School being too cold/hot/light/dark/stuffy → harder to learn</li>
          <li>High school fuel bills → less money for other stuff</li>
        </ul>
        To find out more ask a teacher or one of your energy champions
      </Typography>
    </Grid>
    <img src={penguinRicoImg} alt="pinguin Rico" className={classes.thinkImg} />
  </Grid>
);

Intro.propTypes = {
  classes: PropTypes.object.isRequired,
  schoolInformation: PropTypes.object.isRequired,
};

export default withStyles(styles)(Intro);
