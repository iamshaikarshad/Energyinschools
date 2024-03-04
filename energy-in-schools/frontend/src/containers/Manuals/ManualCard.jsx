import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'redux';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';

import ChooseIcon from '@material-ui/icons/ChevronRight';

import TextTruncate from 'react-text-truncate';
import defaultManualAvatar from '../../images/manual.svg';

const styles = theme => ({

  card: {
    width: 250,
    cursor: 'default',
  },

  mediaVideo: {
    width: '100%',
    objectFit: 'fill',
    height: 300,
    justifyContent: 'center',
    cursor: 'auto',
    '&:focus': {
      outline: 'none',
    },
  },

  mediaImage: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
  },

  titleContainer: {
    height: 80,
    borderTop: '1px solid rgb(0, 0, 0, 0.2)',
  },

  manualTitle: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'Roboto, Helvetica',
    fontWeight: 500,
    justifyContent: 'center',
    color: 'rgba(0, 188, 212)',
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 0.1)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  chooseIcon: {
    fontSize: 28,
    marginBottom: 2,
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
    },
  },
});

class ManualCard extends React.Component {
  state = {
    showVideoComponent: true,
  };

  render() {
    const {
      classes, manualTitle, manualAvatarImage, manualAvatarVideo, onDetailClick,
    } = this.props;

    const { showVideoComponent } = this.state;

    return (
      <Card className={classes.card}>
        { showVideoComponent && manualAvatarVideo ? (
          <CardMedia
            component="video"
            controls
            alt="Manual"
            preload="none"
            poster={manualAvatarImage}
            className={classes.mediaVideo}
            src={manualAvatarVideo}
            title="Manual"
            onError={() => { this.setState({ showVideoComponent: false }); }}
          />
        ) : (
          <CardMedia
            component="img"
            alt="Manual"
            className={classes.mediaImage}
            src={manualAvatarImage || defaultManualAvatar}
            title="Manual"
            onError={(e) => { e.target.src = defaultManualAvatar; }}
          />
        )}
        <CardActions disableSpacing classes={{ root: classes.titleContainer }}>
          <Button className={classes.manualTitle} onClick={onDetailClick}>
            <TextTruncate line={2} text={manualTitle} />
            <ChooseIcon className={classes.chooseIcon} />
          </Button>
        </CardActions>
      </Card>
    );
  }
}

ManualCard.propTypes = {
  classes: PropTypes.object.isRequired,
  manualTitle: PropTypes.string.isRequired,
  manualAvatarImage: PropTypes.string,
  manualAvatarVideo: PropTypes.string,
  onDetailClick: PropTypes.func.isRequired,
};

ManualCard.defaultProps = {
  manualAvatarImage: defaultManualAvatar,
  manualAvatarVideo: '',
};

export default compose(
  withStyles(styles),
)(ManualCard);
