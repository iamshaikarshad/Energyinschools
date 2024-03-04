import { withStyles } from '@material-ui/core/styles';
import CartoonCharacterPreview from './CartoonCharacterPreview';

const styles = {
  root: {
    backgroundSize: '100%',
    height: '100%',
  },
  picture: {
    height: '200px',
  },
  title: {
    fontSize: 25,
  },
};

export default withStyles(styles)(CartoonCharacterPreview);
