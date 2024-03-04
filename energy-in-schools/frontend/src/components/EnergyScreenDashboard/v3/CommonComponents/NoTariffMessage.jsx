import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    fontFamily: DASHBOARD_FONTS.primary,
    color: 'rgb(255, 255, 255)',
  },
  title: {
    fontFamily: 'inherit',
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1.61,
    letterSpacing: '3px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 32,
    },
  },
  content: {
    padding: '0px 5px',
    fontFamily: 'inherit',
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '2px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
});

const NoTariffMessage = ({ classes, title, content }) => (
  <Typography align="center" component="div" className={classes.root}>
    <Typography align="center" className={classes.title}>{title}</Typography>
    <Typography align="center" component="div" className={classes.content}>
      {content}
    </Typography>
  </Typography>
);

NoTariffMessage.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  content: PropTypes.node,
};

NoTariffMessage.defaultProps = {
  title: 'No tariff info!',
  content: 'To see cost info ask your school manager to update tariff details via the EiS portal',
};

export default withStyles(styles)(NoTariffMessage);
