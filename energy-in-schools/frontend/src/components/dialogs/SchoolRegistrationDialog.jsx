import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { orderBy } from 'lodash';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { withStyles } from '@material-ui/core/styles/index';
import withMobileDialog from '@material-ui/core/withMobileDialog';

import FirstStep from '../SchoolRegistration/Steps/FirstStep';
import SecondStep from '../SchoolRegistration/Steps/SecondStep';
import ThirdStep from '../SchoolRegistration/Steps/ThirdStep';
import FourthStep from '../SchoolRegistration/Steps/FourthStep';

import StepsProgress from '../SchoolRegistration/StepsProgress';

const styles = theme => ({
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '20px auto',
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 15,
  },
  resourceIcon: {
    width: 30,
    height: 35,
  },
});

const DIALOG_TIMEOUT = 500;

const START_STEP_NUMBER = 1;

const Transition = React.forwardRef((props, ref) => (<Slide ref={ref} direction="up" {...props} mountOnEnter unmountOnExit timeout={DIALOG_TIMEOUT} />));

class SchoolRegistrationDialog extends React.Component {
  state = {
    currentStep: START_STEP_NUMBER,
  }

  dataStore = {};

  regRequestData = {};

  commonStepsProps = {
    getStoreData: this.getStoreData(),
    updateStoreData: this.updateStoreData(),
    onPrev: () => this.onPrevStep(),
    onSubmit: () => this.onNextStep(),
  };

  steps = [
    {
      name: 'step1',
      step: 1,
      stepperLabel: 'Step 1',
      component: (
        <FirstStep
          onRef={this.onRef('step1')}
          stepName="step1"
          {...this.commonStepsProps}
        />
      ),
    },
    {
      name: 'step2',
      step: 2,
      stepperLabel: 'Step 2',
      component: (
        <SecondStep
          onRef={this.onRef('step2')}
          stepName="step2"
          {...this.commonStepsProps}
        />
      ),
    },
    {
      name: 'step3',
      step: 3,
      stepperLabel: 'Step 3',
      component: (
        <ThirdStep
          onRef={this.onRef('step3')}
          stepName="step3"
          {...this.commonStepsProps}
        />
      ),
    },
    {
      name: 'step4',
      step: 4,
      stepperLabel: 'Complete',
      component: (
        <FourthStep
          stepName="step4"
          {...this.commonStepsProps}
          onSubmit={() => this.onSubmit()}
        />
      ),
    },
  ];

  stepperData = orderBy(this.steps, ['step'], ['asc']).map(stepData => (
    {
      step: stepData.step,
      label: stepData.stepperLabel,
      completed: false,
    }
  ));

  onSubmit() {
    const { onSubmit } = this.props;
    onSubmit(this.regRequestData);
  }

  onNextStep() {
    const { currentStep } = this.state;
    const currentStepStepperData = this.stepperData.find(stepData => stepData.step === currentStep);
    if (currentStepStepperData) {
      currentStepStepperData.completed = true;
    }
    this.setState({ currentStep: currentStep + 1 });
  }

  onPrevStep() {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  }

  onRef(instanceName) {
    return (ref) => {
      this[instanceName] = ref;
    };
  }

  getStoreData() {
    return dataKey => this.dataStore[dataKey];
  }

  handleNavigateToStep = step => () => {
    const { currentStep } = this.state;
    if (step === currentStep) return;
    if (step > currentStep) {
      const currentStepData = this.steps.find(item => item.step === currentStep);
      const currentStepInstance = this[currentStepData.name];
      if (!currentStepInstance.isValid()) {
        currentStepInstance.onSubmitClick();
        return;
      }
      currentStepInstance.saveData();
    }
    this.goToStep(step);
  }

  goToStep(targetStep) {
    this.setState({ currentStep: targetStep });
  }

  renderStep = () => {
    const { currentStep } = this.state;
    const currentStepData = this.steps.find(stepData => stepData.step === currentStep);
    return currentStepData ? currentStepData.component : null;
  }

  updateStoreData() {
    return (name, data, regData) => {
      this.dataStore = {
        ...this.dataStore,
        [name]: data,
      };
      this.regRequestData = {
        ...this.regRequestData,
        ...regData,
      };
    };
  }

  render() {
    const {
      classes,
      fullScreen,
      title,
      isOpened,
      onClose,
      titleIcon,
    } = this.props;
    const { currentStep } = this.state;
    return (
      <Dialog
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        open={isOpened}
        onClose={onClose}
        aria-labelledby="school-registration-dialog-title"
        TransitionComponent={Transition}
        disableBackdropClick
      >
        <DialogTitle id="school-registration-dialog-title" style={{ padding: 0 }} disableTypography>
          <div className={classes.titleBlock}>
            <img src={titleIcon} alt="resource" className={classes.resourceIcon} />
            <Typography variant="h6" className={classes.dialogTitle}>{title}</Typography>
            <IconButton color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />
        </DialogTitle>
        <DialogContent classes={{ root: classes.dialogContent }}>
          <StepsProgress
            steps={this.stepperData}
            activeStep={currentStep}
            handleNavigateToStep={this.handleNavigateToStep}
            showStepLabel
          />
          {this.renderStep()}
        </DialogContent>
      </Dialog>
    );
  }
}

SchoolRegistrationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleIcon: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

SchoolRegistrationDialog.defaultProps = {
  title: 'New school account request',
  titleIcon: '',
};

export default compose(
  withStyles(styles),
  withMobileDialog(),
)(SchoolRegistrationDialog);
