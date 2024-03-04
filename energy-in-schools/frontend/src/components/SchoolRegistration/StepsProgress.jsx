import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepButton from '@material-ui/core/StepButton';

import { without } from 'lodash';

const styles = theme => ({
  root: {
    width: '100%',
  },
  stepperRoot: {
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  stepLabelContainerHidden: {
    display: 'none',
  },
});

const getStepIsDisabled = (currStep, steps, isLastStep) => {
  if (!isLastStep) return !currStep.completed;
  const lastStepIsAvailable = without(steps, currStep).every(step => step.completed);
  return !lastStepIsAvailable;
};

const StepsProgress = (props) => {
  const {
    classes, steps, activeStep, showStepLabel, handleNavigateToStep,
  } = props;

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep - 1} classes={{ root: classes.stepperRoot }} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.step} disabled={getStepIsDisabled(step, steps, index === steps.length - 1)}>
            <StepButton
              onClick={handleNavigateToStep(step.step)}
              completed={step.completed}
            >
              <StepLabel classes={{ labelContainer: showStepLabel ? null : classes.stepLabelContainerHidden }}>{step.label}</StepLabel>
            </StepButton>
          </Step>
        ))
        }
      </Stepper>
    </div>
  );
};

StepsProgress.propTypes = {
  classes: PropTypes.object.isRequired,
  steps: PropTypes.array.isRequired,
  activeStep: PropTypes.number.isRequired,
  showStepLabel: PropTypes.bool,
  handleNavigateToStep: PropTypes.func.isRequired,
};

StepsProgress.defaultProps = {
  showStepLabel: false,
};

export default withStyles(styles)(StepsProgress);
