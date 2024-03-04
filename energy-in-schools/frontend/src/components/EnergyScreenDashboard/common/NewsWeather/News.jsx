import React from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { MAX_NEWS_SYMBOLS } from './constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';
import truncateText from '../../../../utils/truncateText';

import defaultNewsBg from '../../../../images/default_news_bg.svg';

const styles = theme => ({
  card: {
    borderWidth: 0,
    boxShadow: 'none',
    marginBottom: theme.spacing(4),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: '3px 10px',
    borderRadius: 0,
  },
  media: {
    borderRadius: '50%',
    height: 150,
    width: 150,
    [mlSreenSizeMediaQuery.up]: {
      height: 200,
      width: 200,
    },
  },
  cardContentContainer: {
    padding: '13px 0 0',
  },
  newsCardHeader: {
    padding: '0',
  },
  subheader: {
    opacity: 0.65,
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: 1.17,
    color: 'rgb(255, 255, 255)',
    marginTop: '10px',
  },
  title: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 22,
    fontWeight: 900,
    color: 'rgb(255, 255, 255)',
    padding: '5px 0 0',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 27,
    },
  },
  newsDescription: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.36,
    color: 'rgb(85, 85, 85)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 20,
    },
  },
});

const News = ({
  classes, title, description, urlToImage, publishedAt,
}) => (
  <Card className={classes.card}>
    <Grid container className={classes.articleContainer}>
      <Grid container item xs={4} justify="center" alignItems="center">
        <CardMedia
          className={classes.media}
          image={urlToImage || defaultNewsBg}
          title={title}
        />
      </Grid>
      <Grid container direction="column" item xs={8} justify="center">
        <CardHeader
          classes={{
            root: classes.newsCardHeader,
            title: classes.title,
            subheader: classes.subheader,
          }}
          title={title}
          subheader={moment(publishedAt).format('D MMM, YYYY h:mm A')}
        />
        <CardContent
          classes={{
            root: classes.cardContentContainer,
          }}
        >
          <Typography className={classes.newsDescription}>
            {truncateText(description, MAX_NEWS_SYMBOLS)}
          </Typography>
        </CardContent>
      </Grid>
    </Grid>
  </Card>
);

News.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  urlToImage: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
};

export default withStyles(styles)(News);
