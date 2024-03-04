import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import RootRef from '@material-ui/core/RootRef';
import Grow from '@material-ui/core/Grow';

import { withStyles } from '@material-ui/core/styles';

import { STATUS_COLOR } from './constants';

const styles = theme => ({
  root: {
    width: 72,
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    width: '100%',
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 11,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    },
  },
  popover: {
    borderRadius: 10,
    pointerEvents: 'none',
    marginTop: 4,
    zIndex: 1000,
    backgroundColor: 'rgb(37, 37, 37)',
    padding: '8px 10px',
    height: 'auto',
    maxWidth: 180,
    opacity: 1,
  },
  statusIndicator: {
    width: 15,
    height: 15,
    borderRadius: '50%',
  },
  statusInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 1)',
    textAlign: 'center',
  },
});

class MetricStatus extends PureComponent {
  state = {
    popoverOpen: false,
  };

  rootElemRef = createRef();

  render() {
    const {
      classes, title, statusColor, statusInfo, statusId,
    } = this.props;
    const { popoverOpen } = this.state;

    return (
      <RootRef rootRef={this.rootElemRef}>
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          justify="center"
          className={classes.root}
          aria-owns={popoverOpen ? statusId : undefined}
          aria-haspopup="true"
          onMouseEnter={(e) => {
            e.stopPropagation();
            this.setState({ popoverOpen: true });
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            this.setState({ popoverOpen: false });
          }}
        >
          <Typography component="div" className={classes.title} noWrap>
            {title}
          </Typography>
          <div
            className={classes.statusIndicator}
            style={{ backgroundColor: statusColor }}
          />
          <Popper
            id={statusId}
            className={classes.popover}
            open={popoverOpen && Boolean(statusInfo)}
            anchorEl={this.rootElemRef.current}
            placement="bottom"
            transition
          >
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                timeout={{
                  appear: 350,
                  enter: 250,
                  exit: 0,
                }}
              >
                <Typography className={classes.statusInfoText}>{statusInfo}</Typography>
              </Grow>
            )}
          </Popper>
        </Grid>
      </RootRef>
    );
  }
}

MetricStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  statusColor: PropTypes.string,
  statusInfo: PropTypes.node,
  statusId: PropTypes.string.isRequired,
};

MetricStatus.defaultProps = {
  statusColor: STATUS_COLOR.unknown,
  statusInfo: '',
};

export default compose(withStyles(styles))(MetricStatus);
