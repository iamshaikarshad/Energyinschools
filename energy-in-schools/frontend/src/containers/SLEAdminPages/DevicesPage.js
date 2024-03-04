import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SmartThingsDevices from '../SmartThingsDevices';
import Hubs from './Hubs';
import * as hubsActions from '../../actions/hubsActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as devicesActions from '../../actions/devicesActions';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
    boxShadow: 'none',
  },
  tabRoot: {
    width: 200,
    height: 65,
    padding: '15px 0px 0px',
    textTransform: 'none',
    letterSpacing: 'normal',
    fontSize: '0.8125rem',
    [theme.breakpoints.down('xs')]: {
      width: '50%',
    },
  },
  tabWrapper: {
    padding: '6px 12px 0px',
  },
  device: {
    padding: theme.spacing(2),
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

});

class DevicesPage extends React.Component {
  state = {
    selectedTab: 1,
  };

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    actions.getHubsList();
    actions.getDevicesList();
  }

  handleTabChange = (event, selectedTab) => {
    this.setState({ selectedTab });
  };

  render() {
    const { classes, hubs, devices } = this.props;
    const { selectedTab } = this.state;

    return (
      <div style={{ width: '100%' }}>
        <Paper className={classes.root}>
          <Tabs
            value={selectedTab}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab
              classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
              label={<span>Devices ({devices.data.length})</span>}
            />
            <Tab
              classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
              label={<span>Hubs ({hubs.data.length})</span>}
            />
          </Tabs>
        </Paper>

        <div>
          {selectedTab === 0 && <SmartThingsDevices />}
          {selectedTab === 1 && <Hubs />}
        </div>
      </div>
    );
  }
}

DevicesPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  hubs: PropTypes.object.isRequired,
  devices: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...hubsActions,
      ...schoolsActions,
      ...devicesActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    user: state.users.currentUser,
    hubs: state.hubs,
    devices: state.devices,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(DevicesPage);
