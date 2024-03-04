import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { LANDING_PAGE_COMMON_STYLES } from './constants';

import screens from '../../images/LandingPageArts/screens_2.svg';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  screensImage: {
    width: '80%',
    height: '80%',
    margin: 'auto',
    objectFit: 'contain',
  },
});

const LearningPlatformPage = (props) => {
  const { classes } = props;

  return (
    <Grid container className={classes.whiteBackground}>
      <Grid item container xs={12} md={6} className={classes.benefitsImageBlock}>
        <img src={screens} alt="Screens" className={classes.screensImage} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Grid container direction="column" className={classes.benefitsBlock}>
          <h1 className={classes.title}>IoT Learning Platform and Energy Management Portal</h1>
          <p className={classes.message}>
            Participating schools will have access to the Energy In Schools
            software suite, which includes the Internet of Things Learning
            Platform, and the Energy Management Portal.
          </p>
        </Grid>
      </Grid>
    </Grid>
  );
};

LearningPlatformPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LearningPlatformPage);
