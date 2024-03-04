import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Settings from '@material-ui/icons/Settings';

import gasAvatar from '../../../images/gas_usage.svg';
import electricityAvatar from '../../../images/electricity_usage.svg';
import temperatureAvatar from '../../../images/temperature_alert.svg';
import { ENERGY_ALERTS_TYPE } from '../constants';

const styles = {
  root: {
    display: 'inline-flex',
    padding: '8px 24px 8px 8px',
    borderRadius: 36,
    margin: '0px 13px 10px 0px',
    height: 55,
  },
  widgetSubHeader: {
    fontSize: '15px',
    color: '#fff',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    lineHeight: 1.33,
    width: 110,
  },
  widgetHeader: {
    color: '#fff',
    fontSize: '10px',
    lineHeight: 1.1,
    letterSpacing: '0.2px',
  },
  avatarWrapper: {
    marginRight: 4,
  },
  avatar: {
    borderRadius: 0,
    height: 30,
    width: 30,
  },
  avatarImage: {
    width: 15,
    height: 'auto',
  },
  actionWrapper: {
    marginTop: 3,
    marginRight: -10,
    marginLeft: 5,
  },
  actionIcon: {
    color: '#fff',
  },
  iconSettings: {
    position: 'absolute',
  },
};

const EnergyTypeWidget = ({
  classes, colour, readOnly, alertType, onEditClick,
}) => {
  const getIconLabel = (type) => {
    switch (type) {
      case ENERGY_ALERTS_TYPE.electricity_daily:
      case ENERGY_ALERTS_TYPE.electricity_level:
        return {
          icon: electricityAvatar,
          label: 'Electricity usage',
        };
      case ENERGY_ALERTS_TYPE.gas_daily:
      case ENERGY_ALERTS_TYPE.gas_level:
        return {
          icon: gasAvatar,
          label: 'Gas usage',
        };
      case ENERGY_ALERTS_TYPE.temperature_level:
        return {
          icon: temperatureAvatar,
          label: 'Temperature level',
        };
      default:
        // eslint-disable-next-line no-console
        console.warn('Unsupported alert type');
        return {
          icon: electricityAvatar,
          label: 'Electricity usage',
        };
    }
  };

  const { icon, label } = getIconLabel(alertType);
  return (
    <CardHeader
      classes={{
        root: classes.root,
        title: classes.widgetHeader,
        subheader: classes.widgetSubHeader,
        avatar: classes.avatarWrapper,
        action: classes.actionWrapper,
      }}
      style={{ backgroundColor: colour }}
      avatar={
        <Avatar alt="Logo" src={icon} classes={{ root: classes.avatar, img: classes.avatarImage }} />
      }
      title="Energy type"
      subheader={label}
      action={
        !readOnly && (
          <IconButton style={{ height: 24, width: 24 }} classes={{ label: classes.actionIcon }} onClick={onEditClick}>
            <Settings className={classes.iconSettings} />
          </IconButton>
        )
      }
    />
  );
};

EnergyTypeWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  colour: PropTypes.string.isRequired,
  alertType: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onEditClick: PropTypes.func,
};

EnergyTypeWidget.defaultProps = {
  readOnly: true,
  onEditClick: () => {},
};

export default compose(withStyles(styles))(EnergyTypeWidget);
