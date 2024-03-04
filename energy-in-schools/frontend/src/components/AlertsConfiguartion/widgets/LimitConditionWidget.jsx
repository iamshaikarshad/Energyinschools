import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';

import { LIMIT_ALERT_CONDITION_TYPE_TO_LABEL } from '../constants';

const styles = {
  root: {
    display: 'inline-flex',
    padding: '8px 16px',
    borderRadius: 36,
    margin: '0px 13px 10px 0px',
    height: 55,
  },
  widgetSubHeader: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#fff',
    lineHeight: 1.33,
  },
  widgetHeader: {
    color: '#fff',
    fontSize: '10px',
    lineHeight: 1.1,
    letterSpacing: '0.2px',
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

class LimitConditionWidget extends React.Component {
  state = {
    /* eslint-disable react/destructuring-assignment */
    selectedValue: this.props.limitCondition,
  };

  onSelectChange = (event) => {
    const { onConditionChange } = this.props;
    const newValue = event.target.value;
    this.setState({ selectedValue: newValue });
    onConditionChange(newValue);
  };

  render() {
    const {
      classes, colour, readOnly, limitCondition,
    } = this.props;
    const { selectedValue } = this.state;
    const conditionLabel = LIMIT_ALERT_CONDITION_TYPE_TO_LABEL.find(item => item.type === limitCondition).label;

    return (
      <CardHeader
        classes={{
          root: classes.root,
          title: classes.widgetHeader,
          subheader: classes.widgetSubHeader,
        }}
        style={{ backgroundColor: colour }}
        title="Limit condition"
        subheader={readOnly ? conditionLabel : (
          <Select
            value={selectedValue}
            input={<Input classes={{ underline: classes.inputUnderline }} />}
            onChange={this.onSelectChange}
            classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
          >
            {
              LIMIT_ALERT_CONDITION_TYPE_TO_LABEL.map(condition => (
                <MenuItem key={condition.type} value={condition.type}>
                  {condition.label}
                </MenuItem>
              ))
            }
          </Select>
        )}
      />
    );
  }
}

LimitConditionWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  limitCondition: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onConditionChange: PropTypes.func,
};

LimitConditionWidget.defaultProps = {
  readOnly: true,
  onConditionChange: () => {},
};

export default compose(withStyles(styles))(LimitConditionWidget);
