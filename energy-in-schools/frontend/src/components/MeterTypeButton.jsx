import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

import { ValidatorComponent } from 'react-form-validator-core';

import {
  ELECTRICITY, GAS, SOLAR, HUMAN_READABLE_METER_TYPES,
} from '../constants/config';

import gasMeterAvatar from '../images/gas_white.svg';
import electricityMeterAvatar from '../images/electric_white.svg';
import solarMeterAvatar from '../images/solar_white.svg';


const styles = theme => ({
  avatar: {
    height: 36,
    width: 36,
    marginRight: 10,
    borderRadius: 0,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  button: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  buttonWrapper: {
    '&:first-child': {
      '& $button': {
        borderRadius: '10px 0px 0px 10px',
      },
    },
    '&:last-child': {
      '& $button': {
        borderRadius: '0px 10px 10px 0px',
      },
    },
    '&:not(:last-child):not(:first-child)': {
      '& $button': {
        borderRadius: 0,
      },
    },
  },
  errorText: {
    fontSize: '14px',
    color: red['500'],
  },
});

const getButtonStyles = (type) => {
  const common = {
    height: 54,
    color: '#fff',
  };
  switch (type) {
    case ELECTRICITY:
      return {
        style: {
          ...common,
          backgroundColor: '#2699fb',
        },
        selected: {
          backgroundColor: '#2685e1',
          boxShadow: '-2px 0px 0px 0.15rem rgba(37, 130, 220,.5)',
        },
        avatar: electricityMeterAvatar,
      };
    case GAS:
      return {
        style: {
          ...common,
          backgroundColor: '#f38f31',
        },
        selected: {
          backgroundColor: '#e18031',
          boxShadow: '0px 0px 0px 0.15rem rgba(220, 125, 48,.5)',
        },
        avatar: gasMeterAvatar,
      };
    case SOLAR:
      return {
        style: {
          ...common,
          backgroundColor: '#ffbb3c',
        },
        selected: {
          backgroundColor: '#f7ac20',
          boxShadow: '2px 0px 0px 0.15rem rgba(239, 148, 12,.5)',
        },
        avatar: solarMeterAvatar,
      };
    default:
      throw new Error('Unhandled meter type');
  }
};

class MeterTypeButton extends ValidatorComponent {
  errorText() {
    const { classes } = this.props;
    const { isValid } = this.state;
    if (isValid) {
      return null;
    }
    return (
      <div className={classes.errorText}>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      classes,
      selectedType,
      onTypeChange,
      meterTypes,
    } = this.props;
    return (
      <React.Fragment>
        <Typography variant="caption" style={{ padding: '10px 0px' }}>Select type of meter</Typography>
        <Grid container justify="center" style={{ width: '100%', padding: '10px 0px' }}>
          {
              meterTypes.map((type) => {
                const style = getButtonStyles(type.key);
                return (
                  <Grid key={type.key} item xs className={classes.buttonWrapper}>
                    <Button
                      fullWidth
                      className={classes.button}
                      key={type.key}
                      color="primary"
                      onClick={() => onTypeChange(type.key)}
                      style={selectedType === type.key ? { ...style.style, ...style.selected } : style.style}
                    >
                      <Avatar alt="Logo" src={style.avatar} className={classes.avatar} />
                      {type.value}
                    </Button>
                  </Grid>
                );
              })
            }
        </Grid>
        {this.errorText()}
      </React.Fragment>
    );
  }
}


MeterTypeButton.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedType: PropTypes.string.isRequired,
  meterTypes: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  onTypeChange: PropTypes.func.isRequired,
};

MeterTypeButton.defaultProps = {
  meterTypes: HUMAN_READABLE_METER_TYPES,
  ...ValidatorComponent.defaultProps,
};

export default withStyles(styles)(MeterTypeButton);
