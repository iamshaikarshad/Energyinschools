import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import ReactPlayer from 'react-player';

export const styles = () => ({
  root: {
    position: 'relative',
    paddingTop: '56.25%',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

function VideoPlayer(props) {
  const { classes, url } = props;

  return (
    <div className={classes.root}>
      <ReactPlayer
        className={classes.videoPlayer}
        url={url}
        width="100%"
        height="100%"
        controls
      />
    </div>
  );
}

VideoPlayer.propTypes = {
  classes: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};

export default compose(withStyles(styles))(VideoPlayer);
