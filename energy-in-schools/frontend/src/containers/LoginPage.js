import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import moment from 'moment';

import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { push } from 'connected-react-router';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ForgetPasswordDialog from '../components/dialogs/ForgetPasswordDialog';
import AlertDialog from '../components/dialogs/AlertDialog';
import * as authActions from '../actions/authActions';
import * as dialogActions from '../actions/dialogActions';
import * as schoolsActions from '../actions/schoolsActions';
import * as userActions from '../actions/userActions';

import logo from '../images/logo.svg';
import bg from '../images/bg.png';
import tabletBg from '../images/tablet_bg.png';

import BrowserSupportStorageManager from '../utils/browserSupportStorageManager';

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundSize: 'cover',
    marginTop: -50,
    backgroundImage: `url(${bg})`,
    minHeight: '100vh', // need vh for IE compatibility
    [theme.breakpoints.down('sm')]: {
      backgroundImage: `url(${tabletBg})`,
    },
  },
  headerRoot: {
    height: 185,
    padding: '10px 140px',
    borderBottom: '1px solid #e8e8e8',
    [theme.breakpoints.only('sm')]: {
      height: 150,
      paddingLeft: 'calc(50% - 180px)',
      paddingRight: '20%',
      paddingTop: 10,
      paddingBottom: 10,
    },
    [theme.breakpoints.only('xs')]: {
      height: 116,
      padding: '10px 0 15px',
      display: 'flex',
      justifyContent: 'center',
    },
  },
  headerLogo: {
    width: 85,
    height: 30,
    borderRadius: 0,
  },
  logFormWrapper: {
    width: 360,
    paddingTop: 100,
    [theme.breakpoints.down('sm')]: {
      width: '80%',
      maxWidth: 360,
    },
  },
  visitLandingPage: {
    color: 'rgb(255, 255, 255)',
    fontFamily: 'Roboto',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 400,
    position: 'relative',
    top: -3,
    marginLeft: 100,
    [theme.breakpoints.only('xs')]: {
      marginLeft: 20,
    },
  },
  arrowIcon: {
    width: 17,
    height: 17,
    borderTop: '2px solid white',
    borderLeft: '2px solid white',
    display: 'inline-block',
    transform: 'rotate(-45deg)',
    position: 'relative',
    top: 2,
    marginRight: 10,
    [theme.breakpoints.only('xs')]: {
      marginRight: 0,
    },
  },
  buttonContainer: {
    paddingTop: 35,
  },
  button: {
    backgroundColor: theme.palette.common.white,
    width: 150,
    border: 0,
    '&:hover': {
      backgroundColor: theme.palette.common.white,
    },
  },
  registrationSchoolRoot: {
    marginTop: 70,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    marginBottom: 70,
  },
  registrationSchoolButton: {
    marginTop: 20,
    color: theme.palette.common.white,
  },
  formField: {
    paddingBottom: 15,
    color: theme.palette.common.white,
  },
  forgetButton: {
    minHeight: 0,
    padding: 0,
    fontSize: 14,
    textTransform: 'none',
    float: 'right',
  },
});

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#fff',
      main: '#00bcd4',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

const browserSupportStorageService = new BrowserSupportStorageManager();

const BROWSER_SUPPORT_CHECKING_INTERVAL = {
  supported: 30 * 24 * 3600, // 1 month in sec
  unsupported: 24 * 3600, // 1 day in sec
};

class LoginPage extends Component {
  state = {
    username: '',
    password: '',
    resetPasswordOpened: false,
    browserSupportAlertOpened: false,
  };

  loginForm = null;

  loginButtonRef = createRef();

  componentDidMount() {
    try {
      this.checkBrowserSupport();
      const { activeElement } = document;
      if (activeElement && activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
      window.addEventListener('keyup', this.handleKeyboardKeyUp);
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyboardKeyUp);
  }

  onFormSubmit = () => {
    const { actions } = this.props;
    const { username, password } = this.state;
    actions.logIn(username, password);
  };

  onSubmitClick = () => {
    this.loginForm.submit();
  };

  onSubmitRegistrationSchoolDialog = (school) => {
    const { actions } = this.props;
    actions.postSchoolRegisterRequests(school);
  };

  onSubmitForgetPasswordDialog = (email) => {
    const { actions } = this.props;
    actions.sendResetPasswordLink(email).then(() => {
      this.setState({ resetPasswordOpened: false });
    });
  };

  navigateToLandingPage = () => {
    const { actions } = this.props;
    actions.push('/');
  }

  checkBrowserSupport = () => {
    const nowTs = moment.utc().unix();
    if (!localStorage) {
      this.setState({ browserSupportAlertOpened: true });
      return;
    }
    const storageInfo = browserSupportStorageService.info;
    const intervalKey = storageInfo.supported ? 'supported' : 'unsupported';
    if (nowTs - storageInfo.lastCheckedAt < BROWSER_SUPPORT_CHECKING_INTERVAL[intervalKey]) return;
    const htmlEl = document.querySelector('html');
    const htmlElClassNames = htmlEl.getAttribute('class');
    const supportAllRules = !htmlElClassNames.includes('no-');
    browserSupportStorageService.info = {
      supported: supportAllRules,
      lastCheckedAt: nowTs,
    };
    this.setState({ browserSupportAlertOpened: !supportAllRules });
  };

  handleKeyboardKeyUp = (event) => {
    // 13 is the "Enter" key code on the keyboard
    if (event.keyCode === 13) {
      event.preventDefault();
      if (this.loginButtonRef && this.loginButtonRef.current) {
        this.loginButtonRef.current.click();
      }
    }
  };

  render() {
    const { classes, actions } = this.props;
    const {
      username, password, resetPasswordOpened, browserSupportAlertOpened,
    } = this.state;

    return (

      <Grid container className={classes.root} alignContent="flex-start">

        <Grid item container className={classes.headerRoot} alignItems="flex-end">
          <Grid>
            <Avatar alt="Energy in Schools" src={logo} className={classes.headerLogo} />
          </Grid>
          <Grid>
            <Typography variant="h6" className={classes.visitLandingPage} onClick={this.navigateToLandingPage}>
              <span className={classes.arrowIcon} />Visit Landing Page
            </Typography>
          </Grid>
        </Grid>

        <MuiThemeProvider theme={theme}>
          <Grid item container justify="center">
            <Grid item className={classes.logFormWrapper}>

              <ValidatorForm
                ref={(el) => { this.loginForm = el; }}
                onSubmit={this.onFormSubmit}
              >
                <TextValidator
                  fullWidth
                  label="Username"
                  margin="dense"
                  onChange={(event) => { this.setState({ username: event.target.value }); }}
                  name="username"
                  value={username}
                  validators={['required']}
                  errorMessages={['This field is required']}
                  className={classes.formField}
                />
                <TextValidator
                  type="password"
                  fullWidth
                  label="Password"
                  margin="dense"
                  onChange={(event) => { this.setState({ password: event.target.value }); }}
                  name="password"
                  value={password}
                  validators={['required']}
                  errorMessages={['This field is required']}
                  className={classes.formField}
                />
                <Button
                  disableRipple
                  onClick={() => { this.setState({ resetPasswordOpened: true }); }}
                  className={classes.forgetButton}
                >
                  Forgot password?
                </Button>
                <Grid container justify="center" className={classes.buttonContainer}>
                  <Button
                    ref={this.loginButtonRef}
                    className={classes.button}
                    color="primary"
                    variant="outlined"
                    onClick={this.onSubmitClick}
                  >
                    Login
                  </Button>
                </Grid>
              </ValidatorForm>

              <Grid container justify="center" alignContent="center" className={classes.registrationSchoolRoot}>
                <Typography variant="h6" style={{ color: 'rgb(255, 255, 255)' }}>
                  Need to register a new school?
                </Typography>
                <Button
                  onClick={actions.toogleRegistrationSchoolDialog}
                  color="primary"
                  variant="outlined"
                  className={classes.registrationSchoolButton}
                >
                  Register school
                </Button>
              </Grid>

            </Grid>
          </Grid>
        </MuiThemeProvider>

        <ForgetPasswordDialog
          isOpened={resetPasswordOpened}
          onClose={() => { this.setState({ resetPasswordOpened: false }); }}
          onSubmit={this.onSubmitForgetPasswordDialog}
        />

        <AlertDialog
          title="Browser support warning!"
          content="You browser is not supported by Energy in Schools Portal!"
          isOpened={browserSupportAlertOpened}
          onClose={() => { this.setState({ browserSupportAlertOpened: false }); }}
        />
      </Grid>

    );
  }
}

LoginPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...dialogActions,
      ...schoolsActions,
      ...userActions,
      push,
    }, dispatch),
  };
}

export default compose(
  withRouter,
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(LoginPage);
