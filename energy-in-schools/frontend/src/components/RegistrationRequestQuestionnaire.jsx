import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import QuestionnairePage from './SchoolRegistration/QuestionnairePage';

import * as schoolsActions from '../actions/schoolsActions';
import * as dialogActions from '../actions/dialogActions';

const jwtDecode = require('jwt-decode');

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    padding: '15px',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
});

class RegistrationRequestQuestionnaire extends React.Component {
  state = {
    showQuestionnaire: true,
    requestId: null,
    token: null,
  };

  componentDidMount() {
    const { location } = this.props;
    try {
      const token = queryString.parse(location.search).token;
      const requestId = jwtDecode(token).registration_request_id;
      this.setState({
        showQuestionnaire: true,
        token,
        requestId,
      });
    } catch (err) {
      this.handleError();
    }
  }

  onNavigate = path => () => {
    const { actions } = this.props;
    actions.push(path);
  };

  onSubmit = (data) => {
    const { actions } = this.props;
    const { token, requestId } = this.state;
    actions.postQuestionnaireData(requestId, data, token)
      .then(() => {
        this.onNavigate('/')();
      });
  };

  handleError = () => {
    const { actions } = this.props;
    this.onNavigate('/')();
    actions.showMessageSnackbar('Invalid route parameters', 7000);
  };

  render() {
    const { classes } = this.props;
    const { showQuestionnaire } = this.state;

    return (
      <Grid container className={classes.root} alignContent="flex-start">
        <Grid item xs={12} container justify="center">
          {
            showQuestionnaire && (
              <QuestionnairePage onSubmit={this.onSubmit} />
            )
          }
        </Grid>
      </Grid>
    );
  }
}

RegistrationRequestQuestionnaire.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...schoolsActions,
      push,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(RegistrationRequestQuestionnaire);
