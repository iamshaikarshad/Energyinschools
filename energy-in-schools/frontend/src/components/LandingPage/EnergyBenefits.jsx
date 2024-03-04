import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { LANDING_PAGE_COMMON_STYLES } from './constants';

import benefits from '../../images/LandingPageArts/benefits.jpg';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
});

const LIST_CONTENT = [
  'Give your students the chance to use cutting-edge IoT coding tools to learn how address one of the key issues for their generation (climate change).',
  'A dedicated Samsung energy display TV for your reception or other area.',
  'Tips and advice on how to minimise bills and how to maximise cashback.',
  'Curriculum aligned teaching resources which solve real world energy problems',
  'Training package for energy champions',
  'Easy to use contract management for automatic price comparison at the end of your current energy contract.',
];

const EnergyBenefits = (props) => {
  const { classes } = props;

  return (
    <Grid container className={classes.whiteBackground}>
      <Grid item container xs={12} md={6} className={classes.benefitsImageBlock}>
        <img src={benefits} alt="Benefits" className={classes.benefitsImage} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Grid container direction="column" className={classes.benefitsBlock}>
          <h1 className={classes.title}>Benefits for schools beyond energy management</h1>
          <ul className={classes.messageBlockList}>
            {LIST_CONTENT.map(message => (
              <li key={`energy-${message.slice(5)}`} className={classes.messageBlockItem}>
                {message}
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
    </Grid>
  );
};

EnergyBenefits.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnergyBenefits);
