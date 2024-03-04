import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import Settings from '@material-ui/icons/Settings';
import NotInterested from '@material-ui/icons/NotInterested';
import Clear from '@material-ui/icons/Clear';
import Done from '@material-ui/icons/Done';
import Fade from '@material-ui/core/Fade';
import ButtonBase from '@material-ui/core/ButtonBase';

import { ENERGY_ALERTS_TYPE } from './constants';

import NotificationTypeWidget from './widgets/NotificationTypeWidget';
import EnergyAlertContent from './EnergyAlertContent';
import PercentageIcon from './icons/PercentageIcon';
import MeterIcon from './icons/MeterIcon';
import notificationBell from '../../images/notification-bell.svg';

import * as alertActions from '../../actions/energyAlertActions';
import * as alertEditActions from '../../actions/energyAlertEditActions';

const styles = theme => ({
  cardRoot: {
    width: 650,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      borderRadius: 0,
    },
  },
  cardHeaderRoot: {
    padding: theme.spacing(1, 3),
    height: 70,
  },
  cardHeaderFont: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.27,
    color: '#fff',
  },
  cardHeaderAction: {
    marginTop: 0,
    alignSelf: 'center',
  },
  avatar: {
    borderRadius: 0,
    height: 30,
    width: 30,
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    padding: 32,
    [theme.breakpoints.down('xs')]: {
      padding: 16,
    },
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
    color: '#fff',
  },
  iconSettings: {
    position: 'absolute',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  button: {
    margin: theme.spacing(1),
  },
  meterValueContainer: {
    display: 'flex',
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    height: 70,
    width: '100%',
    borderRadius: '15px',
    flexDirection: 'column',
    alignItems: 'center',
  },
  meterValueLabel: {
    fontSize: '9px',
    padding: 4,
    color: '#b5b5b5',
  },
  meterValue: {
    display: 'flex',
    fontSize: '35px',
  },
  meterValueUnit: {
    position: 'relative',
    top: '4px',
    fontSize: '14px',
  },
  alertContentText: {
    fontSize: 28,
    lineHeight: 1,
    color: '#b5b5b5',
    fontFamily: 'Roboto',
  },
  alertChipRoot: {
    position: 'relative',
    bottom: 4,
    left: 8,
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 16,
    width: 55,
  },
  alertChipLabel: {
    fontSize: 9,
    fontWeight: 500,
  },
  alertHeaderEditButtons: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
  },
  alertHeaderButtonRoot: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  alertHeaderEditIcon: {
    fontSize: 30,
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
    },
  },
  alertTypeOr: {
    display: 'table-cell',
    border: 'solid 1px #dfe0e0',
    borderRadius: '100%',
    height: 60,
    width: 60,
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  alertTypeLabel: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.38,
    fontFamily: 'Roboto',
  },
});

class EnergyAlert extends React.Component {
  state = {
    /* eslint-disable react/destructuring-assignment */
    anchorEl: null,
    readOnly: true,
    activeEditStep: 0,
    alertType: this.props.alertType,
  };

  getCardStyle = (alertType) => {
    switch (alertType) {
      case ENERGY_ALERTS_TYPE.electricity_level:
      case ENERGY_ALERTS_TYPE.electricity_daily:
        return {
          cardColour: '#2699fb',
          unit: 'kW',
        };
      case ENERGY_ALERTS_TYPE.gas_level:
      case ENERGY_ALERTS_TYPE.gas_daily:
        return {
          cardColour: '#f38f31',
          unit: 'kW',
        };
      case ENERGY_ALERTS_TYPE.temperature_level:
        return {
          cardColour: '#393939',
          unit: 'kW',
        };
      default:
        // eslint-disable-next-line no-console
        console.warn('Unhandled alertType');
        return {
          cardColour: '#2699fb',
          unit: 'kW',
        };
    }
  };

  getAlertTypeSelectContent = (cardColour) => {
    const { classes } = this.props;
    return (
      <Grid container alignItems="center">
        <Grid item xs={5}>
          <ButtonBase
            style={{ borderRadius: '10px', padding: 20 }}
            onClick={() => { this.handleAlertTypeClick('daily'); }}
          >
            <Grid container direction="column" justify="center" alignItems="center">
              <PercentageIcon colour={cardColour} style={{ fontSize: 35, marginBottom: 15 }} />
              <span className={classes.alertTypeLabel} style={{ color: cardColour }}>
                Set XX% higher usage <br /> in the previous 5 days
              </span>
            </Grid>
          </ButtonBase>
        </Grid>
        <Grid item xs={2}>
          <span className={`${classes.alertContentText} ${classes.alertTypeOr}`}>or</span>
        </Grid>
        <Grid item xs={5}>
          <ButtonBase
            style={{ borderRadius: '10px', padding: 20 }}
            onClick={() => { this.handleAlertTypeClick('level'); }}
          >
            <Grid container direction="column" justify="center" alignItems="center">
              <MeterIcon colour={cardColour} style={{ fontSize: 35, marginBottom: 15 }} />
              <span className={classes.alertTypeLabel} style={{ color: cardColour }}>
                Set the maximum <br /> limit value
              </span>
            </Grid>
          </ButtonBase>
        </Grid>
      </Grid>
    );
  };

  handleAlertTypeClick = (newType) => {
    const { alertType } = this.state;
    const { actions, id } = this.props;
    let newAlertType = alertType;
    if (!alertType.includes(newType)) {
      newAlertType = newType === 'level' ? ENERGY_ALERTS_TYPE.electricity_level : ENERGY_ALERTS_TYPE.electricity_daily;
    }
    this.setState({
      activeEditStep: 1,
      alertType: newAlertType,
    });
    actions.editAlertType(id, newAlertType);
  };

  handleMenuEditClick = () => {
    const { actions, id } = this.props;
    this.setState(prevState => ({ readOnly: !prevState.readOnly }));
    actions.startEnergyAlertEdit(id, this.props);
    this.handleClose();
  };

  handleMenuStatusChangeClick = () => {
    const {
      actions, id, alertType, active,
    } = this.props;
    actions.changeEnergyAlertStatus(id, alertType, !active).then(() => {
      actions.getEnergyAlerts();
    });
    this.handleClose();
  };

  handleEditCancelClick = () => {
    const { actions, id } = this.props;
    this.setState(prevState => ({ readOnly: !prevState.readOnly, activeEditStep: 0 }));
    actions.cancelEnergyAlertEdit(id);
  };

  handleEditSaveClick = () => {
    const { id, alertsToEdit, actions } = this.props;
    this.setState(prevState => ({ readOnly: !prevState.readOnly, activeEditStep: 0 }));
    const alertToEdit = alertsToEdit[id];
    actions.updateEnergyAlert(
      id,
      alertToEdit.alertType,
      alertToEdit.meter.id || null,
      alertToEdit.location.id,
      alertToEdit.limitCondition,
      alertToEdit.energyLimit,
      alertToEdit.limitDuration,
      alertToEdit.limitPeriodStart,
      alertToEdit.limitPeriodEnd,
      alertToEdit.percentageLimit,
    );
  };

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  renderHeaderAction() {
    const { readOnly } = this.state;
    const { classes } = this.props;

    if (readOnly) {
      return (
        <IconButton className={classes.iconButton} onClick={e => this.handleMenu(e)}>
          <Settings className={classes.iconSettings} />
        </IconButton>
      );
    }
    return (
      <React.Fragment>
        <Button
          classes={{ label: classes.alertHeaderEditButtons, root: classes.alertHeaderButtonRoot }}
          onClick={this.handleEditCancelClick}
        >
          <Clear className={classes.alertHeaderEditIcon} />
          Cancel
        </Button>
        <Button
          classes={{ label: classes.alertHeaderEditButtons, root: classes.alertHeaderButtonRoot }}
          onClick={this.handleEditSaveClick}
        >
          <Done className={classes.alertHeaderEditIcon} />
          Save
        </Button>
      </React.Fragment>
    );
  }

  renderEditContent = (cardColour) => {
    const { activeEditStep, alertType } = this.state;
    const { id } = this.props;
    if (alertType === ENERGY_ALERTS_TYPE.temperature) {
      return (
        <EnergyAlertContent
          id={id}
          alertType={alertType}
          widgetsColour={cardColour}
        />
      );
    }

    return (
      <React.Fragment>
        <Fade in={activeEditStep === 0} style={activeEditStep !== 0 ? { display: 'none' } : {}}>
          {this.getAlertTypeSelectContent(cardColour)}
        </Fade>
        <Fade in={activeEditStep === 1} style={activeEditStep !== 1 ? { display: 'none' } : {}}>
          <div>
            <EnergyAlertContent
              id={id}
              alertType={alertType}
              widgetsColour={cardColour}
            />
          </div>
        </Fade>
      </React.Fragment>
    );
  };

  render() {
    const {
      classes, id, active, name, notificationTypes, alertType, meter, location, limitCondition, energyLimit, limitDuration, limitPeriodStart, limitPeriodEnd, percentageLimit, onDelete,
    } = this.props;
    const { anchorEl, readOnly } = this.state;

    const open = Boolean(anchorEl);

    const cardStyle = this.getCardStyle(alertType);
    if (!active) cardStyle.cardColour = '#b5b5b5';

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }}>
          <CardHeader
            classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderFont, action: classes.cardHeaderAction }}
            style={{ backgroundColor: cardStyle.cardColour }}
            avatar={
              <Avatar alt="Logo" src={notificationBell} classes={{ root: classes.avatar }} />
            }
            action={
              this.renderHeaderAction()
            }
            title={(
              <div>
                {name}
                <Chip
                  style={{ color: cardStyle.cardColour }}
                  label={active ? 'ACTIVE' : 'DISABLED'}
                  classes={{ root: classes.alertChipRoot, label: classes.alertChipLabel }}
                />
              </div>
            )}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem}>
                { readOnly ? (
                  <EnergyAlertContent
                    readOnly
                    id={id}
                    alertType={alertType}
                    widgetsColour={cardStyle.cardColour}
                    meter={meter}
                    location={location}
                    limitCondition={limitCondition}
                    energyLimit={energyLimit}
                    percentageLimit={percentageLimit}
                    limitDuration={limitDuration}
                    limitPeriodStart={limitPeriodStart}
                    limitPeriodEnd={limitPeriodEnd}
                  />
                ) : (
                  this.renderEditContent(cardStyle.cardColour)
                )}
              </ListItem>
              <Divider />
              <ListItem className={classes.listItem} style={{ padding: '32px 16px' }}>
                <Grid container>
                  <Grid item xs={8} style={{ alignSelf: 'center' }}>
                    <Typography className={classes.alertContentText}>Then send notification via</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ alignSelf: 'center' }}>
                    <NotificationTypeWidget colour={cardStyle.cardColour} notificationTypes={notificationTypes} />
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </CardContent>
          <Menu
            id="menu-device"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={() => this.handleClose()}
          >
            <MenuItem onClick={this.handleMenuEditClick}>
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primary="Edit" />
            </MenuItem>
            <MenuItem onClick={this.handleMenuStatusChangeClick}>
              <ListItemIcon>
                <NotInterested />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primary="Disable/Enable" />
            </MenuItem>
            <MenuItem onClick={() => { onDelete(); this.handleClose(); }}>
              <ListItemIcon style={{ color: '#c13829' }}>
                <Delete />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primaryTypographyProps={{ style: { color: '#c13829' } }} primary="Delete" />
            </MenuItem>
          </Menu>
        </Card>
      </div>
    );
  }
}

EnergyAlert.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  meter: PropTypes.object,
  location: PropTypes.object,
  limitCondition: PropTypes.string,
  energyLimit: PropTypes.number,
  limitDuration: PropTypes.string,
  percentageLimit: PropTypes.number,
  limitPeriodStart: PropTypes.string.isRequired,
  limitPeriodEnd: PropTypes.string.isRequired,
  alertType: PropTypes.oneOf(Object.values(ENERGY_ALERTS_TYPE)).isRequired,
  notificationTypes: PropTypes.array.isRequired,
  alertsToEdit: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

EnergyAlert.defaultProps = {
  percentageLimit: 0,
  energyLimit: 0,
  limitCondition: '',
  limitDuration: '',
  meter: {},
  location: {},
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...alertActions,
      ...alertEditActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    alertsToEdit: state.energyAlertsEdit,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(EnergyAlert);
