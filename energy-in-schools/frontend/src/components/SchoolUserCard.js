import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import moment from 'moment';

import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CardHeader from '@material-ui/core/CardHeader';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';

import {
  PUPIL_ROLE, SEM_ADMIN_ROLE, SLE_ADMIN_ROLE, TEACHER_ROLE,
} from '../constants/config';
import sleIcon from '../images/sle.svg';
import semIcon from '../images/energy_avatar.svg';
import teacherIcon from '../images/teacher.svg';
import pupilIcon from '../images/pupil.svg';

const styles = theme => ({
  cardRoot: {
    marginTop: theme.spacing(3),
    width: 674,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  cardHeaderRoot: {
    backgroundColor: theme.palette.primary,
    color: 'white',
    height: 69,
    padding: theme.spacing(1, 3),
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(3),
      paddingRight: theme.spacing(2),
    },
  },
  cardHeaderTitle: {
    color: 'white',
  },
  cardSubheader: {
    color: 'white',
    fontWeight: 'normal',
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      padding: 0,
    },
  },
  listItem: {
    padding: theme.spacing(1, 3),
    [theme.breakpoints.down('xs')]: {
      paddingRight: theme.spacing(2),
    },
  },
  avatar: {
    height: 36,
    borderRadius: 0,
  },
  listItemText: {
    padding: theme.spacing(1, 0),
  },
  button: {
    margin: theme.spacing(1),
  },
  passwordResetContainer: {
    borderTop: '1px solid #eaeaea',
  },
});

const listItemTextProps = {
  primaryTypographyProps: {
    color: 'textSecondary',
    style: {
      fontSize: '14px',
    },
  },
  secondaryTypographyProps: {
    color: 'initial',
    style: {
      fontSize: '16px',
    },
  },
};

const listItemChangePasswordTextProps = {
  primaryTypographyProps: {
    style: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#00bcd4',
    },
  },
  secondaryTypographyProps: {
    style: {
      fontSize: '12px',
      color: '#b5b5b5',
      letterSpacing: '0.2px',
    },
  },
};

class SchoolUserCard extends React.Component {
  getPropsByRole = (role) => {
    switch (role) {
      case SLE_ADMIN_ROLE:
        return {
          title: 'Admin (you)',
          styles: {
            backgroundColor: '#00bcd4',
            titleColor: '#ffffff',
            subheaderColor: '#ffffff',
            rootColor: '#ffffff',
            icon: sleIcon,
            iconWidth: 36,
          },
        };
      case SEM_ADMIN_ROLE:
        return {
          title: 'Energy manager',
          styles: {
            backgroundColor: '#3c3c3c',
            titleColor: '#ffffff',
            subheaderColor: '#ffffff',
            rootColor: '#ffffff',
            icon: semIcon,
            iconWidth: 26,
          },
        };
      case TEACHER_ROLE:
        return {
          title: 'Teachers',
          styles: {
            backgroundColor: '#ffffff',
            titleColor: '#555',
            subheaderColor: '#b5b5b5',
            rootColor: '#00bcd4',
            icon: teacherIcon,
            iconWidth: 77,
          },
        };
      case PUPIL_ROLE:
        return {
          title: 'Pupils',
          styles: {
            backgroundColor: '#ffffff',
            titleColor: '#555',
            subheaderColor: '#b5b5b5',
            rootColor: '#00bcd4',
            icon: pupilIcon,
            iconWidth: 77,
          },
        };
      default:
        return null;
    }
  };

  render() {
    const {
      classes, onChangePasswordClick, user, width, onPasswordResetClick,
    } = this.props;

    const props = this.getPropsByRole(user.role);
    const lastActivity = user.last_login ? `Last activity: ${moment(user.last_login).format('D MMM, YYYY h:mm A')}` : '';

    return (
      props && (
        <Card xs={6} raised classes={{ root: classes.cardRoot }}>
          <CardHeader
            style={{ backgroundColor: props.styles.backgroundColor, color: props.styles.rootColor }}
            classes={{
              root: classes.cardHeaderRoot,
              title: classes.cardHeaderTitle,
              subheader: classes.cardSubheader,
            }}
            avatar={(
              <Avatar
                alt="Avatar"
                src={props.styles.icon}
                classes={{ root: classes.avatar }}
                style={{ width: props.styles.iconWidth }}
              />
            )}
            title={<span style={{ color: props.styles.titleColor }}>{props.title}</span>}
            subheader={<span style={{ color: props.styles.subheaderColor }}>{lastActivity}</span>}
          />
          <CardContent classes={{ root: classes.cardContentRoot }}>
            <List disablePadding>
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondary={user.email || 'No email'}
                  primary="Email"
                />
              </ListItem>
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondary="************"
                  primary="Password"
                />
              </ListItem>
              <ListItem style={{ padding: 0 }}>
                <Grid
                  container
                  direction={isWidthUp('lg', width) ? 'row' : 'column'}
                  className={classes.passwordResetContainer}
                >
                  {user.role === SLE_ADMIN_ROLE ? (
                    <Grid item lg={12}>
                      <ListItem button className={classes.listItem} style={{ height: 70, textAlign: 'center' }} onClick={onChangePasswordClick}>
                        <ListItemText
                          {...listItemChangePasswordTextProps}
                          className={classes.listItemText}
                          primary="CHANGE PASSWORD"
                        />
                      </ListItem>
                    </Grid>
                  ) : (
                    <React.Fragment>
                      <Grid item lg={6}>
                        <ListItem button className={classes.listItem} style={{ height: 70 }} onClick={onPasswordResetClick}>
                          <ListItemText
                            {...listItemChangePasswordTextProps}
                            className={classes.listItemText}
                            secondary="Users will be able to change the password manually"
                            primary="SEND PASSWORD CHANGE REQUEST"
                          />
                        </ListItem>
                      </Grid>
                      <Grid item lg={6} style={isWidthUp('lg', width) ? { borderLeft: '1px solid #eaeaea' } : { borderTop: '1px solid #eaeaea' }}>
                        <ListItem button className={classes.listItem} style={{ height: 70 }} onClick={onChangePasswordClick}>
                          <ListItemText
                            {...listItemChangePasswordTextProps}
                            className={classes.listItemText}
                            secondary="You will change the password and notify the users"
                            primary="CHANGE PASSWORD MANUALLY"
                          />
                        </ListItem>
                      </Grid>
                    </React.Fragment>
                  )}
                </Grid>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )
    );
  }
}

SchoolUserCard.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  onChangePasswordClick: PropTypes.func.isRequired,
  onPasswordResetClick: PropTypes.func.isRequired,
};

export default compose(
  withStyles(styles),
  withWidth(),
)(SchoolUserCard);
