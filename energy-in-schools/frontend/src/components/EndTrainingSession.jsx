import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import * as userActions from '../actions/userActions';
import * as dialogActions from '../actions/dialogActions';
import * as authActions from '../actions/authActions';

import bg from '../images/lesson_arts/session_1.svg';

const jwtDecode = require('jwt-decode');

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    padding: '25px 15px',
    position: 'relative',
    '&::after': {
      content: '""',
      backgroundImage: `url(${bg})`,
      opacity: 0.1,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      position: 'absolute',
      zIndex: 0,
    },
  },
  headerRoot: {
    height: 185,
    padding: '10px 140px',
    borderBottom: '1px solid #e8e8e8',
  },
  headerLogo: {
    width: 85,
    height: 30,
    borderRadius: 0,
  },
  cardRoot: {
    alignSelf: 'center',
    position: 'relative',
    zIndex: 10,
  },
  cardHeaderRoot: {
    backgroundColor: theme.palette.primary.main,
    textAlign: 'center',
    height: 70,
  },
  cardHeaderTitle: {
    color: theme.palette.primary.contrastText,
    fontSize: 21,
    fontWeight: 500,
  },
  cardHeaderSubheader: {
    color: '#555',
    fontSize: 18,
    fontWeight: 'normal',
  },
  messageIcon: {
    color: '#00bcd4',
    fontSize: 48,
    verticalAlign: 'middle',
  },
  adviceContainer: {
    backgroundColor: 'rgba(0, 188, 212, 0.05)',
    width: '100%',
    borderRadius: 6,
    textAlign: 'center',
    padding: '15px 0',
    marginTop: 15,
  },
  adviceTitle: {
    color: theme.palette.primary.main,
    fontSize: 18,
  },

  button: {
    marginTop: 30,
    marginRight: 10,
    marginLeft: 10,
  },
  registrationSchoolRoot: {
    marginTop: 70,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
  },
  registrationSchoolButton: {
    marginTop: 20,
    color: theme.palette.common.white,
  },
});

class EndTrainingSession extends React.Component {
  onNavigate = path => () => {
    const { actions } = this.props;
    actions.push(path);
  };

  handleError = () => {
    const { actions } = this.props;
    this.onNavigate('/')();
    actions.showMessageSnackbar('Invalid route parameters', 7000);
  };

  endTrainingPeriod = () => {
    const { actions, location } = this.props;
    try {
      const token = queryString.parse(location.search).token;
      const requestId = jwtDecode(token).registration_request_id;
      actions.sendEndTrainingSession(requestId, token)
        .then(() => {
          actions.showMessageSnackbar('Training period ended');
        })
        .catch(() => {
          this.handleError();
        });
      this.onNavigate('/')();
    } catch (err) {
      this.handleError();
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container className={classes.root} alignContent="flex-start">

        <Grid item container justify="center">
          <Grid item xs={12} sm={10} container justify="center">
            <Card className={classes.cardRoot}>
              <CardHeader
                title="Do you really want to end training session?"
                classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderTitle }}
              />
              <CardContent>
                <Grid container justify="center">
                  <Button
                    onClick={this.endTrainingPeriod}
                    color="primary"
                    variant="contained"
                    className={classes.button}
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={this.onNavigate('/')}
                    color="primary"
                    variant="contained"
                    className={classes.button}
                  >
                    No
                  </Button>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

EndTrainingSession.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...userActions,
      ...dialogActions,
      push,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(EndTrainingSession);
