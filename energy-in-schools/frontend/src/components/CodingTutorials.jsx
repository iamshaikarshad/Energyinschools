import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { NEW_PRIMARY_COLOR } from '../styles/stylesConstants';
import microbits from '../images/microbits-v2-and-v1.png';
import { TUTORIAL_LINKS } from '../constants/config';

const styles = theme => ({
  background: {
    backgroundColor: '#f2efed',
    marginBottom: 40,
  },
  title: {
    margin: '40px 0 10px 0',
    color: '#000',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    [theme.breakpoints.down('xs')]: {
      fontSize: 30,
    },
  },
  messageBlockTitle: {
    color: NEW_PRIMARY_COLOR,
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    margin: '20px 0 5px 0',
    fontSize: 24,
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  message: {
    fontFamily: 'Inter',
    fontWeight: 'normal',
    margin: '10px 0',
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  microbitImage: {
    width: '100%',
    maxWidth: 800,
    margin: '16px 0',
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: NEW_PRIMARY_COLOR,
    '&:hover': {
      color: `${NEW_PRIMARY_COLOR}bb`,
    },
  },
});

class CodingTutorials extends React.PureComponent {
  render() {
    const { classes } = this.props;

    return (
      <Grid container justify="center" className={classes.background}>
        <Grid item direction="column" container xs={10} md={9}>
          <h1 className={classes.title}>Tutorials</h1>
          <h2 className={classes.messageBlockTitle}>Overview</h2>
          <p className={classes.message}>
            The following tutorials are also included in the zip files available on the
            “<Link className={classes.link} to="/lesson-plans">lesson plans</Link>” page and are
            referenced in the lesson plans. Following teacher feedback we have also included them here together with
            links to the code used in the tutorials. It’s best to try to build the code yourself in the editor, but
            it’s always good to have access to “one-we-made-earlier”.
          </p>
          <p className={classes.message}>
            Some tutorials only work with v2 microbits (tagged “v2 only”). The v2 is the one on the left below.
            It has more things on the back and says v2 on the bottom right.
          </p>
          <p className={classes.message}>
            Some tutorials need a Neopixel light strip. If you haven’t got one you can get
            them <a className={classes.link} href="https://redfernelectronics.co.uk/product/sparkle-baton/">here</a>.
          </p>
          <p className={classes.message}>
            The tutorials contain one or more coding tasks.
            The tasks are summarised below and have a difficulty rating of 1 to 5 stars.
          </p>
          <img src={microbits} alt="Microbits v2 and v1" className={classes.microbitImage} />
          <h2 className={classes.messageBlockTitle}>Micro:bit to monitor electricity usage</h2>
          <p className={classes.message}>
            The micro:bit has a digital compass - an input sensor that detects magnetic fields.
            Our partners at Lancaster University have used this sensor to help detect the AC fluctuation
            of the local magnetic field around the micro:bit, and approximate the power consumption of nearby
            electrical current flow based on this electromagnetic field. This means that when the micro:bit is
            blue-tacked onto the back of a plug it can roughly measure how much power the device connected to
            the plug is using; and whether the device is on or off.
          </p>
          <p className={`${classes.message} ${classes.italic}`}>
            Important: when measuring usage, keep the micro:bit away from other things that can affect the magnetic
            field – such as other electrical devices and wires. Also ignore anything the micro:bit reports before it
            is blue-tacked to the plug and left to settle for a few seconds. When the micro:bit is moving around it
            will detect changes in the earth’s magnetic field.
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.electricityMonitoring}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <strong>Task 1: Electricity counting on/off events ***</strong><br />
            The micro:bit attached to a plug with blue-tack counts how many time a device is turned on.<br />
            <Link className={classes.link} to="/editor/on-off-events">
              Open editor with pre-loaded code
            </Link>
          </p>
          <p className={classes.message}>
            <strong>Task 2: Electricity measurement (simple) **</strong><br />
            The micro:bit attached to a plug with blue-tack reports the electricity usage of a device and shows
            whether the device is on/off with change in icon.<br />
            <Link className={classes.link} to="/editor/simple-measurement">
              Open editor with pre-loaded code
            </Link>
          </p>
          <p className={classes.message}>
            <strong>Task 3 (V2 only!): Electricity measurement and logging ***</strong><br />
            The micro:bit attached to a plug with blue-tack logs the watts used by a device to the micro:bit’s
            datalog every second. The data can then be extracted and analysed by pupils.<br />
            <Link className={classes.link} to="/editor/measurement">
              Open editor with pre-loaded code
            </Link>
          </p>
          <p className={classes.message}>
            <strong>Task 4 (V2 only!): Plug state monitoring and logging***</strong><br />
            The micro:bit attached to a plug with blue-tack logs the number of times a device is turned on and
            report this to the micro:bit’s datalog. The data can then be extracted and analysed by pupils.<br />
            <Link className={classes.link} to="/editor/monitoring">
              Open editor with pre-loaded code
            </Link>
          </p>
          <h2 className={classes.messageBlockTitle}>Micro:bit to monitor light levels</h2>
          <p className={classes.message}>
            You can code a micro:bit as light sensor.
            The micro:bit can sense light through the LED display on the front.
            Before doing these exercises pupils should complete
            the <a className={classes.link} href={TUTORIAL_LINKS.lightCalibration}>light calibration exercise</a>.
          </p>
          <p className={classes.message}>
            <strong>Light sensor (no neopixel) *</strong><br />
            The micro:bit senses the light-level and turns all of its LEDs on when it gets dark.<br />
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.lightSensorTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <Link className={classes.link} to="/editor/light-sensor">Open editor with pre-loaded code</Link>
          </p>
          <p className={classes.message}>
            <strong>Light sensor (requires a neopixel light strip) **</strong><br />
            The micro:bit senses the light-level and turns on the neopixel lights when it gets dark.<br />
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.lightSensorStreetlightTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <Link className={classes.link} to="/editor/light-sensor-neopixel">Open editor with pre-loaded code</Link>
          </p>
          <h2 className={classes.messageBlockTitle}>Micro:bit to monitor when a door/window is open/closed</h2>
          <p className={classes.message}>
            The micro:bit has a digital compass - an input sensor that detects magnetic fields.
            The micro:bit (in combination with a magnet attached to a door) senses
            the change in strength of magnetic field when the door is open/closed and the micro:bit
            gets further away from/closer to the magnet. Before doing these exercises pupils should complete the&#160;
            <a className={classes.link} href={TUTORIAL_LINKS.magneticForceCalibration}>
              magnetic force calibration exercise
            </a>.
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.doorMagnetSensorTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <strong>Task 1: Door open/closed sensor **</strong><br />
            The micro:bit changes its face from happy to sad when the door opens.<br />
            <Link className={classes.link} to="/editor/door-open-closed-sensor">
              Open editor with pre-loaded code
            </Link>
          </p>
          <p className={classes.message}>
            <strong>Task 2 (V2 only!): Door state logging ***</strong><br />
            The micro:bit (in combination with a magnet) attached to a door counts the number of times
            a door is opened and report this to the micro:bit’s datalog.
            The data can then be extracted and analysed by pupils.<br />
            <Link className={classes.link} to="/editor/door-state-logging">
              Open editor with pre-loaded code
            </Link>
          </p>
          <h2 className={classes.messageBlockTitle}>Temperature sensor</h2>
          <p className={classes.message}>
            The micro:bit has a temperature sensor which measures the temperature inside the micro:bit.
            Because it’s usually hotter in the micro:bit than in the room (the electric components produce heat),
            pupils need to complete the&#160;
            <a className={classes.link} href={TUTORIAL_LINKS.temperatureCalibration}>
              temperature calibration exercise
            </a>
            &#160;before doing the tutorial.
          </p>
          <p className={classes.message}>
            <strong>Hourly temperature comparison with average (requires a neopixel strip) **</strong><br />
            The micro:bit measures the temperature once an hour and changes the colour of the neopixels based on
            whether the current temperature is higher (lights go red) or lower (lights go green) than average.<br />
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.temperatureSensorTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <Link className={classes.link} to="/editor/temperature-comparison">Open editor with pre-loaded code</Link>
          </p>
          <p className={classes.message}>
            <strong>Temperature logging (V2 only!)</strong><br />
            The micro:bit logs the current temperature once a minute to its datalog.
            The data can then be extracted and analysed by pupils.<br />
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.temperatureLoggingTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <Link className={classes.link} to="/editor/temperature-logging">Open editor with pre-loaded code</Link>
          </p>
          <h2 className={classes.messageBlockTitle}>Carbon intensity</h2>
          <p className={classes.message}>
            We have worked with Lancaster university to allow micro:bits to fetch data from the internet.
            To allow this the teacher needs to use a micro:bit (any micro:bit – v1 or v2) to set up a micro:bit bridge.
            Only one needs to be set up per classroom - one bridge can respond to requests for data from up to 30 pupil
            micro:bits. We recommend using a designated computer for the bridge and leaving it at the front of the
            classroom. If possible, do not use the “bridge“ laptop to also do micro:bit coding as
            this can get confusing.<br />
            To set up the bridge, follow the instructions <Link className={classes.link} to="/webhub">here</Link>. Once
            the bridge is set-up and has a smiley face then pupils can use blocks to get
            data on “carbon”, “weather” and “energy”.
          </p>
          <p className={classes.message}>
            <strong>Fossil fuel light colour changer (requires a neopixel light strip) ***</strong><br />
            The micro:bit retrieves the current mix of what is being used right now to generate the UK’s electricity.
            If less sustainable fuels (e.g. coal and gas) are being used then the lights on a neopixel turn red;
            if more sustainable generation is predominant (e.g. wind and solar) then
            the lights on the neopixel turn green.<br />
          </p>
          <p className={classes.message}>
            <a className={classes.link} href={TUTORIAL_LINKS.fossilFuelTutorial}>Download tutorial</a>
          </p>
          <p className={classes.message}>
            <Link className={classes.link} to="/editor/fossil-fuel">Open editor with pre-loaded code</Link>
          </p>
          <h2 className={classes.messageBlockTitle}>Miscellaneous</h2>
          <p className={classes.message}>
            <strong>Neopixel set-up (requires a neopixel light strip) **</strong><br />
            The micro:bit controls the strip of lights to change colour on a button press<br />
            <Link className={classes.link} to="/editor/neopixel-set-up">
              Open editor with pre-loaded code
            </Link>
          </p>
          <p className={classes.message}>
            <strong>Step counter *</strong><br />
            The micro:bit counts the number of steps a person (or animal!)
            takes and shows the number on the screen<br />
            <Link className={classes.link} to="/editor/step-counter">
              Open editor with pre-loaded code
            </Link>
          </p>
        </Grid>
      </Grid>
    );
  }
}

CodingTutorials.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CodingTutorials);
