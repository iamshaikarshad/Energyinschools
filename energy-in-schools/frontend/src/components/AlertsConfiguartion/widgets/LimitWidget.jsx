import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';

import meterAvatar from '../../../images/meter_ltl.svg';

const styles = {
  root: {
    display: 'inline-flex',
    padding: '8px 24px 8px 8px',
    borderRadius: 36,
    margin: '0px 13px 10px 0px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
  },
  widgetHeader: {
    fontSize: '28px',
    color: '#fff',
    lineHeight: 1.33,
  },
  widgetSubHeader: {
    color: '#fff',
    fontSize: '10px',
    lineHeight: 1.1,
    letterSpacing: '0.2px',
    paddingLeft: '10px',
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

class LimitWidget extends React.Component {
  state = {
    /* eslint-disable react/destructuring-assignment */
    inputValue: this.props.limit,
  };

  render() {
    const {
      classes, colour, readOnly, limit, unitLabel, onLimitChange,
    } = this.props;
    const { inputValue } = this.state;
    return (
      <CardHeader
        classes={{
          root: classes.root,
          title: classes.widgetHeader,
          subheader: classes.widgetSubHeader,
          avatar: classes.avatarWrapper,
          content: classes.content,
        }}
        style={{ backgroundColor: colour }}
        avatar={(
          <Avatar
            alt="Logo"
            src={meterAvatar}
            classes={{ root: classes.avatar, img: classes.avatarImage }}
          />
        )}
        title={readOnly ? limit : (
          <TextField
            style={{ width: 130 }}
            label={`Set value (${unitLabel})`}
            value={inputValue}
            onChange={event => this.setState({ inputValue: event.target.value })}
            onBlur={() => onLimitChange(inputValue)}
            type="number"
            inputProps={{ style: { padding: '3px 0 4px' } }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              style: { color: '#fff' },
              classes: { underline: classes.inputUnderline },
            }}
            InputLabelProps={{
              shrink: true,
              style: { color: '#fff' },
            }}
            margin="none"
          />
        )
        }
        subheader={readOnly ? `Value (${unitLabel})` : null}
      />
    );
  }
}

LimitWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  unitLabel: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onLimitChange: PropTypes.func,
};

LimitWidget.defaultProps = {
  readOnly: true,
  onLimitChange: () => {},
};

export default compose(withStyles(styles))(LimitWidget);
