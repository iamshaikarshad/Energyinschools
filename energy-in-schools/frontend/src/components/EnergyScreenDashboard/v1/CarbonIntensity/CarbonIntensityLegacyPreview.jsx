import { withStyles } from '@material-ui/core/styles';
import CarbonIntensityPreview from './CarbonIntensityPreview';

import mainBgImg from '../../../../images/carbonIntensity-small-bg.svg';

const styles = {
  root: {
    backgroundColor: 'rgb(249, 188, 60)',
    backgroundImage: `url(${mainBgImg})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '100%',
  },
  carbonIntensityHeading: {
    fontSize: 25,
  },
  carbonIntensityValue: {
    fontSize: 30,
  },
  flowerImg: {
    maxWidth: 80,
    top: -60,
  },
};

export default withStyles(styles)(CarbonIntensityPreview);
