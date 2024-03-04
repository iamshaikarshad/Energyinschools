import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';

import { connect } from 'react-redux';

import { isNil } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import RefreshIcon from '@material-ui/icons/Refresh';

import { withStyles } from '@material-ui/core/styles';

import { getUpdatedSmartAppStatus, updateSchoolSmartAppStatus } from '../../../actions/schoolsMonitoringActions';

import { showMessageSnackbar } from '../../../actions/dialogActions';

import { SMART_APP_CONNECTION_STATUS, STATUS_COLOR, formatTime } from './constants';

const styles = theme => ({
  root: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  title: {
    width: '100%',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: 21,
    textAlign: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  infoDetailBlock: {
    justifyContent: 'center',
    padding: '8px 16px',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    '&:last-child': {
      borderRight: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      '&:nth-child(2n)': {
        borderRight: 'none',
      },
    },
    [theme.breakpoints.down('xs')]: {
      borderRight: 'none',
      padding: 8,
    },
  },
  label: {
    fontSize: 16,
    lineHeight: 'normal',
  },
  value: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 'normal',
    textAlign: 'center',
  },
  button: {
    fontSize: 14,
    textTransform: 'none',
    backgroundColor: 'rgb(0, 188, 212)',
    '&:hover': {
      backgroundColor: 'rgb(0, 188, 212)',
    },
  },
  refreshIcon: {
    marginRight: 9,
    width: 16,
  },
  noData: {
    fontSize: 18,
    padding: 8,
  },
});

class SmartThingsAppStatusCard extends PureComponent {
  getUpdatedStatus = (appId) => {
    const { actions, schoolId } = this.props;
    actions.getUpdatedSmartAppStatus(appId)
      .then((res) => {
        if (res.success) {
          actions.updateSchoolSmartAppStatus(schoolId, res.data);
        } else {
          actions.showMessageSnackbar('Failed to update app status!', 5000);
        }
      });
  }

  render() {
    const { classes, data } = this.props;

    const {
      status, refresh_token_updated_at: updatedAt, app_id: appId,
    } = data;

    const appAvailable = !isNil(appId);

    const statusColor = status === SMART_APP_CONNECTION_STATUS.connected ? STATUS_COLOR.success : STATUS_COLOR.alert;

    return (
      <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
        <Grid item xs={12} container justify="center">
          <Typography className={classes.title}>
            SmartThings Application
          </Typography>
        </Grid>
        <Grid item xs={12} container>
          {appAvailable ? (
            <Fragment>
              <Grid item container md={4} className={classes.infoDetailBlock}>
                <Grid item container xs={4} alignItems="center">
                  <Typography className={classes.label}>
                    Status
                  </Typography>
                </Grid>
                <Grid item container xs={8} alignItems="center" justify="flex-end">
                  <Typography className={classes.value} style={{ color: statusColor }}>
                    {status}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container md={4} className={classes.infoDetailBlock}>
                <Grid item container xs={4} alignItems="center">
                  <Typography className={classes.label}>
                    Updated at
                  </Typography>
                </Grid>
                <Grid item container xs={8} alignItems="center" justify="flex-end">
                  <Typography className={classes.value}>
                    {formatTime(updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container md={4} className={classes.infoDetailBlock}>
                <Button
                  color="primary"
                  disabled={!appAvailable}
                  className={classes.button}
                  variant="contained"
                  onClick={() => { this.getUpdatedStatus(appId); }}
                >
                  <RefreshIcon className={classes.refreshIcon} />
                  Refresh info
                </Button>
              </Grid>
            </Fragment>
          ) : (
            <Grid item container xs={12} justify="center" alignItems="center">
              <Typography className={classes.noData} style={{ color: STATUS_COLOR.alert }}>
                No connected smart app!
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  }
}

SmartThingsAppStatusCard.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  data: PropTypes.shape({
    app_id: PropTypes.number,
    status: PropTypes.string.isRequired,
    refresh_token_updated_at: PropTypes.string,
  }).isRequired,
  schoolId: PropTypes.number.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getUpdatedSmartAppStatus,
      updateSchoolSmartAppStatus,
      showMessageSnackbar,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(SmartThingsAppStatusCard);
