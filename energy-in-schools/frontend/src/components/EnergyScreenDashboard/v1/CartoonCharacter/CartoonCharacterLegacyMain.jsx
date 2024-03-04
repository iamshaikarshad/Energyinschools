import { withStyles } from '@material-ui/core/styles';
import CartoonCharacter from './CartoonCharacterMain';

const styles = ({
  root: {
    backgroundSize: '100% auto',
    backgroundPosition: 'right top',
    padding: '0 25px',
  },
  characterRoot: {
    display: 'block',
  },
  moodContainer: {
    padding: '20px 0 0 0',
  },
  singlePerson: {
    display: 'block',
  },
  personName: {
    display: 'block',
    position: 'relative',
    left: 85,
  },
  person: {
    top: 20,
    zIndex: 100,
    height: 200,
    left: 80,
  },
  descriptionContainer: {
    width: 285,
    backgroundSize: '100%',
    position: 'relative',
    padding: 35,
    textAlign: 'center',
    top: -30,
  },
  title: {
    fontSize: 23,
  },
  noTitle: {
    fontSize: 41,
  },
  description: {
    fontSize: 35,
  },
  withoutCharacterContainer: {
    display: 'block',
  },
  noNameImage: {
    top: 0,
    left: 65,
    marginBottom: 202,
  },
});

export default withStyles(styles)(CartoonCharacter);
