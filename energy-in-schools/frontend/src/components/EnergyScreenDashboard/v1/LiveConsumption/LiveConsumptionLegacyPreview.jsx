import { withStyles } from '@material-ui/core/styles';
import LiveConsumptionPreview from './LiveConsumptionPreview';

const styles = ({
  root: {
    height: '100%',
    backgroundColor: 'rgb(62, 188, 212)',
  },
  headline: {
    fontSize: 25,
  },
});

export default withStyles(styles)(LiveConsumptionPreview);
