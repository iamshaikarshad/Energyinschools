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
    minHeight: 600,
  },
  rootBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    minHeight: 600,
    position: 'absolute',
    width: '100%',
  },
  textBlur: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 35,
    fontWeight: 'bold',
    position: 'relative',
    color: 'rgb(255, 255, 255)',
    textShadow: '1px 1px 1px rgb(38, 153, 251)',
    padding: '15% 0',
    textAlign: 'center',
  },
});

const LoadingFailed = ({ classes, backgroundImg }) => (
  <Grid
    className={classes.root}
    style={{
      backgroundImage: `url(${backgroundImg})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'inherit',
      backgroundPositionX: 'center',
      backgroundPositionY: 'top',
    }}
  >
    <Grid className={classes.rootBlur} />
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
