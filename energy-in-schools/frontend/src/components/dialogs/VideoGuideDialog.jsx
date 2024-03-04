import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { withStyles } from '@material-ui/core/styles/index';
import VideoPlayer from '../VideoPlayer';
import { BLOB_STORAGE_URL } from '../../constants/config';

const styles = theme => ({
  closeButtonWrapper: {
    justifyContent: 'center',
    margin: 0,
  },
  playerContainer: {
    width: '60%',
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      width: '75%',
    },
  },
  playerWrapper: {
    overflowY: 'visible',
    '&:first-child': {
      padding: '8px 0 0',
    },
  },
});

const guideVideoUrl = `${BLOB_STORAGE_URL}/energy-in-schools-media/showcase/Energy Video Showcase.mp4`;

function VideoGuideDialog(props) {
  const { classes, isOpened, onClose } = props;

  return (
    <Dialog open={isOpened} onClose={onClose} classes={{ paper: classes.playerContainer }}>
      <DialogContent classes={{ root: classes.playerWrapper }}>
        <VideoPlayer url={guideVideoUrl} />
      </DialogContent>
      <DialogActions className={classes.closeButtonWrapper} disableActionSpacing>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

VideoGuideDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(VideoGuideDialog);
