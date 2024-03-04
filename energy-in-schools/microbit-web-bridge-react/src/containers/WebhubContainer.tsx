import React, { Component } from 'react';
import { WebUSB, DAPLink } from 'dapjs';
import HubsAPIService from '../services/api/hubs';
import { SerialHandler } from '../services/SerialHandler';
import * as $ from 'jquery';
import WebhubImage from '../components/WebhubImage';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles, Theme } from '@material-ui/core/styles';
import Sidebar from '../components/Sidebar';
import MoveBackToLandingPage from '../components/MoveBackToLandingPage';
import { staging } from '../constants/config';
import logger from '../libs/logger';
import { terminalMsg, historyMsg } from '../services/Debug';
import Tutorial from '../components/Tutorial';
import LiveHelp from '@material-ui/icons/LiveHelp';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import clsx from 'clsx';
import * as constants from '../constants';

interface AppProps {
  classes: any;
}

interface AppState {
  selectedHubUID: string;
  terminalMessages: string[];
  historyMessages: string[];
  flashing: boolean;
  helloPackageReceived: boolean;
  connected: boolean;
  status: string;
  tutorial: boolean;
  errorCaught: boolean;
}

const styles = (theme: Theme) => ({
  controls: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center'
  },
  buttonContainer: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center'
    }
  },
  btn: {
    color: '#0177c9',
    border: '1px solid #0177c9',
    width: 138,
    height: 50,
    borderRadius: 8,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 10,
      width: '100%'
    },
    '&:hover': {
      backgroundColor: '#0177c9',
      color: '#fff'
    }
  },
  tutorialBtn: {
    position: 'relative' as 'relative',
    color: '#0177c9',
    zIndex: 102,
    '&.open': {
      [theme.breakpoints.down('xs')]: {
        position: 'fixed' as 'fixed',
        top: 0,
        right: 20
      }
    }
  },
  btnFlash: {
    margin: 10,
    [theme.breakpoints.down('xs')]: {
      marginTop: 0
    }
  },
  status: {
    textAlign: 'center' as 'center'
  }
});

class WebhubContainer extends Component<AppProps, AppState> {
  private targetDevice: DAPLink;
  private serialNumber: string;
  private serialHandler: SerialHandler;
  private numberOfConnectionAttempts: number = 0;
  private interval: any;

  state: AppState = {
    selectedHubUID: '-1',
    terminalMessages: [''],
    historyMessages: [''],
    flashing: false,
    helloPackageReceived: false,
    connected: false,
    status: constants.DEFAULT_STATUS,
    tutorial: false,
    errorCaught: false
  };

  async componentDidMount() {
    this.getTranslations();
    navigator.usb.addEventListener('disconnect', device => {
      // check if the bridging micro:bit is the one that was disconnected
      if (device.device.serialNumber === this.serialNumber) this.disconnect();
      this.setStatus(constants.DEFAULT_STATUS);
    });
    window.addEventListener('terminalMsg', this.newTerminalMessageHandler);
    window.addEventListener('historyMsg', this.newHistoryMessageHandler);
    window.addEventListener(
      'helloPackageReceived',
      this.onHelloPackageReceived
    );
  }

  componentWillUnmount() {
    window.removeEventListener('terminalMsg', this.newTerminalMessageHandler);
    window.removeEventListener('historyMsg', this.newHistoryMessageHandler);
    window.removeEventListener(
      'helloPackageReceived',
      this.onHelloPackageReceived
    );
  }

  async getTranslations() {
    // if poll_updates is false and we haven't already grabbed the translations file, return
    if (
      !constants.hub_variables['translations']['poll_updates'] &&
      Object.entries(constants.hub_variables['translations']['json']).length !==
        0
    )
      return;

    terminalMsg('Checking for translations updates');
    logger.info('Checking for translations updates');

    $.ajax({
      url: constants.hub_variables['translations']['url'],
      method: 'GET',
      dataType: 'JSON',
      cache: false,
      timeout: 10000,
      error: error => {
        terminalMsg(`Error receiving translations`);
        logger.error(error);
      },
      success: response => {
        if (
          constants.hub_variables['translations']['json'] === {} ||
          response['version'] !==
            constants.hub_variables['translations']['json']['version']
        ) {
          terminalMsg(`Translations have updated! (v${response['version']})`);
          constants.hub_variables['translations']['json'] = response;
        }
      }
    });

    // poll the translations file for updates periodically
    setTimeout(
      this.getTranslations,
      constants.hub_variables['translations']['poll_time']
    );
  }

  selectDevice = (): Promise<USBDevice> => {
    return new Promise((resolve, reject) => {
      navigator.usb
        .requestDevice({
          filters: [{ vendorId: 0x0d28, productId: 0x0204 }]
        })
        .then(device => {
          resolve(device);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  onHelloPackageReceived = () => {
    this.setState((prevState: AppState) => ({
      ...prevState,
      helloPackageReceived: true
    }));
  };

  checkConnection = (): void => {
    if (
      !this.state.helloPackageReceived &&
      this.numberOfConnectionAttempts <
        constants.MAX_NUMBER_OF_CONNECTION_ATTEMPTS
    ) {
      this.targetDevice.setSerialBaudrate(
        constants.hub_variables.dapjs.baud_rate
      );
      this.numberOfConnectionAttempts++;
    } else {
      // if we not get successful connection after MAX_NUMBER_OF_CONNECTION_ATTEMPTS times, show user error message
      if (!this.state.helloPackageReceived) {
        this.setStatus(
          'Package getting error. Please reconnect device and try again'
        );
      }
      this.numberOfConnectionAttempts = 0;
      clearInterval(this.interval);
    }
  };

  disconnect = () => {
    const ERROR_MESSAGE =
      "Couldn't safely disconnect from the micro:bit. This can happen if the micro:bit was unplugged before being disconnected, all is safe!";

    // reset hub variables
    constants.hub_variables['school_id'] = '';
    constants.hub_variables['pi_id'] = '';

    // destroy SerialHandler
    this.serialHandler = null;
    this.serialNumber = '';

    // try to disconnect from the target device
    try {
      this.targetDevice.removeAllListeners();
      this.targetDevice.stopSerialRead();
      this.targetDevice.disconnect().catch(e => {
        console.log(e, ERROR_MESSAGE);
      });
    } catch (e) {
      console.log(e, ERROR_MESSAGE);
    }

    this.targetDevice = null;
    this.setStatus(constants.DEFAULT_STATUS); // destroy DAPLink
    this.setState((prevState: AppState) => ({
      ...prevState,
      connected: false,
      helloPackageReceived: false
    }));
  };

  connect = (device: USBDevice): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (this.targetDevice) this.targetDevice.stopSerialRead();

      // Connect to device
      const transport = new WebUSB(device);
      this.targetDevice = new DAPLink(transport);
      this.serialNumber = device.serialNumber;

      // Ensure disconnected
      this.targetDevice.disconnect();

      this.targetDevice
        .connect()
        .then(() =>
          this.targetDevice.setSerialBaudrate(
            constants.hub_variables.dapjs.baud_rate
          )
        )
        .then(() => this.targetDevice.getSerialBaudrate())
        .then(baud => {
          this.targetDevice.startSerialRead(
            constants.hub_variables.dapjs.serial_delay
          );
          this.serialHandler = new SerialHandler(
            this.targetDevice,
            constants.hub_variables,
            baud
          );
          this.setState(prevState => ({
            ...prevState,
            connected: true
          }));
          resolve(
            `Connected to ${
              device.productName !== '' ? device.productName : 'micro:bit'
            }`
          );
        })
        .catch(err => {
          if (err instanceof DOMException && err.code === 19) {
            reject(
              'Failed to connect: Please close any other browser tabs which have been used for micro:bit coding and try again.'
            );
          } else {
            reject(`Failed to connect: ${err}`);
          }
        });
    });
  };

  flashDevice = (device: USBDevice): Promise<string> => {
    return new Promise((resolve, reject) => {
      constants.hub_variables['school_id'] = '';
      constants.hub_variables['pi_id'] = '';

      if (this.targetDevice) this.targetDevice.stopSerialRead();

      HubsAPIService.getHubFirmware(
        this.state.selectedHubUID,
        device.serialNumber
      )
        .then((firmware: ArrayBuffer) => {
          // Connect to device
          const transport = new WebUSB(device);
          this.targetDevice = new DAPLink(transport);

          // Ensure disconnected
          this.targetDevice.disconnect();

          // Event to monitor flashing progress
          this.targetDevice.on(DAPLink.EVENT_PROGRESS, progress => {
            this.setState(prevState => ({
              ...prevState,
              flashing: true
            }));
            this.setStatus(`Flashing: ${Math.round(progress * 100)}%`);
          });

          // Push binary to board
          return this.targetDevice
            .connect()
            .then(() => {
              logger.info('Flashing');
              historyMsg('Flashing');
              return this.targetDevice.flash(firmware);
            })
            .then(() => {
              logger.info('Finished flashing! Reconnect micro:bit');
              historyMsg('Finished flashing! Reconnect micro:bit');
              resolve('Finished flashing! Reconnect micro:bit');
              this.setState(prevState => ({
                ...prevState,
                flashing: false
              }));
              return this.targetDevice.disconnect();
            })
            .catch(err => {
              if (err instanceof DOMException && err.code === 19) {
                this.targetDevice.disconnect();
                reject(
                  'Error flashing: Please close any other browser tabs which have been used for micro:bit coding and try again.'
                );
              } else {
                reject(`Error flashing: ${err}`);
              }
              this.setState(prevState => ({
                ...prevState,
                flashing: false
              }));
              logger.error(`Error flashing: ${err}`);
            });
        })
        .catch(() => {
          historyMsg('Failed to get hub firmware');
          reject('Failed to get hub firmware');
        });
    });
  };

  connectButtonHandler = () => {
    if (!this.state.connected) {
      this.selectDevice()
        .then((device: USBDevice) => {
          this.setStatus('Connecting...');
          return this.connect(device);
        })
        .then(message => {
          // connectButton.text("Disconnect");
          // additionalInfo.text('Please, wait till you see the smile face');
          this.interval = window.setInterval(this.checkConnection, 2500);
          this.setStatus(message);
        })
        .catch(error => {
          if (typeof error === 'string') this.setStatus(error);
        });
    } else this.disconnect();
  };

  setStatus = (status: string) => {
    this.setState((prevState: AppState) => ({
      ...prevState,
      status
    }));
  };

  flashButtonHandler = () => {
    this.selectDevice()
      .then((device: USBDevice) => {
        return this.flashDevice(device);
      })
      .then(message => {
        this.setStatus(message);
      })
      .catch(error => {
        if (typeof error === 'string') this.setStatus(error);
      });
  };

  newHistoryMessageHandler = (e: CustomEvent) => {
    this.setState((prevState: AppState) => ({
      ...prevState,
      historyMessages: [...prevState.historyMessages, e.detail.historyMsg]
    }));
  };

  newTerminalMessageHandler = (e: CustomEvent) => {
    this.setState(prevState => ({
      ...prevState,
      terminalMessages: [...prevState.terminalMessages, e.detail.terminalMsg]
    }));
  };

  closeTutorial = () => {
    this.setState((prevState: AppState) => ({
      ...prevState,
      tutorial: false
    }));
  };

  render() {
    const { classes } = this.props;
    return (
      <div id="main">
        <Container maxWidth="xl">
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} className={classes.controls}>
              <WebhubImage isSmileFace={this.state.helloPackageReceived} />
              <Typography
                variant="h5"
                component="span"
                gutterBottom
                className={classes.status}
              >
                {this.state.status}

                <IconButton
                  className={clsx(classes.tutorialBtn, {
                    open: this.state.tutorial
                  })}
                  onClick={() =>
                    this.setState(prevState => ({
                      ...prevState,
                      tutorial: !prevState.tutorial
                    }))
                  }
                >
                  {!this.state.tutorial ? <LiveHelp /> : <Close />}
                </IconButton>
              </Typography>
              <div id="additionalInfo" />
              <div className={classes.buttonContainer}>
                <Button
                  id="connect-button"
                  className={classes.btn}
                  variant="outlined"
                  onClick={this.connectButtonHandler}
                  disabled={this.state.flashing}
                >
                  {this.state.connected ? 'Disconnect' : 'Connect'}
                </Button>
                <Button
                  id="flash-button"
                  className={`${classes.btn} ${classes.btnFlash}`}
                  variant="outlined"
                  onClick={this.flashButtonHandler}
                  disabled={this.state.flashing}
                >
                  Flash
                </Button>
              </div>
            </Grid>
          </Grid>
          <Sidebar
            messages={this.state.historyMessages}
            label="history"
            direction="right"
          />
          <Sidebar
            messages={this.state.terminalMessages}
            label="terminal"
            direction="left"
          />
          <MoveBackToLandingPage
            label="Back"
            direction="left"
            landingUrl={staging}
          />
          {this.state.tutorial && (
            <Tutorial onTutorialClose={this.closeTutorial} />
          )}
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(WebhubContainer);
