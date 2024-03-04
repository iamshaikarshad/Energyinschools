import { withStyles } from '@material-ui/core/styles';
import LiveConsumption from './LiveConsumptionMain';

const styles = ({
  root: {
    backgroundPositionX: 'left',
    backgroundPositionY: -75,
    backgroundSize: '100%',
  },
  gasBlock: {
    bottom: '15%',
  },
  liveConsumptionValue: {
    fontSize: 48,
  },
});

export default withStyles(styles)(LiveConsumption);
