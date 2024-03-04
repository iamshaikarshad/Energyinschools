import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import * as userActions from '../actions/userActions';

import logo from '../images/logo.svg';
import passwordIcon from '../images/password.svg';
import bg from '../images/bg.png';
import tabletBg from '../images/tablet_bg.png';

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
  },
  headerLogo: {
    width: 85,
    height: 30,
    borderRadius: 0,
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
  formField: {
    paddingBottom: 15,
    color: theme.palette.common.white,
  },
  passwordLogo: {
    width: 27,
    height: 31,
    borderRadius: 0,
    margin: '0 auto',
  },
  passwordResetLabel: {
    color: theme.palette.common.white,
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 0.5,
    paddingTop: 15,
    paddingBottom: 40,
    textAlign: 'center',
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

class ResetPasswordPage extends React.Component {
  state = {
    password: '',
    confirmedPassword: '',
  };

  resetPasswordForm = null;


  componentDidMount() {
    ValidatorForm.addValidationRule('passwordsMatch', value => value === this.state.password); // eslint-disable-line react/destructuring-assignment
  }

  onFormSubmit = () => {
    const { actions, match } = this.props;
    const { password, confirmedPassword } = this.state;
    const token = match.params.token;

    actions.resetPassword(password, confirmedPassword, token).then(() => {
      actions.push('/');
    });
  };

  onSubmitClick = () => {
    this.resetPasswordForm.submit();
  };

  render() {
    const { classes } = this.props;
    const { password, confirmedPassword } = this.state;

    return (
      <Grid container className={classes.root} alignContent="flex-start">
        <Grid item container className={classes.headerRoot} alignItems="flex-end">
          <Avatar alt="Energy in Schools" src={logo} className={classes.headerLogo} />
        </Grid>
        <MuiThemeProvider theme={theme}>
          <Grid item container justify="center">
            <Grid item style={{ width: 360, paddingTop: 100 }}>
              <ValidatorForm
                ref={(el) => { this.resetPasswordForm = el; }}
                onSubmit={this.onFormSubmit}
              >
                <Avatar alt="Password" src={passwordIcon} className={classes.passwordLogo} />
                <Typography className={classes.passwordResetLabel}>Password reset</Typography>
                <TextValidator
                  type="password"
                  fullWidth
                  label="New password"
                  margin="dense"
                  onChange={event => this.setState({ password: event.target.value })}
                  name="password"
                  value={password}
                  validators={['required', 'minStringLength:8', 'maxStringLength:128']}
                  errorMessages={['This field is required', 'Password must be at least 8 characters long', 'Password can not exceed 128 characters']}
                  className={classes.formField}
                />
                <TextValidator
                  type="password"
                  fullWidth
                  label="Repeat password"
                  margin="dense"
                  onChange={event => this.setState({ confirmedPassword: event.target.value })}
                  name="confirmedPassword"
                  value={confirmedPassword}
                  validators={['passwordsMatch']}
                  errorMessages={['Password mismatch']}
                  className={classes.formField}
                />
                <Grid container justify="center" className={classes.buttonContainer}>
                  <Button onClick={this.onSubmitClick} color="primary" variant="outlined" className={classes.button}>
                    Confirm
                  </Button>
                </Grid>
              </ValidatorForm>
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </Grid>
    );
  }
}

ResetPasswordPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      push,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(ResetPasswordPage);
