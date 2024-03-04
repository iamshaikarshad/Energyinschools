import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';

import SLEAdminHeader from '../../components/SLEAdminHeader';
import * as userActions from '../../actions/userActions';
import * as schoolActions from '../../actions/schoolsActions';
import SchoolUserCard from '../../components/SchoolUserCard';
import ChangePasswordDialog from '../../components/dialogs/ChangePasswordDialog';
import NoItems from '../../components/NoItems';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  usersContainer: {
    padding: 30,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  labelContainer: {
    paddingBottom: 0,
    textTransform: 'none',
  },
  tab: {
    width: 200,
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
  adminHeaderWrapper: {
    [theme.breakpoints.down('xs')]: {
      padding: '0 !important',
    },
  },
});

class UsersPage extends React.Component {
  state = {
    changePasswordDialog: {
      opened: false,
      schoolUserId: 0,
    },
    confirmDialog: {
      opened: false,
      username: '',
    },
  };

  componentDidMount() {
    const { actions, users } = this.props;
    actions.getSchoolInformation(users.currentUser.location_id);
    actions.getSchoolUsers();
  }

  onPasswordReset = () => {
    const { confirmDialog } = this.state;
    const { actions, users } = this.props;
    const email = users.currentUser.email;
    actions.sendResetPasswordLink(email, confirmDialog.username).then(() => {
      this.toogleConfirmDialog('');
    });
  };

  openChangePasswordDialog = (schoolUserId) => {
    this.setState({
      changePasswordDialog: {
        opened: true,
        schoolUserId,
      },
    });
  };

  closeChangePasswordDialog = () => {
    const { changePasswordDialog } = this.state;
    this.setState({
      changePasswordDialog: {
        ...changePasswordDialog,
        opened: false,
      },
    });
  };

  submitChangePasswordDialog = (newPassword, oldPassword) => {
    const { actions } = this.props;
    const { changePasswordDialog } = this.state;
    actions.changePassword(newPassword, oldPassword, changePasswordDialog.schoolUserId)
      .then(this.closeChangePasswordDialog);
  };

  toogleConfirmDialog = (username) => {
    const { confirmDialog } = this.state;
    this.setState({
      confirmDialog: {
        opened: !confirmDialog.opened,
        username,
      },
    });
  };

  render() {
    const {
      classes, users, actions, school,
    } = this.props;
    const { changePasswordDialog, confirmDialog } = this.state;

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center" className={classes.usersContainer}>

          <Grid item container xs={12} sm={10} spacing={3}>
            <Grid item xs={12} className={classes.adminHeaderWrapper}>
              <SLEAdminHeader
                title={school.name}
                schoolID={school.uid}
                onRefreshClick={actions.getSchoolUsers}
              />
            </Grid>

            <Grid xs={12} item>
              {
                users.schoolUsers.data.length > 0 ? (
                  <Grid container justify="space-between">
                    {
                      users.schoolUsers.data.map(user => (
                        <SchoolUserCard
                          key={user.id}
                          user={user}
                          onChangePasswordClick={() => this.openChangePasswordDialog(user.id)}
                          onPasswordResetClick={() => this.toogleConfirmDialog(user.username)}
                        />
                      ))
                    }
                  </Grid>
                ) : (
                  <NoItems />
                )
              }
            </Grid>
          </Grid>
        </Grid>

        <ChangePasswordDialog
          isOpened={changePasswordDialog.opened}
          onClose={this.closeChangePasswordDialog}
          onSubmit={this.submitChangePasswordDialog}
        />

        <ConfirmDialog
          title="Reset password for this user?"
          isOpened={confirmDialog.opened}
          onSubmit={this.onPasswordReset}
          onClose={() => this.toogleConfirmDialog('')}
        />

      </div>
    );
  }
}

UsersPage.propTypes = {
  users: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    users: state.users,
    school: state.schools.activeSchool,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      ...schoolActions,
    }, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(UsersPage);
