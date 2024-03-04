import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';
import { push } from 'connected-react-router';
import { bindActionCreators, compose } from 'redux';
import {
  Redirect, Route, Switch, withRouter,
} from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';

import Schools from './Schools';

import LessonsCategories from '../components/Lessons/LessonsCategories';
import Lessons from '../components/Lessons/Lessons';
import Manuals from './Manuals/Manuals';
import Manual from './Manuals/Manual';
import LoginPage from './LoginPage';
import Footer from '../components/Footer';
import TokenManager from '../utils/tokenManager';
import MetersPage from './SEMAdminPages/MetersPage';
import ProvidersPage from './SEMAdminPages/ProvidersPage';
import UsersPage from './SLEAdminPages/UsersPage';
import CodingPortalFrame from './CodingPortalFrame';
import DevicesPage from './SLEAdminPages/DevicesPage';
import NotFoundPage from '../components/NotFoundPage';
import LocationPage from './SLEAdminPages/LocationPage';
import SmartThingsDevices from './SmartThingsDevices';
import BanEmailPage from './BanEmailPage';
import EnergyScreenEditor from './ESAdminPages/EnergyScreenEditor';
import VariablesPage from './SLEAdminPages/VariablesPage';
import FeedbackPage from './FeedbackPage';
import RegistrationRequestStatus from '../components/RegistrationRequestStatus';
import EndTrainingSession from '../components/EndTrainingSession';
import RegistrationRequestQuestionnaire from '../components/RegistrationRequestQuestionnaire';
import TermsAndConditions from '../components/TermsAndConditions';
import TariffComparison from './SEMAdminPages/TariffComparison';
import Switches from './SEMAdminPages/Switches';
import EnergyMetersBillingInfoPage from '../components/SchoolRegistration/EnergyMetersBillingInfoPage';

import AlertDialog from '../components/dialogs/AlertDialog';
import MessageSnackbar from '../components/MessageSnackbar';
import LoadingDialog from '../components/dialogs/LoadingDialog';
import MicrobitDialog from '../components/dialogs/MicrobitDialog';
import EditorHelpDialog from '../components/dialogs/EditorHelpDialog';

import CookiesConsentBanner from '../components/CookiesConsentBanner';

import {
  ADMIN_ROLE,
  ES_ADMIN_ROLE,
  PUPIL_ROLE,
  SEM_ADMIN_ROLE,
  SLE_ADMIN_ROLE,
  TEACHER_ROLE,
  TOKEN_TYPE,
  USAGE_STATISTIC_CHART_NAME,
  USAGE_STATISTIC_CONFIGS,
  GOOGLE_ANALYTICS_TRACKER_ID,
} from '../constants/config';

import { ROUTE_PATH } from '../constants/routing';

import * as authActions from '../actions/authActions';
import * as userActions from '../actions/userActions';
import * as dialogActions from '../actions/dialogActions';
import * as schoolsActions from '../actions/schoolsActions';

import { REGISTRATION_REQUEST_STATUS } from '../components/SchoolRegistration/constants';
import SchoolRegistrationDialog from '../components/dialogs/SchoolRegistrationDialog';
import schoolIcon from '../images/school.svg';
import LessonPlans from '../components/Lessons/LessonPlans';
import AppTopBar from '../components/AppTopBar';
import CodingTutorials from '../components/CodingTutorials';
import PrivacyPolicy from '../components/PrivacyPolicy';

const EnergyDashboardContainerV1 = lazy(() => import('./EnergyDashboard/v1/EnergyDashboardContainer'));
const EnergyDashboardLegacyV1 = lazy(() => import('./EnergyDashboard/v1/EnergyDashboardLegacy'));
const EnergyDashboardContainerV2 = lazy(() => import('./EnergyDashboard/v2/EnergyDashboardContainer'));
const EnergyDashboardLegacyV2 = lazy(() => import('./EnergyDashboard/v2/EnergyDashboardLegacy'));
const EnergyDashboardContainerV3 = lazy(() => import('./EnergyDashboard/v3/EnergyDashboardContainer'));
const EnergyDashboardLegacyV3 = lazy(() => import('./EnergyDashboard/v3/EnergyDashboardLegacy'));
const EnergyScreenDashboard = lazy(() => import('./EnergyDashboard/v0/EnergyScreenDashboard'));
const UsageStatistic = lazy(() => import('./UsageStatistic'));
const FloorsMaps = lazy(() => import('./FloorsMaps'));
const AlertsConfiguration = lazy(() => import('./SEMAdminPages/AlertsConfiguration'));
const LandingPage = lazy(() => import('../components/LandingPage/LandingPage'));
const SchoolRequestsPage = lazy(() => import('./SchoolRequestsPage'));
const SmartThingsSensors = lazy(() => import('./SEMAdminPages/SmartThingsSensors'));
const EnergyManagerDashboard = lazy(() => import('./SEMAdminPages/EnergyManagerDashboard/EnergyManagerDashboard'));
const SchoolsMonitoringDashboard = lazy(() => import('./PortalAdminPages/SchoolsMonitoringDashboard/SchoolsMonitoringDashboard'));

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.

const PrivateRoute = ({
  component: Component, userAuthenticated, pushRoute, showSnackbar, allowedRoles, params, ...rest
}) => {
  const userRole = TokenManager.getUserRole();

  if (!userAuthenticated) {
    pushRoute('/');
    showSnackbar('Authentication is required!');
    return null;
  }

  if (allowedRoles.indexOf(userRole) === -1) {
    pushRoute('/');
    showSnackbar('Additional permissions required to view this page!');
  }

  return (
    <Route
      {...rest}
      render={props => <Component {...props} {...params} />}
    />
  );
};


PrivateRoute.propTypes = {
  component: PropTypes.oneOfType(
    [
      PropTypes.func,
      PropTypes.object, // need it to avoid warning when using react lazy
    ],
  ).isRequired,
  showSnackbar: PropTypes.func.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  userAuthenticated: PropTypes.bool.isRequired,
  pushRoute: PropTypes.func.isRequired,

  params: PropTypes.object,
};

PrivateRoute.defaultProps = {
  params: {},
};

class App extends React.Component {
  state = {
    loading: true,
    cookiesConsentBannerOpened: false,
  };

  componentDidMount() {
    const { actions } = this.props;
    const userID = TokenManager.getUserId();
    if (userID && userID !== '' && TokenManager.getTokenType() === TOKEN_TYPE.API_AUTH) {
      actions.getUserInfo(userID)
        .catch((error) => {
          console.log(error); // eslint-disable-line no-console
        })
        .finally(() => this.setState({ loading: false }));
    } else {
      this.setState({ loading: false }); // eslint-disable-line react/no-did-mount-set-state
    }
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    if (prevProps.user !== user && this.getUserIsLoggedIn(user)) {
      const regStatus = TokenManager.getRegistrationStatus();
      this.renderActivationRejectedAlert(user, regStatus);
    }
  }

  renderLanding = () => {
    const { actions } = this.props;
    const { cookiesConsentBannerOpened } = this.state;

    return (
      <LandingPage
        openEditorHelpDialog={actions.toggleEditorHelpDialog}
        cookiesConsentBannerOpened={cookiesConsentBannerOpened}
      />
    );
  };

  roleIndexRoute = ({ userAuthenticated, pushRoute }) => {
    const userRole = TokenManager.getUserRole();

    if (!userAuthenticated) {
      return this.renderLanding();
    }

    switch (userRole) {
      case ADMIN_ROLE:
        pushRoute('/admin/monitoring-dashboard');
        break;
      case SLE_ADMIN_ROLE:
        pushRoute('/sle-admin/devices');
        break;
      case SEM_ADMIN_ROLE:
        pushRoute('/sem-admin/energy-manager-dashboard');
        break;
      case TEACHER_ROLE:
        pushRoute('/devices');
        break;
      case PUPIL_ROLE:
        pushRoute('/editor');
        break;
      case ES_ADMIN_ROLE:
        pushRoute('/es-admin/screen');
        break;
      default:
        return this.renderLanding();
    }
    return null;
  };

  getUserIsLoggedIn = user => Object.getOwnPropertyNames(user).length !== 0;

  renderTopBar = (userLoggedIn, route) => {
    const { actions } = this.props;

    if (route !== '/'
      && route !== '/login'
      && !route.startsWith('/reset-password')
      && !route.startsWith('/ban-email')
      && !route.startsWith('/energy-dashboard')
    ) {
      return (
        <AppTopBar
          pathname={route}
          onLogout={actions.logout}
          goToPage={actions.push}
          userLoggedIn={userLoggedIn}
          openEditorHelpDialog={actions.toggleEditorHelpDialog}
        />
      );
    }
    return null;
  };

  onSubmitRegistrationSchoolDialog = (school) => {
    const { actions } = this.props;
    actions.postSchoolRegisterRequests(school);
  };

  renderActivationRejectedAlert = (user, regStatus) => {
    if (regStatus !== REGISTRATION_REQUEST_STATUS.activation_rejected) return;
    const { actions } = this.props;
    actions.getSchoolRegistrationRequests()
      .then((res) => {
        const schoolRequest = res.data.find(request => request.registered_school_id === user.location_id);
        const rejectReason = schoolRequest.activation_reject_reason || '';
        actions.showAlert(
          'Warning message!',
          (
            <span style={{ display: 'block', textAlign: 'center' }}>
              Your School account activation has been rejected for the next reason:<br />{rejectReason}
            </span>
          ),
        );
        actions.logout();
      });
  };

  showCookiesConsentBanner = (route) => {
    if (isNil(GOOGLE_ANALYTICS_TRACKER_ID)) return false;
    return !(
      route.startsWith('/energy-dashboard') || route.includes('editor') || route === '/terms-and-conditions' || route === '/privacy-policy'
    );
  }

  showFooter = route => !(
    route.startsWith('/energy-dashboard') || route.includes('editor')
  );

  render() {
    const {
      dialogs, actions, user, callsCounter, location,
    } = this.props;
    const { loading, cookiesConsentBannerOpened } = this.state;
    const userLoggedIn = this.getUserIsLoggedIn(user);
    const commonRouteProps = {
      pushRoute: actions.push,
      userAuthenticated: userLoggedIn,
      showSnackbar: actions.showMessageSnackbar,
    };

    const showCookiesConsentBanner = this.showCookiesConsentBanner(location.pathname);

    const showFooter = this.showFooter(location.pathname);

    const RoleIndexRoute = this.roleIndexRoute;

    return (
      <React.Fragment>
        {this.renderTopBar(userLoggedIn, location.pathname)}
        {!loading
        && (
        <div style={{
          minHeight: 'calc(100vh - 166px)',
          backgroundColor: '#EFEFEF',
          display: 'flex',
        }}
        >
          <Suspense fallback={<LoadingDialog isOpened />}>
            <CodingPortalFrame
              visible={location.pathname.slice(0, 7) === '/editor'}
              location={location.pathname}
            />
            <Switch>
              <RoleIndexRoute exact path="/" {...commonRouteProps} />
              <Route path="/login" render={() => (userLoggedIn ? (<Redirect to="/" />) : (<LoginPage />))} />
              <Route path="/ban-email/:token" component={BanEmailPage} />
              <Route path="/reset-password/:token" component={ResetPasswordPage} />
              <Route path={`${ROUTE_PATH.energyDashboardV0}/:schoolId`} component={EnergyScreenDashboard} />
              <Route path={`${ROUTE_PATH.energyDashboardV1}/:schoolId`} component={EnergyDashboardContainerV1} />
              <Route path={`${ROUTE_PATH.energyDashboardV2}/:schoolId`} component={EnergyDashboardContainerV2} />
              <Route path={`${ROUTE_PATH.energyDashboardV3}/:schoolId`} component={EnergyDashboardContainerV3} />
              <Route path={`${ROUTE_PATH.energyDashboardLegacyV1}/:schoolId`} component={EnergyDashboardLegacyV1} />
              <Route path={`${ROUTE_PATH.energyDashboardLegacyV2}/:schoolId`} component={EnergyDashboardLegacyV2} />
              <Route path={`${ROUTE_PATH.energyDashboardLegacyV3}/:schoolId`} component={EnergyDashboardLegacyV3} />
              <Route path="/editor" component={() => (null)} {...commonRouteProps} />
              <Route path="/tutorials" component={CodingTutorials} {...commonRouteProps} />
              <Route path="/floors-maps" component={FloorsMaps} {...commonRouteProps} />
              <Route path="/registration-request-status/" component={RegistrationRequestStatus} />
              <Route path="/end-training-session/" component={EndTrainingSession} />
              <Route path="/registration-request-questionnaire/" component={RegistrationRequestQuestionnaire} />
              <Route path="/terms-and-conditions" component={TermsAndConditions} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route exact path="/manuals" component={Manuals} {...commonRouteProps} />
              <Route path="/manuals/:manualSlug" component={Manual} {...commonRouteProps} />
              <Route exact path="/lesson-plans" render={() => <Redirect to="/learning-resources" />} {...commonRouteProps} />
              <Route path="/learning-resources/:activeBlock?" component={LessonPlans} {...commonRouteProps} />
              <Route exact path={`${ROUTE_PATH.lessons}`} component={LessonsCategories} {...commonRouteProps} />
              <Route path={`${ROUTE_PATH.lessons}/:category_id`} component={Lessons} {...commonRouteProps} />
              <Route
                exact
                path="/energy-usage/:schoolId"
                render={props => (
                  <UsageStatistic
                    {...props}
                    config={USAGE_STATISTIC_CONFIGS[USAGE_STATISTIC_CHART_NAME.energy]}
                  />
                )}
                {...commonRouteProps}
              />
              <Route
                path="/webhub"
                component={() => {
                  window.location.reload();
                }}
                {...commonRouteProps}
              />
              <PrivateRoute path="/admin/schools" component={SchoolRequestsPage} allowedRoles={[ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sle-admin/devices" component={DevicesPage} allowedRoles={[SLE_ADMIN_ROLE, SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sle-admin/users" component={UsersPage} allowedRoles={[SLE_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sle-admin/location" component={LocationPage} allowedRoles={[SLE_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/variables" component={VariablesPage} allowedRoles={[SLE_ADMIN_ROLE, SEM_ADMIN_ROLE, PUPIL_ROLE, TEACHER_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/alerts" component={AlertsConfiguration} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/devices" component={SmartThingsDevices} allowedRoles={[TEACHER_ROLE, PUPIL_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/schools" component={Schools} allowedRoles={[SLE_ADMIN_ROLE, SEM_ADMIN_ROLE, TEACHER_ROLE, PUPIL_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/meters" component={MetersPage} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/smartthings-sensors/:sensorId?" component={SmartThingsSensors} allowedRoles={[SEM_ADMIN_ROLE, SLE_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/providers" component={ProvidersPage} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/comparison" component={TariffComparison} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/energy-meters-billing-info" component={EnergyMetersBillingInfoPage} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path={ROUTE_PATH.switches} component={Switches} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/sem-admin/energy-manager-dashboard" component={EnergyManagerDashboard} allowedRoles={[SEM_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/admin/monitoring-dashboard" component={SchoolsMonitoringDashboard} allowedRoles={[ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute
                exact
                key="energy"
                path="/energy-usage"
                component={UsageStatistic}
                params={{ config: USAGE_STATISTIC_CONFIGS[USAGE_STATISTIC_CHART_NAME.energy] }}
                allowedRoles={[SEM_ADMIN_ROLE, SLE_ADMIN_ROLE, PUPIL_ROLE, TEACHER_ROLE]}
                {...commonRouteProps}
              />
              <PrivateRoute
                exact
                key="temperature"
                path="/temperature-statistic"
                component={UsageStatistic}
                params={{ config: USAGE_STATISTIC_CONFIGS[USAGE_STATISTIC_CHART_NAME.temperature] }}
                allowedRoles={[SEM_ADMIN_ROLE, SLE_ADMIN_ROLE, PUPIL_ROLE, TEACHER_ROLE]}
                {...commonRouteProps}
              />
              <PrivateRoute
                path="/floors-maps"
                component={FloorsMaps}
                allowedRoles={[SEM_ADMIN_ROLE, SLE_ADMIN_ROLE, PUPIL_ROLE, TEACHER_ROLE]}
                {...commonRouteProps}
              />
              <PrivateRoute path="/es-admin/screen" component={EnergyScreenEditor} allowedRoles={[ES_ADMIN_ROLE]} {...commonRouteProps} />
              <PrivateRoute path="/feedback" component={FeedbackPage} allowedRoles={[TEACHER_ROLE, ADMIN_ROLE]} {...commonRouteProps} />
              <Route component={NotFoundPage} />
            </Switch>
          </Suspense>
        </div>
        )
        }
        <LoadingDialog isOpened={callsCounter !== 0} />
        <AlertDialog
          isOpened={dialogs.alert.opened}
          title={dialogs.alert.header}
          content={dialogs.alert.content}
          onClose={actions.hideAlert}
        />
        <MicrobitDialog
          isOpened={dialogs.microbitDialogOpened}
          onClose={actions.toogleMicrobitDialog}
        />
        <EditorHelpDialog
          isOpened={dialogs.editorHelpDialogOpened}
          onClose={actions.toggleEditorHelpDialog}
          goToPage={actions.push}
        />
        <SchoolRegistrationDialog
          titleIcon={schoolIcon}
          isOpened={dialogs.registrationSchoolDialogOpened}
          onClose={actions.toogleRegistrationSchoolDialog}
          onSubmit={this.onSubmitRegistrationSchoolDialog}
        />
        <MessageSnackbar
          open={dialogs.messageSnackbar.opened}
          message={dialogs.messageSnackbar.content}
          onClose={actions.hideMessageSnackbar}
        />
        {showCookiesConsentBanner && (
          <CookiesConsentBanner
            cookiesConsentBannerOpened={cookiesConsentBannerOpened}
            handleOpen={() => this.setState({ cookiesConsentBannerOpened: true })}
            handleClose={() => this.setState({ cookiesConsentBannerOpened: false })}
          />
        )}
        {showFooter
          && <Footer />
        }
      </React.Fragment>
    );
  }
}

App.propTypes = {
  actions: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  dialogs: PropTypes.object.isRequired,
  callsCounter: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.users.currentUser,
    dialogs: state.dialogs,
    callsCounter: state.callsCounter,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...dialogActions,
        ...userActions,
        ...schoolsActions,
        push,
      },
      dispatch,
    ),
  };
}

export default compose(
  hot(module),
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
