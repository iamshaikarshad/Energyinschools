import { withStyles } from '@material-ui/core';
import CashbackPreview from './CashbackPreview';

const styles = {
  root: {
    height: '100%',
    position: 'relative',
    display: 'block',
    paddingTop: 50,
  },
  imgBlock: {
    padding: '0 20px 30px 30px',
    width: '40%',
    float: 'left',
    position: 'relative',
    top: -20,
  },
  textBlock: {
    width: '57%',
    float: 'right',
    height: 'auto',
  },
  goalLabel: {
    fontSize: 30,
  },
  goalBlock: {
    fontSize: 30,
  },
};

export default withStyles(styles)(CashbackPreview);
