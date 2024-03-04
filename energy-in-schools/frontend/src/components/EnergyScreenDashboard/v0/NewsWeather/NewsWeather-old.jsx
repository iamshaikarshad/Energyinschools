import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ForecastWeather from '../../common/NewsWeather/ForecastWeather';
import CurrentWeather from '../../common/NewsWeather/CurrentWeather';
import News from '../../common/NewsWeather/News';

import weatherHeaderImage from '../../../../images/weather_icon.svg';
import newsHeaderImage from '../../../../images/news_icon.svg';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    backgroundColor: 'rgb(240, 191, 80)',
  },
  newsContainer: {
    background: 'rgb(0, 188, 212)',
  },
  blockHeadline: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    padding: '20px 0',
    color: 'rgb(255, 255, 255)',
    fontSize: 30,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 47,
    },
  },
  headerImage: {
    height: '47px',
    marginRight: '10px',
  },
  forecastWeatherBlock: {
    marginTop: 32,
  },
  forecastWrapper: {
    backgroundColor: 'rgb(255, 217, 87)',
    backgroundImage: 'linear-gradient(to left, rgba(255, 217, 87, 0.5), rgb(255, 158, 0, 0.9))',
    marginBottom: 10,
  },
};

const NewsWeatherOld = ({
  classes, currentWeather, forecastWeather, news,
}) => (
  <Grid container className={classes.root} wrap="nowrap">
    <Grid container direction="column" alignItems="center" justify="flex-start" wrap="nowrap" className={classes.weatherContainer}>
      <Grid alignItems="center" justify="center" container direction="row">
        <img alt="Weather" src={weatherHeaderImage} className={classes.headerImage} />
        <Typography align="center" className={classes.blockHeadline}>
          Weather
        </Typography>
      </Grid>
      <Grid container direction="column" wrap="nowrap">
        <Grid item>
          <CurrentWeather currentWeather={currentWeather} />
        </Grid>
        <Grid item className={classes.forecastWeatherBlock}>
          {
            forecastWeather.weathers.slice(0, 3).map((weather, index) => (
              <div key={weather.weather_at} className={classes.forecastWrapper}>
                <ForecastWeather
                  code={weather.code}
                  temperature={weather.temperature.average}
                  windSpeed={weather.wind && weather.wind.speed}
                  weatherAt={weather.weather_at}
                  status={weather.status}
                  indexNumber={index}
                />
              </div>
            ))
          }
        </Grid>
      </Grid>
    </Grid>
    <Grid container direction="column" alignItems="center" justify="flex-start" className={classes.newsContainer} wrap="nowrap">
      <Grid alignItems="center" justify="center" container direction="row">
        <img alt="News" src={newsHeaderImage} className={classes.headerImage} />
        <Typography className={classes.blockHeadline}>
          News
        </Typography>
      </Grid>
      <Grid container direction="column" wrap="nowrap">
        {
          news.map(article => (
            <Grid key={article.published_at}>
              <News
                title={article.title}
                description={article.description}
                urlToImage={article.url_to_image}
                publishedAt={article.published_at}
              />
            </Grid>
          ))
        }
      </Grid>
    </Grid>
  </Grid>
);

NewsWeatherOld.propTypes = {
  classes: PropTypes.object.isRequired,
  currentWeather: PropTypes.object.isRequired,
  forecastWeather: PropTypes.object.isRequired,
  news: PropTypes.array.isRequired,
};


export default compose(withStyles(styles))(NewsWeatherOld);
