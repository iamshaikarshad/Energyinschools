import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
// @ts-ignore
import ConnectionGIF from '../images/connection.gif';
// @ts-ignore
import Flash from '../images/flash.gif';
// @ts-ignore
import Flashing from '../images/flashing.gif';
// @ts-ignore
import AfterFlash from '../images/afterFlash.gif';
// @ts-ignore
import SmileFace from '../images/smileFace.gif';

interface Props {
  activeStep: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorialImage: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      background: '#fff',
      zIndex: 200000,
      width: 450,
      height: 316,
      top: 83,
      left: 'calc(50% - 225px)',
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%'
    }
  })
);

const TutorialImage: React.FunctionComponent<Props> = ({ activeStep }) => {
  const classes = useStyles({});

  function getImagePath() {
    switch (activeStep) {
      case 0:
        return ConnectionGIF;
      case 1:
        return Flash;
      case 2:
        return Flashing;
      case 3:
        return AfterFlash;
      case 4:
        return SmileFace;
      default:
        return true;
    }
  }

  return (
    <div className={classes.tutorialImage}>
      <img className={classes.image} src={getImagePath()} alt="" />
    </div>
  );
};

export default TutorialImage;
