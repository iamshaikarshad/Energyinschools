import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import geniusLogo from '../images/LandingPageArts/myutilitygenius-logo-white.png';

import { APP_FOOTER_ID } from '../constants/config';
import { NEW_PRIMARY_COLOR } from '../styles/stylesConstants';

const styleSheet = theme => ({
  root: {
    width: '100%',
    padding: '40px 0',
    [theme.breakpoints.down('xs')]: {
      padding: '20px 0',
    },
  },
  copyright: {
    color: 'white',
    fontFamily: 'Inter',
    fontSize: 11,
    margin: 0,
  },
  container: {
    marginBottom: 30,
    width: '100%',
  },
  logoIcon: {
    maxHeight: 56,
    maxWidth: 200,
    [theme.breakpoints.down('xs')]: {
      maxHeight: 35,
      maxWidth: 110,
    },
  },
});

function Footer(props) {
  const { classes, location } = props;
  let backgroundColor = NEW_PRIMARY_COLOR;

  if (location.pathname === '/editor') {
    backgroundColor = '#2741b2';
  }

  return (
    <footer id={APP_FOOTER_ID} className={classes.root} style={{ backgroundColor }}>
      <Grid container justify="center">
        <Grid item container xs={10} md={9}>
          <Grid container alignItems="center" className={classes.container}>
            <Grid item container md={12} xs={12} justify="center">
              <img src={geniusLogo} alt="genius-logo" className={classes.logoIcon} />
            </Grid>
          </Grid>
          <Grid item container direction="column" alignItems="center">
            <p className={classes.copyright}>{(new Date().getFullYear())} All rights reserved</p>
            <p className={classes.copyright}>
              <Link to="/terms-and-conditions" color="inherit" className={classes.copyright}>Terms and Conditions</Link>
              &#160;and&#160;
              <Link to="/privacy-policy" color="inherit" className={classes.copyright}>Privacy Policy</Link>
            </p>
          </Grid>
        </Grid>
      </Grid>
    </footer>
  );
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styleSheet),
  withRouter,
)(Footer);
