import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { LANDING_PAGE_COMMON_STYLES } from './constants';

import temperature from '../../images/LandingPageArts/temperature.svg';
import energy from '../../images/LandingPageArts/energy.svg';
import coalPower from '../../images/LandingPageArts/coal-power.svg';
import education from '../../images/LandingPageArts/education.svg';
import microbit from '../../images/LandingPageArts/microbit.png';

import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  microbitBlock: {
    marginBottom: 50,
  },
  benefitsBlockList: {
    margin: 0,
    paddingLeft: 20,
    listStyleType: 'none',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    },
  },
  benefitsBlockItem: {
    margin: '20px 0',
  },
  benefitsBlockItemLogoWrapper: {
    backgroundColor: NEW_PRIMARY_COLOR,
    borderRadius: 25,
    padding: 10,
    height: 80,
    width: 80,
    marginRight: 20,
    [theme.breakpoints.down('xs')]: {
      borderRadius: 10,
      height: 40,
      width: 40,
      marginRight: 10,
    },
  },
  benefitsBlockItemLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  benefitsBlockItemMessage: {
    margin: 0,
    width: 'calc(100% - 100px)',
    [theme.breakpoints.down('xs')]: {
      width: 'calc(100% - 50px)',
    },
  },
  benefitsBlockItemTitle: {
    color: NEW_PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  microbitImageWrapper: {
    position: 'relative',
    width: '100%',
  },
  microbitImage: {
    width: '100%',
    objectFit: 'contain',
  },
  imageCredit: {
    position: 'absolute',
    bottom: -30,
    right: 0,
    marginRight: 50,
    fontSize: 12,
  },
});

const PRIMARY_LIST_CONTENT = [
  'A set of engaging, fun and curriculum aligned lesson plans designed for KS 2/3 that allow your pupils to solve real world problems with a focus on STEM subjects',
  'A micro:bit learning platform including temperature sensors and colour changing light bulbs which can be controlled by the micro:bits',
  'A class pack of 30-40 BBC micro:bit devices for your school, allowing your teachers and pupils to create digital class projects using your school’s energy data, such as:',
];

const SECONDARY_LIST_CONTENT = [
  {
    image: temperature,
    alt: 'temperature',
    title: 'Programming a micro:bit to record temperature every minute',
    message: 'Pupils can then use the platform to download and analyse this long term data.',
  },
  {
    image: energy,
    alt: 'energy',
    title: 'Programming a micro:bit to measure the energy usage of an appliance every 30 seconds',
    message: 'Pupils can then download appliance and school level data for analysis and understanding.',
  },
  {
    image: coalPower,
    alt: 'coalPower',
    title: 'Programming a micro:bit to fetch data on the current level of coal-powered generation in the UK',
    message: 'As well as the live school electricity usage, and set the light to change colour based on this data.',
  },
  {
    image: education,
    alt: 'education',
    title: 'Crafting their own in class digital projects',
    message: 'To show how energy is used in their school.',
  },
];

const EducationalBenefits = (props) => {
  const { classes } = props;

  return (
    <Grid container direction="column" alignItems="center" className={classes.greyBackground}>
      <Grid item xs={12} md={10} container justify="flex-end" className={classes.microbitBlock}>
        <Grid item container xs={12} md={6} className={classes.benefitsBlock}>
          <h1 className={classes.title}>Educational benefits for schools</h1>
          <ul className={classes.messageBlockList}>
            {PRIMARY_LIST_CONTENT.map(message => (
              <li key={`education-${message.slice(5)}`} className={classes.messageBlockItem}>{message}</li>
            ))}
          </ul>
          <ul className={classes.benefitsBlockList}>
            {SECONDARY_LIST_CONTENT.map(content => (
              <li key={content.alt} className={classes.benefitsBlockItem}>
                <Grid container alignItems="flex-start">
                  <Grid container justify="center" className={classes.benefitsBlockItemLogoWrapper}>
                    <img src={content.image} alt={content.alt} className={classes.benefitsBlockItemLogo} />
                  </Grid>
                  <p className={classes.benefitsBlockItemMessage}>
                    <span className={classes.benefitsBlockItemTitle}>{content.title}</span><br />
                    {content.message}
                  </p>
                </Grid>
              </li>
            ))}
          </ul>
        </Grid>
        <Grid item container xs={12} md={6} direction="column" justify="center">
          <div className={classes.microbitImageWrapper}>
            <img src={microbit} alt="microbit" className={classes.microbitImage} />
            <p className={classes.imageCredit}>Image credit: Gareth Halfacree</p>
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
};

EducationalBenefits.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EducationalBenefits);
