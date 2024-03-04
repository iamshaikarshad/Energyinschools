import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import queryString from 'query-string';

import Variables from './Variables';

import * as schoolsActions from '../../actions/schoolsActions';
import * as variablesActions from '../../actions/variablesActions';
import * as historicalDataActions from '../../actions/historicalDataActions';

import VARIABLES_PAGE_QUERY_PARAMS from './constants';

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

class VariablesPage extends React.Component {
  constructor(props) {
    super(props);

    const { location } = this.props;

    let selectedTab = 0;

    const queryParams = location.search ? queryString.parse(location.search) : {};

    if (VARIABLES_PAGE_QUERY_PARAMS.showHistoricalChartForDataset in queryParams) {
      selectedTab = 1;
    }

    this.state = {
      selectedTab, // handle redirect to page
    };
  }

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getAllSchools(true);
    actions.getSchoolInformation(user.location_id);
    actions.getVariables();
    actions.getHistoricalData();
  }

  handleTabChange = (event, selectedTab) => {
    this.setState({ selectedTab });
  };

  render() {
    const { classes, variables, historicalData } = this.props;
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
              label={<span>Data - single reading ({variables ? variables.data.length : 0})</span>}
            />
            <Tab
              classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
              label={<span>Historical Data ({historicalData ? historicalData.data.length : 0})</span>}
            />
          </Tabs>
        </Paper>

        <div>
          {selectedTab === 0 && <Variables mode="variables" />}
          {selectedTab === 1 && <Variables mode="historicalData" />}
        </div>
      </div>
    );
  }
}

VariablesPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  variables: PropTypes.object.isRequired,
  historicalData: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired, // routing
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...variablesActions,
      ...schoolsActions,
      ...historicalDataActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    user: state.users.currentUser,
    variables: state.variables,
    historicalData: state.historicalData,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(VariablesPage);
