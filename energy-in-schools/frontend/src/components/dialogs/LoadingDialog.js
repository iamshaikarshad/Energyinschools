import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
  overlay: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    zIndex: 10000,
    backgroundColor: '#000000',
    opacity: 0.6,
    top: 0,
    left: 0,
    overflow: 'auto',
  },
  indicatorContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
  },
};

const LoadingDialog = ({
  isOpened,
}) => (
  isOpened && (
    <div style={styles.overlay}>
      <div style={styles.indicatorContainer}>
        <CircularProgress color="secondary" size={2} thickness={4} style={{ height: '40px', width: '40px' }} />
      </div>
    </div>
  )
);

LoadingDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
};

export default LoadingDialog;
