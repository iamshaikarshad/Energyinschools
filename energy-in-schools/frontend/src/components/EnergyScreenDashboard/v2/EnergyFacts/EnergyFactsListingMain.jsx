/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { shuffle } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';

import EnergyFactCard from '../../common/EnergyFacts/EnergyFactCard';
import truncateText from '../../../../utils/truncateText';

import { MAX_FACTS_ON_DASHBOARD } from '../../../../constants/config';
import { MAX_NEWS_SYMBOLS } from '../../common/EnergyFacts/constants';

import number1Img from '../../../../images/1.svg';
import number2Img from '../../../../images/2.svg';
import number3Img from '../../../../images/3.svg';
import thinkImgSrc from '../../../../images/omar_think.svg';
import headerImage from '../../../../images/lamp-for-facts.svg';
import defaultFactSrc from '../../../../images/no_facts_big.svg';
import backgroundImage from '../../../../images/cloud_bg.png';
import mainBgImg from '../../../../images/big-facts-without-cloud.png';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    backgroundImage: `url(${backgroundImage}), url(${mainBgImg})`,
    backgroundSize: '110% 120%',
    backgroundPosition: 'center 60%, center',
    height: '100%',
    padding: '2%',
    position: 'relative',
  },
  factsHeader: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 35,
    fontWeight: 700,
    color: 'rgba(243, 143, 49, 0.96)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 47,
    },
  },
  thinkImg: {
    position: 'absolute',
    bottom: '-5%',
    left: '10px',
    height: '30%',
    width: 'auto',
    overflow: 'visible',
  },
  defaultFact: {
    width: '60%',
    height: 'auto',
    maxHeight: '75%',
    overflow: 'visible',
  },
  headerImage: {
    marginRight: '15px',
    display: 'inline-block',
    width: 32,
    [theme.breakpoints.up('xl')]: {
      width: 42,
    },
  },
  factsList: {
    width: '65%',
    margin: '0 auto',
  },
});

class EnergyFactsListing extends React.PureComponent {
  render() {
    const { classes, data } = this.props;
    const factsToDisplay = shuffle(data).slice(0, MAX_FACTS_ON_DASHBOARD);
    const numbersImages = [number1Img, number2Img, number3Img];

    const factsComponents = factsToDisplay.map((fact, index) => (
      <EnergyFactCard
        key={fact.id}
        factText={truncateText(fact.text, MAX_NEWS_SYMBOLS)}
        indexNum={index + 1}
        indexNumImg={numbersImages[index]}
      />
    ));

    if (factsToDisplay.length) {
      return (
        <Grid container alignItems="center" justify="center" direction="column" className={classes.root} wrap="nowrap">
          <Grid container direction="row" justify="center" alignItems="center">
            <img alt="Tips" src={headerImage} className={classes.headerImage} />
            <Typography className={classes.factsHeader}>
              Energy Facts
            </Typography>
          </Grid>
          <Grid container direction="row" className={classes.listBlock}>
            <List className={classes.factsList}>
              {factsComponents}
            </List>
          </Grid>
          <img alt="Facts" src={thinkImgSrc} className={classes.thinkImg} />
        </Grid>
      );
    }
    return (
      <Grid container justify="center" alignItems="center" className={classes.root}>
        <Avatar alt="Interesting Fact" src={defaultFactSrc} className={classes.defaultFact} />
        <img alt="Facts" src={thinkImgSrc} className={classes.thinkImg} />
      </Grid>
    );
  }
}

EnergyFactsListing.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

export default compose(withStyles(styles))(EnergyFactsListing);
