import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty, isEqual, isNil } from 'lodash';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
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
    fontSize: 32,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    color: 'rgb(255, 255, 255)',
    maxWidth: '90%',
  },
};

class MessagesSlider extends React.Component {
  state = {
    currentMessageIndex: 0,
    slideVisible: true,
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

  onSlideExited = () => {
    const { previewMessages } = this.props;
    const { currentMessageIndex } = this.state;

    const indexBoundary = !isEmpty(previewMessages) ? previewMessages.length : 1;

    this.setState({
      currentMessageIndex: (currentMessageIndex + 1) % indexBoundary,
      slideVisible: true,
    });
  }

  setMessageChangeInterval = () => {
    const { previewMessages, interval } = this.props;
    if (!isNil(this.messageChangeInterval)) {
      this.clearMessageChangeInterval();
    }
    if (!isEmpty(previewMessages) && previewMessages.length > 1) {
      this.messageChangeInterval = setInterval(() => {
        this.setState({
          slideVisible: false,
        });
      }, interval);
    }
  }

  render() {
    const { classes, previewMessages } = this.props;
    const { currentMessageIndex, slideVisible } = this.state;
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
          <Slide
            ref={(slide) => {
              this.slide = slide;
            }}
            direction="left"
            timeout={1000}
            in={slideVisible}
            onExited={this.onSlideExited}
            exit={false}
            mountOnEnter
            unmountOnExit
          >
            <Typography className={classes.messageBlock} noWrap>
              {previewMessages[currentMessageIndex]}
            </Typography>
          </Slide>
        </Grid>
      </Grid>
    );
  }
}

MessagesSlider.propTypes = {
  classes: PropTypes.object.isRequired,
  previewMessages: PropTypes.array.isRequired,
  interval: PropTypes.number,
};

MessagesSlider.defaultProps = {
  interval: 10000,
};

export default withStyles(styles)(MessagesSlider);
