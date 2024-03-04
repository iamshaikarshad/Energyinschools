import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty, isEqual, isNil } from 'lodash';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    padding: '36px 72px',
    position: 'relative',
  },
  messageBlockWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
  },
  messageBlock: {
    fontSize: 24,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    color: 'rgb(255, 255, 255)',
    maxWidth: '90%',
  },
};

class MessagesSliderLegacy extends React.Component {
  state = {
    currentMessageIndex: 0,
  };

  messageChangeInterval = null;

  componentDidMount() {
    this.setMessageChangeInterval();
  }

  componentDidUpdate(prevProps) {
    const { previewMessages } = this.props;
    if (!isEqual(prevProps.previewMessages, previewMessages)) {
      this.setMessageChangeInterval();
    }
  }

  componentWillUnmount() {
    this.clearMessageChangeInterval();
  }

  clearMessageChangeInterval = () => {
    clearInterval(this.messageChangeInterval);
    this.messageChangeInterval = null;
  }

  setMessageChangeInterval = () => {
    const { previewMessages, interval } = this.props;
    if (!isNil(this.messageChangeInterval)) {
      this.clearMessageChangeInterval();
    }

    if (!isEmpty(previewMessages) && previewMessages.length > 1) {
      const indexBoundary = previewMessages.length;
      this.messageChangeInterval = setInterval(() => {
        this.setState(prevState => ({ currentMessageIndex: (prevState.currentMessageIndex + 1) % indexBoundary }));
      }, interval);
    }
  }

  render() {
    const { classes, previewMessages } = this.props;
    const { currentMessageIndex } = this.state;
    if (isEmpty(previewMessages)) return null;
    return (
      <Grid container className={classes.root}>
        <Grid
          item
          container
          className={classes.messageBlockWrapper}
          direction="column"
          justify="center"
          alignItems="center"
          wrap="nowrap"
        >
          <Typography className={classes.messageBlock} noWrap>
            {previewMessages[currentMessageIndex]}
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

MessagesSliderLegacy.propTypes = {
  classes: PropTypes.object.isRequired,
  previewMessages: PropTypes.array.isRequired,
  interval: PropTypes.number,
};

MessagesSliderLegacy.defaultProps = {
  interval: 10000,
};

export default withStyles(styles)(MessagesSliderLegacy);
