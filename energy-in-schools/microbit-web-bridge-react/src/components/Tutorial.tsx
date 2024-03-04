import React, { useCallback } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles
} from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import USBIcon from '@material-ui/icons/Usb';
import FlashIcon from '@material-ui/icons/FlashOn';
import HubIcon from '@material-ui/icons/DeviceHub';
import SmileIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import StepConnector from '@material-ui/core/StepConnector';
import { StepIconProps } from '@material-ui/core/StepIcon';
import TutorialImage from './TutorialImage';

interface Props {
  onTutorialClose: () => void;
}

const ColorlibConnector = withStyles((theme: Theme) => ({
  alternativeLabel: {
    top: 22,
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  active: {
    '& $line': {
      backgroundColor: '#0077c9'
    }
  },
  completed: {
    '& $line': {
      backgroundColor: '#0077c9'
    }
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1
  }
}))(StepConnector);

const useColorlibStepIconStyles = makeStyles({
  root: {
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  active: {
    backgroundColor: '#0077c9',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)'
  },
  completed: {
    backgroundColor: '#0077c9'
  }
});

function ColorlibStepIcon(props: StepIconProps) {
  const classes = useColorlibStepIconStyles({});
  const { active, completed } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <USBIcon />,
    2: <FlashIcon />,
    3: <FlashIcon />,
    4: <HubIcon />,
    5: <SmileIcon />
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorial: {
      position: 'relative',
      zIndex: 101,
      marginTop: 65,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: 10
      }
    },
    overlay: {
      width: '100%',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255,255,255,0.5)',
      flexDirection: 'column',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        justifyContent: 'center'
      }
    },
    highlited: {
      zIndex: 20000,
      pointerEvents: 'none',
      [theme.breakpoints.down('xs')]: {
        zIndex: 1
      }
    },
    text: {
      textAlign: 'center' as 'center',
      marginBottom: 50
    },
    button: {
      marginRight: theme.spacing(1),
      backgroundColor: '#0177c9',
      color: '#fff',
      transition: 'all 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;',
      '&:hover': {
        backgroundColor: '#0177c9'
      },
      '&:disabled': {
        backgroundColor: '#fff'
      }
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    steper: {
      [theme.breakpoints.down('xs')]: {
        display: 'block'
      }
    }
  })
);

function getSteps() {
  return [
    'Connect microbit to your computer',
    'Flash microbit',
    'Wait for flashing',
    'Connect to Microbit',
    'Microbit is ready for usage'
  ];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return 'Connect a microbit (v1 or v2) to your computer via USB. If your microbit is already flashed with hub software then you can skip next two steps';
    case 1:
      return 'Click on Flash button; then select the microbit from the pop up menu and click "Connect"';
    case 2:
      return 'Wait for flashing to complete. When it`s finished you`ll see an unsmiling face';
    case 3:
      return 'Click on "Connect" button and select flashed microbit from the pop-up menu and "Connect". Wait until you see a smiley face on your microbit';
    case 4:
      return 'Microbit is ready for usage as hub';
    default:
      return '';
  }
}

const CustomizedSteppers: React.FunctionComponent<Props> = ({
  onTutorialClose
}) => {
  const classes = useStyles({});
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  React.useEffect(() => {
    if (activeStep === 5) {
      onTutorialClose();
    }
  }, [activeStep]);

  const handleNext = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }, []);

  return (
    <>
      <TutorialImage activeStep={activeStep} />
      <div className={classes.tutorial}>
        <div>
          <div className={classes.text}>
            <Typography className={classes.instructions}>
              {getStepContent(activeStep)}
            </Typography>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                {activeStep === steps.length - 1 ? 'Close' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
        <Stepper
          alternativeLabel
          className={classes.steper}
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map(label => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    </>
  );
};

export default CustomizedSteppers;
