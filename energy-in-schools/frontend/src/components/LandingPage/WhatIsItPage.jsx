import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { LANDING_PAGE_COMMON_STYLES } from './constants';
import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  messageBlocksWrapper: {
    margin: '50px 0 70px 0',
    [theme.breakpoints.down('xs')]: {
      margin: '30px 0',
    },
  },
  messageBlock: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '48%',
    padding: '30px 40px',
    marginTop: 20,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  messageBlockTitle: {
    color: NEW_PRIMARY_COLOR,
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    margin: '5px 0',
    fontSize: 20,
    [theme.breakpoints.down('xs')]: {
      fontSize: 15,
    },
  },
});

const FIRST_MESSAGE_LIST = [
  'Energy management portal to help staff manage energy and heat usage in school buildings',
  'Tariff switching portal comparing time-of-use based tariffs',
  'Teacher and pupil portal and an energy display (TV) to support behaviour change and engage building users on energy issues',
  'Supporting energy advice materials, energy champions training and an initial energy audit',
];

const SECOND_MESSAGE_LIST = [
  'Curriculum aligned STEM teaching and learning resources for KS2/KS3 supported with micro:bit kit',
  'Educational environment to teach the basics of coding and to solve real world problems',
];

const WhatIsItPage = (props) => {
  const { classes } = props;

  return (
    <Grid container justify="center" className={classes.greyBackground}>
      <Grid item container xs={10} md={9}>
        <Grid container>
          <Grid container>
            <h1 className={classes.title}>What is it?</h1>
          </Grid>
          <Grid container item xs={12} md={6}>
            <p className={classes.message}>
              Energy in Schools is a government funded initiative to help schools in the UK to reduce their energy
              usage, reduce their energy bills, and to educate their pupils about energy efficiency. It provides:
            </p>
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-between" className={classes.messageBlocksWrapper}>
          <Grid container direction="column" className={classes.messageBlock}>
            <h1 className={classes.messageBlockTitle}>An easy-to-use energy platform</h1>
            <ul className={classes.messageBlockList}>
              {FIRST_MESSAGE_LIST.map(message => (
                <li key={`first-${message.slice(5)}`} className={classes.messageBlockItem}>{message}</li>
              ))}
            </ul>
          </Grid>
          <Grid container direction="column" className={classes.messageBlock}>
            <h1 className={classes.messageBlockTitle}>An educational platform</h1>
            <ul className={classes.messageBlockList}>
              {SECOND_MESSAGE_LIST.map(message => (
                <li key={`second-${message.slice(5)}`} className={classes.messageBlockItem}>{message}</li>
              ))}
            </ul>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

WhatIsItPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
)(WhatIsItPage);
