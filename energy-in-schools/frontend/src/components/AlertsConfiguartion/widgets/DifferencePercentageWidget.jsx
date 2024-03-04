import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import TextField from '@material-ui/core/TextField';

import PercentageIcon from '../icons/PercentageIcon';

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
    marginLeft: 8,
    marginRight: 8,
  },
  avatar: {
    borderRadius: 0,
    height: 30,
    width: 30,
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

class DifferencePercentageWidget extends React.Component {
  state = {
    /* eslint-disable react/destructuring-assignment */
    inputValue: this.props.percentage,
  };

  render() {
    const {
      classes, colour, readOnly, percentage, onPercentageChange,
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
          <PercentageIcon
            colour="#fff"
          />
        )}
        title={readOnly ? `${percentage}%` : (
          <TextField
            style={{ width: 150 }}
            label="Difference (%)"
            value={inputValue}
            onChange={event => this.setState({ inputValue: event.target.value })}
            onBlur={() => onPercentageChange(inputValue)}
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
      />
    );
  }
}

DifferencePercentageWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  percentage: PropTypes.number.isRequired,
  colour: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onPercentageChange: PropTypes.func,
};

DifferencePercentageWidget.defaultProps = {
  readOnly: true,
  onPercentageChange: () => {},
};

export default compose(withStyles(styles))(DifferencePercentageWidget);
