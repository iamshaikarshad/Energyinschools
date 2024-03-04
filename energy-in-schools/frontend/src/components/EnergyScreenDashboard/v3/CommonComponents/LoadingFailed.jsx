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
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
  },
  rootBlur: {
    height: '100%',
    position: 'relative',
    zIndex: 0,
    '&::after': {
      content: '""',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      position: 'absolute',
      zIndex: 100,
    },
  },
  textBlur: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 56,
    fontWeight: 'bold',
    position: 'absolute',
    color: 'rgb(255, 255, 255)',
    textShadow: '1px 1px 1px rgb(38, 153, 251)',
    top: '40%',
    left: 0,
    width: '100%',
  },
  name: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 49,
    fontWeight: 900,
    padding: 50,
    position: 'absolute',
    color: 'rgb(255, 255, 255)',
    top: '5%',
    left: 0,
    width: '100%',
  },
});

class LoadingFailed extends React.PureComponent {
  render() {
    const {
      classes, backgroundImg, backgroundColor, name,
    } = this.props;
    return (
      <Grid
        className={classes.root}
        container
        justify="center"
        alignItems="center"
        style={{
          backgroundColor,
          backgroundImage: `url(${backgroundImg})`,
        }}
      >
        <Grid
          container
          className={classes.rootBlur}
          wrap="nowrap"
          justify="center"
          alignItems="center"
        />
        <Typography align="center" className={classes.name}>{name}</Typography>
        <Typography align="center" className={classes.textBlur}>
          Oops, no data
        </Typography>
      </Grid>
    );
  }
}

LoadingFailed.propTypes = {
  classes: PropTypes.object.isRequired,
  backgroundImg: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
};

export default withStyles(styles)(LoadingFailed);
