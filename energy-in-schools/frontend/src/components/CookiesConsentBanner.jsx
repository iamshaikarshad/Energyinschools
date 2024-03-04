import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles/index';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import CookiesConsentStorageService from '../utils/CookiesConsentStorageService';

import ReactGAService from '../utils/ReactGAManager';

import { GOOGLE_ANALYTICS_TRACKER_ID } from '../constants/config';

const styles = theme => ({
  root: {},
  snackBarRoot: {
    width: '100%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  snackbarContentRoot: {
    width: '100%',
    padding: '6px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: 'rgb(56, 56, 56)',
    borderRadius: 0,
  },
  snackbarContentMessage: {
    width: '100%',
  },
  messageRoot: {
    position: 'relative',
    width: '100%',
  },
  messageTitle: {},
  messageContent: {
    padding: '0px 8px',
    textAlign: 'left',
    fontSize: 16,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
    [theme.breakpoints.up('lg')]: {
      textAlign: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  messageContentTextItem: {
    '&:first-child': {
      [theme.breakpoints.up('lg')]: {
        display: 'block',
      },
    },
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    top: -10,
    right: -20,
    color: 'inherit',
  },
  icon: {
    fontSize: 20,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  actionButton: {
    fontSize: 14,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  link: {
    color: 'rgb(0, 188, 212)',
  },
});

class CookiesConsentBanner extends PureComponent {
  componentDidMount() {
    this.checkForUserConsent();
  }

  onAccept = () => {
    const { handleClose } = this.props;
    CookiesConsentStorageService.setInfo({
      accepted: true,
      lastCheckedAt: moment().format(),
    });
    this.enableCookies();
    handleClose();
  }

  onDecline = () => {
    const { handleClose } = this.props;
    CookiesConsentStorageService.setInfo({
      accepted: false,
      lastCheckedAt: moment().format(),
    });
    handleClose();
  }

  onClose = (event, reason) => {
    const { handleClose } = this.props;
    if (reason === 'clickaway') {
      return;
    }
    handleClose();
  }

  enableCookies = () => {
    ReactGAService.initialize(GOOGLE_ANALYTICS_TRACKER_ID);
  }

  checkForUserConsent = () => {
    if (!localStorage) return;
    const consentInfo = CookiesConsentStorageService.getInfo();
    const accepted = consentInfo ? consentInfo.accepted : null;
    if (isNil(accepted)) {
      const { handleOpen } = this.props;

      handleOpen();
      return;
    }
    if (accepted) {
      this.enableCookies();
    }
  }

  render() {
    const { classes, cookiesConsentBannerOpened } = this.props;

    return (
      <div className={classes.root}>
        <Snackbar
          key="cookies-consent-snackbar"
          classes={{ root: classes.snackBarRoot }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={cookiesConsentBannerOpened}
          onClose={this.onClose}
        >
          <SnackbarContent
            classes={{ root: classes.snackbarContentRoot, message: classes.snackbarContentMessage }}
            aria-describedby="cookies-consent-snackbar-content"
            message={(
              <div id="client-snackbar" className={classes.messageRoot}>
                <IconButton key="close" aria-label="close" color="inherit" onClick={this.onClose} className={classes.closeButton}>
                  <CloseIcon className={classes.icon} />
                </IconButton>
                <Typography className={classes.messageContent}>
                  <span className={classes.messageContentTextItem}>This website now uses cookies to provide us with anonymised statistics on which parts of the website are used most, and which parts are never seen by anyone! </span>
                  <span className={classes.messageContentTextItem}>This is part of our evaluation and will help us improve the website as we add more schools. </span>
                  <span className={classes.messageContentTextItem}>
                    See <a href="/terms-and-conditions" target="_blank" className={classes.link}>Terms and Conditions</a>&#160;and&#160;<a href="/privacy-policy" target="_blank" className={classes.link}>Privacy Policy</a>
                  </span>
                </Typography>
                <Typography className={classes.actions}>
                  <Button key="accept" aria-label="accept" color="primary" className={classes.actionButton} style={{ marginRight: 25 }} onClick={this.onAccept}>
                    Accept
                  </Button>
                  <Button key="decline" aria-label="decline" color="secondary" className={classes.actionButton} onClick={this.onDecline}>
                    Reject
                  </Button>
                </Typography>
              </div>
            )}
          />
        </Snackbar>
      </div>
    );
  }
}

CookiesConsentBanner.propTypes = {
  classes: PropTypes.object.isRequired,
  cookiesConsentBannerOpened: PropTypes.bool.isRequired,
  handleOpen: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withStyles(styles)(CookiesConsentBanner);
