import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import emptyIcon from '../images/empty.svg';

const NoItems = ({ paddingTop, imageWidth, ...rest }) => (
  <Grid container justify="center" alignItems="center" direction="column" style={{ paddingTop }} {...rest}>
    <Grid item>
      <img src={emptyIcon} alt="Empty data" style={{ width: imageWidth }} />
    </Grid>
  </Grid>
);

NoItems.propTypes = {
  paddingTop: PropTypes.number,
  imageWidth: PropTypes.number,
};

NoItems.defaultProps = {
  imageWidth: 210,
  paddingTop: 100,
};

export default NoItems;
