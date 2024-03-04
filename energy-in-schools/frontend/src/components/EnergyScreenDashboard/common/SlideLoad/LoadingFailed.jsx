import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = ({
  root: {
    position: 'relative',
    height: '100%',
  },
  rootBlur: {
    height: '100%',
    filter: 'blur(4px)',
  },
  textBlur: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 50,
    fontWeight: 'bold',
    position: 'absolute',
    color: 'rgb(255, 255, 255)',
    textShadow: '1px 1px 1px rgb(38, 153, 251)',
    top: '40%',
  },
});

const LoadingFailed = ({ classes, backgroundImg }) => (
  <Grid className={classes.root} container justify="center" alignItems="center">
    <Grid
      container
      direction="row"
      className={classes.rootBlur}
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
      wrap="nowrap"
      justify="center"
      alignItems="center"
    />
    <Typography className={classes.textBlur}>
      Oops, no data
    </Typography>
  </Grid>
);

LoadingFailed.propTypes = {
  classes: PropTypes.object.isRequired,
  backgroundImg: PropTypes.string.isRequired,
};

export default withStyles(styles)(LoadingFailed);
