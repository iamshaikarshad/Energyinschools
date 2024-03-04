import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { LANDING_PAGE_COMMON_STYLES } from './constants';

import { NEW_GRAY_BACKGROUND } from '../../styles/stylesConstants';
import { BLOB_STORAGE_URL } from '../../constants/config';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  root: {
    backgroundColor: NEW_GRAY_BACKGROUND,
    padding: '40px 0',
  },
  reactPlayer: {
    margin: '40px 0',
  },
});

// const USAGE_DEMO_VIDEO = 'https://energyinschoolstest.blob.core.windows.net/energy-in-schools-media/showcase/Energy_in_Schools_Demo_Extended.mp4';

const ENERGY_USAGE_VIDEO = `${BLOB_STORAGE_URL}/energy-in-schools-media/showcase/Energy Video Showcase.m4v`;

const LandingPageVideo = (props) => {
  const { classes } = props;

  return (
    <Grid container justify="center" className={classes.root}>
      <Grid item container direction="column" xs={10} md={9}>
        {/* TODO: remove or uncomment when video is up to date */}
        {/* <h1 className={classes.title}>How the platform can be used</h1> */}
        {/* <ReactPlayer */}
        {/*   url={USAGE_DEMO_VIDEO} */}
        {/*   width="100%" */}
        {/*   height="auto" */}
        {/*   controls */}
        {/*   className={classes.reactPlayer} */}
        {/* /> */}
        <h1 className={classes.title}>Why time-of-energy-use matters</h1>
        <ReactPlayer
          url={ENERGY_USAGE_VIDEO}
          width="100%"
          height="auto"
          controls
          className={classes.reactPlayer}
        />
      </Grid>
    </Grid>
  );
};

LandingPageVideo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LandingPageVideo);
