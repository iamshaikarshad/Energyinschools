import React, { createRef } from 'react';
import { withRouter } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ExpandMore from '@material-ui/icons/ExpandMore';
import RootRef from '@material-ui/core/RootRef';

import { Element, scroller } from 'react-scroll';

import * as dialogActions from '../../actions/dialogActions';
import * as schoolsActions from '../../actions/schoolsActions';

import LandingMainComponent from './LandingMainComponent';
import WhatIsItPage from './WhatIsItPage';
import EnergyBenefits from './EnergyBenefits';
import EducationalBenefits from './EducationalBenefits';
import LearningPlatformPage from './LearningPlatformPage';
import LandingVideoComponent from './LandingVideoComponent';
import RegisterYourInterestBlock from './RegisterYourInterestBlock';

import {
  LANDING_PAGE_COMMON_STYLES,
  LANDING_PAGE_MENU_HEIGHT,
  MIN_SCROLL_PIXELS_COUNT_TO_SHOW_SCROLL_BUTTON,
  WINDOW_SCROLL_DELAY,
} from './constants';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  root: {
    flexGrow: 1,
    overflowX: 'hidden',
    minHeight: '100vh', // need vh for IE compatibility
  },
  toTopButton: {
    visibility: 'hidden',
    position: 'fixed',
    right: '2%',
    bottom: 60,
    left: 'auto',
    top: 'auto',
    backgroundColor: '#368fcd',
    transform: 'rotate(180deg)',
    marginTop: 0,
    height: 40,
    width: 40,
    fontWeight: 700,
    zIndex: 100,
    padding: 0, // for proper centering in IE
    '&:hover': {
      backgroundColor: '#599dcd',
    },
    [theme.breakpoints.down('sm')]: {
      right: 10,
    },
    [theme.breakpoints.down('xs')]: {
      right: 5,
    },
  },
});

const MAIN_PAGE_NAME = 'LandingMainComponent';

const SCROLLER_DEFAULT_OFFSET = (-1) * LANDING_PAGE_MENU_HEIGHT;

const SCROLLER_CONFIG = Object.freeze({
  duration: 1000,
  delay: 100,
  smooth: true,
});

class LandingPage extends React.Component {
  scrollButtonRef = createRef();

  componentDidMount() {
    const { actions } = this.props;

    window.addEventListener('scroll', this.windowScrollHandler);

    actions.getOpenSchools();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.windowScrollHandler);
  }

  onNavigate = (pageName, offset = SCROLLER_DEFAULT_OFFSET) => {
    scroller.scrollTo(pageName, {
      ...SCROLLER_CONFIG,
      offset,
    });
  };

  scrollToTop = () => {
    this.onNavigate(MAIN_PAGE_NAME);
  }

  windowScrollHandler = () => {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(window).scrollTop();
      if (isNil(this.scrollButtonRef) || isNil(this.scrollButtonRef.current)) return;
      this.scrollButtonRef.current.style.visibility = scrollY > MIN_SCROLL_PIXELS_COUNT_TO_SHOW_SCROLL_BUTTON ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  render() {
    const {
      classes, actions, openEditorHelpDialog, cookiesConsentBannerOpened, schools: { data },
    } = this.props;

    return (
      <Grid container className={classes.root} justify="center">
        <Element name={MAIN_PAGE_NAME} />
        <LandingMainComponent
          goToPage={actions.push}
          openSchools={data}
          openEditorHelpDialog={openEditorHelpDialog}
          cookiesConsentBannerOpened={cookiesConsentBannerOpened}
        />
        <WhatIsItPage />
        <EnergyBenefits />
        <EducationalBenefits />
        <LearningPlatformPage />
        <LandingVideoComponent />
        <RegisterYourInterestBlock onClickRegisterBtn={actions.toogleRegistrationSchoolDialog} />
        <RootRef rootRef={this.scrollButtonRef}>
          <IconButton
            className={classes.toTopButton}
            onClick={this.scrollToTop}
          >
            <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
          </IconButton>
        </RootRef>
      </Grid>
    );
  }
}

LandingPage.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  schools: PropTypes.object.isRequired,
  openEditorHelpDialog: PropTypes.func.isRequired,
  cookiesConsentBannerOpened: PropTypes.bool.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...schoolsActions,
      push,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    dialogs: state.dialogs,
    schools: state.openSchools,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(LandingPage);
