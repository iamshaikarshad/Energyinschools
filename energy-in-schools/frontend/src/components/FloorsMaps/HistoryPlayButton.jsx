import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import { withStyles } from '@material-ui/core';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Button from '@material-ui/core/Button';

const styles = {
  iconRoot: {
    fontSize: 40,
  },
};

class HistoryPlayButton extends React.Component {
  state = {
    playing: false,
  };

  onButtonClick = () => {
    const { playing } = this.state;
    const { onClick } = this.props;
    this.setState(prevState => ({ playing: !prevState.playing }));
    onClick(!playing);
  };

  render() {
    const { playing } = this.state;
    const { classes, ...rest } = this.props;
    const iconProps = { classes: { root: classes.iconRoot } };
    return (
      <Button {...rest} variant="contained" onClick={this.onButtonClick}>
        {playing ? <Pause {...iconProps} /> : <PlayArrow {...iconProps} />}
      </Button>
    );
  }
}


HistoryPlayButton.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(HistoryPlayButton);
