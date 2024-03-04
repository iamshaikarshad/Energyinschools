import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import emptyPlaceholder from '../../../../images/polar_guys.svg';
import mainBg from '../../../../images/energy_impact_bg.png';

import {
  MOOD_NAME_AND_CLOUD_MAPPING,
  MOOD_VALUE_PICTURE_MAPPING,
  MOOD_VALUE_TITLE_MAPPING_UNIVERSAL,
} from '../../common/CartoonCharacter/constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    background: `url(${mainBg}) no-repeat`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
    height: '100%',
    padding: '15px 25px',
  },
  characterRoot: {
    display: 'flex',
  },
  moodContainer: {
    float: 'left',
    padding: 0,
    [mlSreenSizeMediaQuery.up]: {
      padding: 40,
    },
  },
  singlePerson: {
    display: 'flex',
  },
  personName: {
    boxSizing: 'inherit',
  },
  person: {
    position: 'relative',
    top: '40px',
    zIndex: '100',
    height: '25vh',
  },
  descriptionContainer: {
    width: '295px',
    height: '180px',
    backgroundSize: 'cover',
    position: 'relative',
  },
  title: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: '26px',
    fontWeight: 'bold',
    lineHeight: 1.35,
    color: 'rgb(255, 255, 255)',
  },
  personTitle: {
    textTransform: 'capitalize',
  },
  noTitle: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: '41px',
    fontWeight: 'bold',
    lineHeight: 1.15,
    color: 'rgb(255, 255, 255)',
  },
  description: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: '45px',
    fontWeight: 'bold',
    lineHeight: 1.44,
    color: 'rgb(255, 255, 255)',
  },
  icon: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '22%',
  },
  withoutCharacterContainer: {
    display: 'flex',
  },
  noNameImage: {
    position: 'relative',
    top: '-25vh',
  },
  noInformation: {
    height: '100%',
    marginLeft: '50%',
  },
};

const CartoonCharacter = ({ classes, energyMood }) => (
  <Grid container direction="row" className={classes.root}>
    {Object.keys(energyMood).length > 0 ? (
      <Grid container direction="row" alignItems="flex-end" className={classes.characterRoot}>
        {Object.keys(energyMood).map(type => (
          <Grid key={`${type}cartoon`} className={classes.moodContainer}>
            {energyMood[type] !== 0 ? (
              <Grid container direction="column" alignItems="center" className={classes.singlePerson}>
                <img src={MOOD_NAME_AND_CLOUD_MAPPING[type][0]} alt="name" className={classes.personName} />
                <img
                  src={MOOD_VALUE_PICTURE_MAPPING[type][energyMood[type]][0]}
                  alt="person"
                  className={classes.person}
                />
                <Grid
                  container
                  direction="column"
                  className={classes.descriptionContainer}
                  style={{ background: `url(${MOOD_NAME_AND_CLOUD_MAPPING[type][1]}) no-repeat 50%` }}
                  alignItems="center"
                  justify="center"
                >
                  <Typography key={`${type}title`} className={classes.title}>
                    <span className={classes.personTitle}>{type}</span> usage
                  </Typography>
                  <Typography className={classes.description}>
                    {MOOD_VALUE_TITLE_MAPPING_UNIVERSAL[energyMood[type]]}
                  </Typography>
                  <img
                    src={MOOD_VALUE_PICTURE_MAPPING[type][energyMood[type]][1]}
                    alt={type}
                    className={classes.icon}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container direction="column" alignItems="center" className={classes.withoutCharacterContainer}>
                <img src={MOOD_NAME_AND_CLOUD_MAPPING.noName[0]} alt="name" className={classes.noNameImage} />
                <Grid
                  container
                  direction="column"
                  className={classes.descriptionContainer}
                  style={{ background: `url(${MOOD_NAME_AND_CLOUD_MAPPING[type][1]}) no-repeat` }}
                  alignItems="center"
                  justify="center"
                >
                  <Typography className={classes.noTitle}>
                    {MOOD_VALUE_TITLE_MAPPING_UNIVERSAL[energyMood[type]] + type} <br /> usage
                  </Typography>
                  <img
                    src={MOOD_VALUE_PICTURE_MAPPING[type][energyMood[type]][0]}
                    alt={type}
                    className={classes.icon}
                  />
                </Grid>
              </Grid>
            )
            }
          </Grid>
        ))
        }
      </Grid>
    ) : (
      <Grid>
        <img src={emptyPlaceholder} alt="empty data" className={classes.noInformation} />
      </Grid>
    )
    }
  </Grid>
);

CartoonCharacter.propTypes = {
  energyMood: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CartoonCharacter);
