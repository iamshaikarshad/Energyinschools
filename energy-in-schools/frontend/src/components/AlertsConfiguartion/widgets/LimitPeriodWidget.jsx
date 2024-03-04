import React from 'react';
import moment from 'moment';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';

import { AVAILABLE_LIMIT_PERIODS } from '../constants';

import periodAvatar from '../../../images/period_bars.svg';

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
    lineHeight: 1.33,
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
    width: 20,
    height: 'auto',
  },
  selectRoot: {
    color: '#fff',
  },
  selectIcon: {
    color: '#fff',
  },
  inputUnderline: {
    '&:after': {
      borderColor: '#fff',
    },
    '&:before': {
      borderColor: '#fff',
    },
    '&:hover:before': {
      borderColor: '#fff !important',
    },
  },
};

class LimitPeriodWidget extends React.Component {
  state = {
    /* eslint-disable react/destructuring-assignment */
    selectedValue: this.props.periodStart + this.props.periodEnd,
  };

  onSelectChange = (event) => {
    const { onPeriodChange } = this.props;
    const newValue = event.target.value;
    this.setState({ selectedValue: newValue });
    const limitPeriod = AVAILABLE_LIMIT_PERIODS.find(period => newValue === period.from + period.to);
    onPeriodChange(limitPeriod.from, limitPeriod.to);
  };

  render() {
    const {
      classes, colour, readOnly, periodStart, periodEnd,
    } = this.props;
    const { selectedValue } = this.state;

    return (
      <CardHeader
        classes={{
          root: classes.root,
          title: classes.widgetHeader,
          subheader: classes.widgetSubHeader,
          avatar: classes.avatarWrapper,
        }}
        style={{ backgroundColor: colour }}
        avatar={(
          <Avatar
            alt="Logo"
            src={periodAvatar}
            classes={{ root: classes.avatar, img: classes.avatarImage }}
          />
        )}
        title="Time period (Hours)"
        subheader={readOnly ? `${moment(periodStart, 'HH:mm:ss').format('h:mm A')} to ${moment(periodEnd, 'HH:mm:ss').format('h:mm A')}` : (
          <Select
            value={selectedValue}
            input={<Input classes={{ underline: classes.inputUnderline }} />}
            onChange={this.onSelectChange}
            classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
          >
            {
              AVAILABLE_LIMIT_PERIODS.map((period) => {
                const periodStr = `${moment(period.from, 'HH:mm:ss').format('h:mm A')} to ${moment(period.to, 'HH:mm:ss').format('h:mm A')}`;
                return (
                  <MenuItem key={periodStr} value={period.from + period.to}>
                    {periodStr}
                  </MenuItem>
                );
              })
            }
          </Select>
        )}
      />
    );
  }
}

LimitPeriodWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  periodStart: PropTypes.string.isRequired,
  periodEnd: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onPeriodChange: PropTypes.func,
};

LimitPeriodWidget.defaultProps = {
  readOnly: true,
  onPeriodChange: () => {},
};

export default compose(withStyles(styles))(LimitPeriodWidget);
