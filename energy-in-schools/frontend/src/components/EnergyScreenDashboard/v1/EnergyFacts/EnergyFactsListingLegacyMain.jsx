import { withStyles } from '@material-ui/core/styles';
import EnergyFactsListing from './EnergyFactsListingMain';

const styles = ({
  root: {
    backgroundSize: '110%, 100%',
    backgroundPosition: 'center -160px, center',
    position: 'relative',
    display: 'block',
  },
  factsHeader: {
    color: 'rgb(243, 143, 49)',
  },
  thinkImg: {
    left: 10,
    width: '14%',
    display: 'block',
    top: 335,
    bottom: 'auto',
  },
  headerImage: {
    float: 'left',
  },
  factsList: {
    width: '65%',
  },
});

export default withStyles(styles)(EnergyFactsListing);
