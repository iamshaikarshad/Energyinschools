import React from 'react';
import PropTypes from 'prop-types';
import { ValidatorComponent } from 'react-form-validator-core';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';

const styles = theme => ({
  root: {
    width: '100%',
  },
  imageItemContainer: {
    padding: theme.spacing(0.5),
    borderRadius: '10px',
    margin: theme.spacing(0.5),
    cursor: 'pointer',
  },
  imageItem: {
    backgroundSize: '50% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    height: '50px',
    width: '100%',
    [theme.breakpoints.only('sm')]: {
      backgroundSize: '70% 100%',
    },
    [theme.breakpoints.only('xs')]: {
      backgroundSize: '100% 100%',
    },
  },
  label: {
    width: '100%',
    textAlign: 'center',
    fontSize: '12px',
    padding: theme.spacing(0.5),
  },
});

const SELECT_MODE = Object.freeze({
  singular: 'singular',
  plural: 'plural',
});

const red500 = red['500'];

const ERROR_STYLE = {
  fontSize: '14px',
  color: red500,
};

class ButtonsSelect extends ValidatorComponent {
  onClick = button => () => {
    const { onSubmit, mode } = this.props;
    const currentValue = button.value;
    switch (mode) {
      case SELECT_MODE.plural: {
        const { value } = this.state;
        const valueCopy = [...value];
        if (!valueCopy.includes(currentValue)) {
          valueCopy.push(currentValue);
        } else {
          const currentValueIndex = valueCopy.findIndex(item => item === currentValue);
          valueCopy.splice(currentValueIndex, 1);
        }
        onSubmit(valueCopy);
        break;
      }
      case SELECT_MODE.singular:
      default: {
        onSubmit(currentValue);
      }
    }
  }

  getButtonIsSelected = (button) => {
    const { mode } = this.props;
    const { value } = this.state;
    const currentValue = button.value;
    switch (mode) {
      case SELECT_MODE.plural: {
        return value.includes(currentValue);
      }
      case SELECT_MODE.singular:
      default: {
        return value === currentValue;
      }
    }
  }

  errorText() {
    const { isValid } = this.state;
    if (isValid) {
      return null;
    }
    return (
      <div style={ERROR_STYLE}>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      classes, buttons, useLabels, gridSize,
    } = this.props;
    return (
      <div className={classes.root} ref={(node) => { this.input = node; }}>
        <Grid container className={classes.selectContainer}>
          {
            buttons.map((button) => {
              const buttonIsSelected = this.getButtonIsSelected(button);
              return (
                <Grid
                  container
                  key={button.value}
                  item
                  xs={gridSize.xs}
                  sm={gridSize.sm || gridSize.xs}
                  md={gridSize.md || gridSize.xs}
                  lg={gridSize.lg || gridSize.xs}
                  onClick={this.onClick(button)}
                >
                  <Grid
                    container
                    className={classes.imageItemContainer}
                    style={
                      {
                        border: buttonIsSelected ? '1px solid rgb(0, 191, 255)' : 'none',
                      }
                    }
                  >
                    <Typography className={classes.imageItem} style={{ backgroundImage: `url(${button.icon})` }} />
                    {useLabels && (
                      <Typography className={classes.label}>
                        {button.label}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              );
            })
          }
        </Grid>
        {this.errorText()}
      </div>
    );
  }
}

ButtonsSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    icon: PropTypes.string,
  })),
  useLabels: PropTypes.bool,
  mode: PropTypes.string,
  gridSize: PropTypes.shape({
    xs: PropTypes.number.isRequired,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
  }),
  onSubmit: PropTypes.func.isRequired,
};

ButtonsSelect.defaultProps = {
  ...ValidatorComponent.defaultProps,
  mode: SELECT_MODE.singular,
  buttons: [],
  useLabels: false,
  gridSize: {
    xs: 3,
    sm: 3,
    md: 3,
    lg: 3,
  },
};

export default withStyles(styles)(ButtonsSelect);
