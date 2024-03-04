import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import * as userActions from '../actions/userActions';
import * as dialogActions from '../actions/dialogActions';
import logo from '../images/logo.svg';
import bg from '../images/bg.png';
import tabletBg from '../images/tablet_bg.png';
import mailIcon from '../images/mail.svg';

const jwtDecode = require('jwt-decode');

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundSize: 'cover',
    marginTop: -64,
    backgroundImage: `url(${bg})`,
    position: 'absolute',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      backgroundImage: `url(${tabletBg})`,
    },
  },
  headerRoot: {
    height: 185,
    padding: '10px 140px',
    borderBottom: '1px solid #e8e8e8',
    marginBottom: 150,
  },
  headerLogo: {
    width: 85,
    height: 30,
    borderRadius: 0,
  },

  cardRoot: {
    width: 420,
  },
  cardHeaderRoot: {
    backgroundColor: theme.palette.primary.main,
    textAlign: 'center',
    height: 70,
  },
  cardHeaderTitle: {
    color: theme.palette.primary.contrastText,
    fontSize: 18,
    fontWeight: 500,
  },
  cardHeaderSubheader: {
    color: '#555',
    fontWeight: 'normal',
  },
  emailContainer: {
    backgroundColor: 'rgba(0,188,212, 0.15)',
    width: '100%',
    borderRadius: 6,
    textAlign: 'center',
    padding: '15px 0',
    marginTop: 15,
  },
  emailTitle: {
    color: theme.palette.primary.main,
    fontSize: 18,
  },

  button: {
    marginTop: 30,
    width: 150,
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

class LoginPage extends React.Component {
  state = {
    token: '',
    email: '',
  };

  componentWillMount() {
    const { actions, match } = this.props;
    const token = match.params.token;
    const email = jwtDecode(window.atob(token)).email;

    this.setState({ token, email });

    if (!email) {
      actions.push('/');
      actions.showMessageSnackbar('Invalid email in token');
    }
  }

  onConfirmClick = () => {
    const { actions } = this.props;
    const { token } = this.state;

    actions.setEmailToBlackList(token);
  };

  render() {
    const { classes } = this.props;
    const { email } = this.state;

    return (

      <Grid container className={classes.root} alignContent="flex-start">

        <Grid item container className={classes.headerRoot} alignItems="flex-end">
          <Avatar alt="Samsung School logo" src={logo} className={classes.headerLogo} />
        </Grid>

        <Grid container justify="center">
          <Grid item>
            <Card className={classes.cardRoot}>
              <CardHeader
                title="Do not send me emails anymore"
                classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderTitle }}
              />
              <CardContent>
                <Grid container>
                  <CardHeader
                    avatar={
                      <img src={mailIcon} alt="Email" style={{ width: 50 }} />
                    }
                    subheader="Are you sure you do not want to receive emails at this email address?"
                    classes={{ subheader: classes.cardHeaderSubheader }}
                  />
                </Grid>
                <Grid container>
                  <Typography variant="subtitle1" classes={{ root: classes.emailContainer, subheading: classes.emailTitle }}>
                    { email }
                  </Typography>
                </Grid>
                <Grid container justify="center">
                  <Button
                    onClick={this.onConfirmClick}
                    color="primary"
                    variant="contained"
                    className={classes.button}
                  >
                    Confirm
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

LoginPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      ...dialogActions,
      push,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(LoginPage);
