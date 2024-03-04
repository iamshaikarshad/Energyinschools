import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Warning from '@material-ui/icons/Warning';

import microbitIcon from '../../images/microbit.svg';
import block1 from '../../images/editor_block1.png';
import block2 from '../../images/editor_block2.png';
import block3 from '../../images/editor_block3.png';

const styles = theme => ({
  paperRoot: {
    borderRadius: 7,
    minWidth: 812,
    [theme.breakpoints.down('sm')]: {
      minWidth: 450,
    },
  },
  titleRoot: {
    backgroundColor: theme.palette.primary.main,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
    padding: 0,
  },
  microbitTitle: {
    borderLeft: '1px solid #fff',
    paddingLeft: 10,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 500,
  },
  microbitIcon: {
    width: 114,
    height: 20,
    borderRadius: 0,
  },
  contentHeader: {
    paddingBottom: 40,
  },
  contentItem: {
    padding: 40,
    borderTop: '1px solid #00bcd4',
    [theme.breakpoints.down('sm')]: {
      paddingRight: 20,
      paddingLeft: 20,
    },
  },
  contentText: {
    lineHeight: '1.63',
    letterSpacing: '0.3px',
  },
  button: {
    borderRadius: 17,
    marginTop: -58,
    marginBottom: 30,
    width: 178,
    height: 34,
    margin: 'auto',
  },
  infoBlockRoot: {
    padding: 25,
    borderRadius: 6,
    marginTop: 20,
    backgroundColor: 'rgba(0,188,212, 0.15)',
  },
  infoBlockAvatar: {
    borderRadius: 0,
    width: 52,
    height: 38,
  },
  infoBlockTitle: {
    color: theme.palette.primary.main,
  },
  img1: {
    width: 462,
    margin: '20px 0',
    [theme.breakpoints.down('sm')]: {
      width: 370,
    },
  },
  img2: {
    width: 575,
    margin: '20px 0',
    [theme.breakpoints.down('sm')]: {
      width: 460,
    },
  },
  img3: {
    width: 248,
    margin: '20px 0',
    [theme.breakpoints.down('sm')]: {
      width: 200,
    },
  },
});

function MicrobitDialog(props) {
  const { classes, isOpened, onClose } = props;

  return (

    <Dialog
      open={isOpened}
      onClose={onClose}
      aria-labelledby="microbit-dialog-title"
      classes={{ paper: classes.paperRoot }}
      style={{ zIndex: 999999 }}
    >
      <DialogTitle id="microbit-dialog-title" disableTypography classes={{ root: classes.titleRoot }}>
        <Toolbar>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Avatar alt="Microbit" src={microbitIcon} className={classes.microbitIcon} />
                <Typography variant="h6" color="inherit" className={classes.microbitTitle}>
                  FAQ
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </DialogTitle>
      <DialogContent style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Grid container>
          <Grid container justify="center" className={classes.contentHeader}>
            <Typography variant="h4" color="primary">
              How to write a blocks program?
            </Typography>
          </Grid>

          <Grid container direction="column" className={classes.contentItem}>
            <Button variant="contained" color="primary" className={classes.button}>
              PACKAGE PURPOSE
            </Button>
            <Typography gutterBottom className={classes.contentText}>
              The Initialise package has been designed to assist the school Microbit administrator to initialise a Raspberry Pi with the id’s required.
              Each Raspberry Pi hold the school identification value and the identification value for the individual Raspberry Pi.
              The school identification value comes from a national database of schools using the Microbit project and should be issued to the school.
              The identification values for the Raspberry Pi’s is free format text and can be anything of the administrators making.
              A school that has more than 1 Raspberry Pi must make sure that each has a unique value.
            </Typography>
          </Grid>

          <Grid container direction="column" className={classes.contentItem}>
            <Button variant="contained" color="primary" className={classes.button}>
              PACKAGE BLOCKS
            </Button>
            <Typography gutterBottom className={classes.contentText}>
              The initialise package has 2 blocks.
            </Typography>
            <img alt="Editor block" src={block1} className={classes.img1} />
            <Typography gutterBottom className={classes.contentText}>
              The init block takes text input and sets the type from the drop down list. Types are school or raspberry. This is an insert, not an overwrite.
              Clear Initialisation cleans all initialisation (school id and Raspberry Pi Id) from the Raspberry Pi. The initialisation does not overwrite, so if a unit needs to have init data changed. The unit must first have a clear initialisation run on it.
            </Typography>
          </Grid>

          <Grid container direction="column" className={classes.contentItem}>
            <Button variant="contained" color="primary" className={classes.button}>
              BLOCK USAGE
            </Button>
            <img alt="Editor block" src={block2} className={classes.img2} />
            <Typography gutterBottom className={classes.contentText}>
              Write a program (as above) to initialise the Raspberry Pi with the school and the raspberry Pi identification values. (as above)
              Pressing button A will initialise the Raspberry Pi for the school Id, and B for the Raspberry Pi.
              Once a raspberry Pi has been initialised the blocks to initialise them will only return the current values. This will not overwrite the initialisation in the Raspberry Pi. To overwrite the initialisation the Raspberry Pi needs to have its initialisation cleared first.
            </Typography>
            <img alt="Editor block" src={block3} className={classes.img3} />
            <Typography gutterBottom className={classes.contentText}>
              Should the Raspberry Pi ever need to be reset and have the initialisation cleared, the clear initialisation will do this.
              If you wish to clear the initialisation and reinitialise in the same block process, make sure you have at least a 1 second pause block between the clear and the initialise.
              <br /> Note: The Raspberry Pi needs to be connected to a Microbit bridge running a hub program.
            </Typography>
            <CardHeader
              avatar={<Warning color="primary" />}
              title="You can see this guide again at “Block editor” page by clicking “FAQ” button."
              classes={{ root: classes.infoBlockRoot, title: classes.infoBlockTitle }}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

MicrobitDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(MicrobitDialog);
