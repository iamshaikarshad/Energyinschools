import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { MAX_NEWS_SYMBOLS_PREVIEW } from '../../common/EnergyFacts/constants';
import truncateText from '../../../../utils/truncateText';

import noFactsBg from '../../../../images/small-facts-bg-no-facts.png';
import mainBgImg from '../../../../images/small-facts-bg.png';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    backgroundImage: `url(${mainBgImg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    padding: '24px 28px',
  },
  factInfo: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 1.75,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 35,
    },
  },
  noFactsContainer: {
    height: '100%',
    backgroundImage: `url(${noFactsBg})`,
    backgroundSize: 'cover',
  },
};

const EnergyFactsListingPreviewOld = ({ classes, fact }) => {
  if (fact.text) {
    return (
      <Grid container direction="row" justify="flex-start" className={classes.root}>
        <Typography gutterBottom className={classes.factInfo}>
          {truncateText(fact.text, MAX_NEWS_SYMBOLS_PREVIEW)}
        </Typography>
      </Grid>
    );
  }
  return <Grid container direction="row" justify="flex-start" className={classes.noFactsContainer} />;
};

EnergyFactsListingPreviewOld.propTypes = {
  classes: PropTypes.object.isRequired,
  fact: PropTypes.object,
};

EnergyFactsListingPreviewOld.defaultProps = {
  fact: { text: '' },
};

export default compose(withStyles(styles))(EnergyFactsListingPreviewOld);
