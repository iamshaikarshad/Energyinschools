import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { LANDING_PAGE_COMMON_STYLES } from './constants';

import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  blueBackground: {
    height: 300,
    backgroundColor: NEW_PRIMARY_COLOR,
  },
  blueText: {
    color: NEW_PRIMARY_COLOR,
  },
});

const RegisterYourInterestBlock = (props) => {
  const { classes, onClickRegisterBtn } = props;

  return (
    <Grid container justify="center" className={classes.blueBackground}>
      <Grid item xs={10} md={9} container direction="column" justify="center">
        <h1 className={classes.mainTitle}>Click here to start the <br />registration process</h1>
        <Button
          variant="outlined"
          className={`${classes.button} ${classes.blueText}`}
          onClick={onClickRegisterBtn}
        >
          Register your interest
        </Button>
      </Grid>
    </Grid>
  );
};

RegisterYourInterestBlock.propTypes = {
  classes: PropTypes.object.isRequired,
  onClickRegisterBtn: PropTypes.func.isRequired,
};

export default withStyles(styles)(RegisterYourInterestBlock);
