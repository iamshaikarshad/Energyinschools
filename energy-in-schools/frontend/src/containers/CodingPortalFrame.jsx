import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';

import { BLOCK_EDITOR_URL } from '../constants/config';
import { CODING_EXAMPLES_LINK_MAP } from '../constants/routing';

const styles = {
  iframeStyleVisible: {
    width: '100%',
    border: '0',
    position: 'static',
    height: 'calc(100vh - 166px)',
    '@media (max-width: 786px)': {
      height: 'calc(100vh - 90.5px)',
    },
  },
  iframeInvisible: {
    width: '100%',
    border: '0',
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
  },
};

class CodingPortalFrame extends React.Component {
  state = {
    isLoaded: false,
    reloadOfIframe: 0,
  };

  render() {
    const {
      classes, visible, location,
    } = this.props;
    const { isLoaded, reloadOfIframe } = this.state;

    const tutorialLink = location.slice(-1) === '/' ? location.slice(8, -1) : location.slice(8);
    const editorUrl = tutorialLink in CODING_EXAMPLES_LINK_MAP
      ? `${BLOCK_EDITOR_URL}#pub:${CODING_EXAMPLES_LINK_MAP[tutorialLink]};nosandbox=1`
      : `${BLOCK_EDITOR_URL}#nosandbox=1`;

    const load = () => { this.setState({ isLoaded: true }); };
    const reload = () => {
      this.setState({ isLoaded: false, reloadOfIframe: reloadOfIframe + 1 });
    };

    return (
      <div className={visible ? classes.iframeStyleVisible : classes.iframeInvisible}>
        { !location.startsWith('/energy-dashboard')
          && (
          <iframe
            id="mainframe"
            key={reloadOfIframe}
            title="CodingPortal"
            ref={(f) => { this.iframe = f; }}
            src={editorUrl}
            frameBorder="0"
            onLoad={() => {
              if (isLoaded) {
                reload();
              } else {
                load();
              }
            }}
            width="100%"
            height="100%"
          />
          )
        }
      </div>
    );
  }
}

CodingPortalFrame.propTypes = {
  classes: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  location: PropTypes.string.isRequired,
};

export default compose(
  withStyles(styles),
)(CodingPortalFrame);
