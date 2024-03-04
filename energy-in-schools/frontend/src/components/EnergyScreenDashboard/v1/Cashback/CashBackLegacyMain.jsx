import { withStyles } from '@material-ui/core/styles';
import Cashback from './CashBackMain';

const styles = ({
  cashbackGoal: {
    position: 'absolute',
    top: -10,
  },
});

export default withStyles(styles)(Cashback);
