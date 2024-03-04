import { withStyles } from '@material-ui/core/styles';
import CarbonIntensity from './CarbonIntensityMain';

import mainBg from '../../../../images/carbon-intensity-big-bg.png';
import energyCloud from '../../../../images/carbon-intensity-cloud.svg';

const styles = ({
  root: {
    backgroundImage: `url(${mainBg})`,
    backgroundRepeat: 'no-repeat',
    paddingTop: 20,
    display: 'block',
    width: '100%',
    margin: 0,
  },
  energyBlock: {
    display: 'inline-block',
    width: '32%',
  },
  intensity: {
    display: 'inline-block',
    width: '32%',
    textAlign: 'center',
    position: 'relative',
    paddingTop: 90,
  },
  textBlock: {
    backgroundImage: `url(${energyCloud})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '100% 100%',
    marginTop: 15,
    display: 'block',
    minHeight: 150,
    padding: '40px 0',
  },
  carbonIntensityHeading: {
    fontSize: 28,
    color: 'rgb(0, 188, 212)',
    marginTop: 135,
  },
  carbonIntensityText: {
    fontSize: 25,
    color: 'rgb(255, 187, 60)',
    width: 300,
    textAlign: 'center',
    margin: '0 auto',
  },
  dirtyEnergyImg: {
    maxWidth: 300,
  },
  clearEnergyImg: {
    maxWidth: 300,
  },
  energyHeading: {
    marginTop: 10,
  },
});

export default withStyles(styles)(CarbonIntensity);
