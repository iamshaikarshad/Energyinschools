import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import schoolIcon from '../../images/school_avatar.png';
import * as schoolsActions from '../../actions/schoolsActions';
import * as hubsActions from '../../actions/hubsActions';
import * as devicesActions from '../../actions/devicesActions';

import deviceIcon from '../../images/device_grey.svg';
import hubIcon from '../../images/raspberrypi_about_page.svg';
import emailIcon from '../../images/school_email.svg';
import commentIcon from '../../images/comment_location.svg';
import addressIcon from '../../images/address_flag.svg';

import getAddressDisplayValue from '../../utils/getAddressDisplayValue';

import { ADDRESS_FIELD } from '../../components/SchoolRegistration/constants';

const styles = theme => ({
  root: {
    fontFamily: 'Roboto',
    flexGrow: 1,
    paddingTop: 100,
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingTop: 25,
    },
    [theme.breakpoints.down('xs')]: {
      padding: '25px 0px 16px',
    },
  },
  wrapperRoot: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-start',
      paddingLeft: 100,
    },
  },
  avatar: {
    borderRadius: 0,
    width: 300,
    height: 300,
    [theme.breakpoints.down('sm')]: {
      width: 100,
      height: 100,
    },
  },
  cardHeaderRoot: {
    paddingLeft: 0,
    paddingTop: 0,
  },
  cardHeaderTitle: {
    fontWeight: 500,
  },
  cardHeaderSubheader: {
    color: '#b5b5b5',
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 0,
  },
  devicesRoot: {
    fontWeight: 500,
    fontSize: 16,
    color: '#b5b5b5',
  },
  listItem: {
    paddingLeft: 0,
  },
  listItemTextPrimary: {
    padding: 0,
    fontWeight: 500,
    color: '#3c3c3c',
  },
  listItemTextSecondary: {
    fontWeight: 'normal',
    paddingTop: 5,
    color: '#3c3c3c',
  },
  iconWrapper: {
    textAlign: 'right',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      paddingBottom: 25,
    },
  },
  contentWrapper: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: 70,
    },
  },

});

const ADDRESS_FIELDS_TO_DISPLAY = [ADDRESS_FIELD.line_1, ADDRESS_FIELD.line_2, ADDRESS_FIELD.city];

class LocationPage extends React.Component {
  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    actions.getDevicesList();
    actions.getHubsList();
  }

  render() {
    const {
      classes, school, hubs, user, devices,
    } = this.props;

    const address = getAddressDisplayValue(school.address, ADDRESS_FIELDS_TO_DISPLAY);

    return (
      <div style={{ width: '100%', backgroundColor: '#FFF' }}>
        <Grid container alignItems="center" justify="center" className={classes.wrapperRoot}>
          <Grid item container xs={10} md={10} lg={9} justify="flex-start" className={classes.root}>

            <Grid item xs={12} md={5} lg={4} className={classes.iconWrapper}>
              <img alt="School" src={schoolIcon} className={classes.avatar} />
            </Grid>

            <Grid item xs={12} md={7} lg={8} className={classes.contentWrapper}>
              <CardHeader
                title={school.name}
                subheader={`Account created: ${moment(school.created_at).format('D MMM, YYYY h:mm A')}`}
                classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderTitle, subheader: classes.cardHeaderSubheader }}
              />
              <Divider />
              <Grid container>
                <CardHeader
                  title={`Hubs: ${hubs.data.length}`}
                  avatar={<Avatar src={hubIcon} className={classes.icon} style={{ width: 16 }} />}
                  classes={{ root: classes.devicesRoot, title: classes.devicesRoot }}
                  style={{ paddingLeft: 0 }}
                />
                <CardHeader
                  title={`Devices: ${devices.data.length}`}
                  avatar={<Avatar src={deviceIcon} className={classes.icon} />}
                  classes={{ root: classes.devicesRoot, title: classes.devicesRoot }}
                />
              </Grid>
              <Divider />
              <List>
                <ListItem component="div" className={classes.listItem}>
                  <ListItemText
                    primary={(
                      <ListItem style={{ padding: 0 }}>
                        <ListItemIcon>
                          <Avatar src={emailIcon} className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText
                          style={{ padding: 0 }}
                          primary="Email"
                          classes={{ primary: classes.listItemTextPrimary }}
                        />
                      </ListItem>
                    )}
                    secondary={user.email}
                    classes={{ secondary: classes.listItemTextSecondary }}
                  />
                </ListItem>

                <ListItem component="div" className={classes.listItem}>
                  <ListItemText
                    primary={(
                      <ListItem style={{ padding: 0 }}>
                        <ListItemIcon>
                          <Avatar src={commentIcon} className={classes.icon} style={{ width: 23 }} />
                        </ListItemIcon>
                        <ListItemText
                          style={{ padding: 0, marginLeft: -3 }}
                          primary="Comment about location"
                          classes={{ primary: classes.listItemTextPrimary }}
                        />
                      </ListItem>
                    )}
                    secondary={school.description || ''}
                    classes={{ secondary: classes.listItemTextSecondary }}
                  />
                </ListItem>

                <ListItem component="div" className={classes.listItem}>
                  <ListItemText
                    primary={(
                      <ListItem style={{ padding: 0 }}>
                        <ListItemIcon>
                          <Avatar src={addressIcon} className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText
                          style={{ padding: 0 }}
                          primary="Address"
                          classes={{ primary: classes.listItemTextPrimary }}
                        />
                      </ListItem>
                    )}
                    secondary={address}
                    classes={{ secondary: classes.listItemTextSecondary }}
                  />
                </ListItem>
              </List>
            </Grid>

          </Grid>
        </Grid>
      </div>
    );
  }
}

LocationPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
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
    school: state.schools.activeSchool,
    hubs: state.hubs,
    devices: state.devices,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(LocationPage);
