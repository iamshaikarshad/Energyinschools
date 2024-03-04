import { withStyles } from '@material-ui/core/styles';
import CurrentWeatherPreview from './CurrentWeatherPreview';

const styles = ({
  withWeatherData: {
    backgroundColor: 'rgb(249, 188, 60)',
    backgroundPosition: 'center',
    backgroundSize: '100% 100%',
  },
  headline: {
    fontSize: 25,
  },
  temp: {
    fontSize: 30,
  },
  iconContainer: {
    display: 'block',
    position: 'relative',
    top: 30,
    textAlign: 'center',
  },
  noWeatherData: {
    height: '100%',
  },
  icon: {
    fontSize: 90,
  },
});

export default withStyles(styles)(CurrentWeatherPreview);
