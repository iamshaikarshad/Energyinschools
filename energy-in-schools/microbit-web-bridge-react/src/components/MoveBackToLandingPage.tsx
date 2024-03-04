import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

const styles = theme => ({
  btn: {
    position: 'fixed' as 'fixed',
    zIndex: 100,
    width: 144,
    top: 35,
    left: 0,
    height:36,
    borderRadius: 4,
    backgroundColor: '#0177c9',
    color: '#fff',
  },
  right: {
    right: '0%',
    justifyContent: 'flex-start',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    left: 'unset',
  },
  left: {
    left: '0%',
    justifyContent: 'flex-end',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    right: 'unset',
  },
  buttonContent: {
    position: 'absolute' as 'absolute',
    top: 6,
    fontWeight: 500,
    fontSize: 14,
    fontFamily: "SamsungFont",
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase' as 'uppercase',
  },
});

const MoveBackToLandingPage = ({ direction, classes, label, landingUrl }) => {

  return (
    <>
      <a className={`${classes.btn} ${
          direction === 'right' ? classes.right : classes.left
        }`} href={landingUrl}><span className={classes.buttonContent}><ChevronLeft />{label}</span></a>
    </>
  );
};

export default withStyles(styles)(MoveBackToLandingPage);
