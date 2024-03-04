import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { MOOD_VALUE_PICTURE_MAPPING, MOOD_VALUE_TITLE_MAPPING_UNIVERSAL } from '../../common/CartoonCharacter/constants';
import mainBg from '../../../../images/cartoon_character_preview_bg.png';
import emptyPlaceholder from '../../../../images/polar_guys_preview.svg';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    backgroundImage: `url(${mainBg})`,
    backgroundSize: 'cover',
    height: '100%',
    padding: '24px 28px',
    overflow: 'hidden',
  },
  picture: {
    height: '190%',
    width: 'auto',
    position: 'relative',
  },
  title: {
    fontSize: 30,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.1,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  personTitle: {
    textTransform: 'capitalize',
  },
  status: {
    fontSize: 35,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.33,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 55,
    },
  },
  emptyPlaceholder: {
    height: '280px',
  },
};

const CartoonCharacterPreviewOld = ({ classes, mood }) => {
  let title,
    status,
    picture = emptyPlaceholder;
  const pickedType = Object.keys(mood)[0];

  if (pickedType) {
    title = pickedType;
    status = MOOD_VALUE_TITLE_MAPPING_UNIVERSAL[mood[pickedType]];
    picture = MOOD_VALUE_PICTURE_MAPPING[pickedType][mood[pickedType]][0];

    return (
      <Grid container direction="row" className={classes.root}>
        <Grid item xs={6} container direction="column" wrap="nowrap">
          <Typography className={classes.title}>
            <span className={classes.personTitle}>{title}</span> usage
          </Typography>
          <Typography className={classes.status}>
            {status}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <img src={picture} alt="text" className={classes.picture} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction="row" className={classes.root} justify="center" alignItems="flex-start">
      <img src={emptyPlaceholder} alt="empty" className={classes.emptyPlaceholder} />
    </Grid>
  );
};

CartoonCharacterPreviewOld.propTypes = {
  mood: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CartoonCharacterPreviewOld);
