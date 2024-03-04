import { withStyles } from '@material-ui/core/styles';
import NewsWeather from './NewsWeatherMain';

const styles = {
  root: {
    width: '100%',
  },
  weatherContainer: {
    width: '50%',
  },
  newsContainer: {
    minHeight: 600,
    width: '50%',
    float: 'right',
  },
  blockHeadline: {
    padding: '5px 0',
  },
  headerImage: {
    height: 30,
  },
};

export default withStyles(styles)(NewsWeather);
