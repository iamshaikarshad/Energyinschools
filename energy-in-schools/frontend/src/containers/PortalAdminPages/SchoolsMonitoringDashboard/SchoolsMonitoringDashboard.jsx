import React, { Fragment, PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

import moment from 'moment';

import { isNil } from 'lodash';

import SearchInput, { createFilter } from 'react-search-input';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import List from '@material-ui/core/List';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import RootRef from '@material-ui/core/RootRef';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ListIcon from '@material-ui/icons/List';
import ContentCopy from '@material-ui/icons/FilterNone';
import RefreshIcon from '@material-ui/icons/Refresh';

import SmartThingsAppStatusCard from './SmartThingsAppStatusCard';
import MetricStatus from './MetricStatus';
import EnergyDashboardActivity from './EnergyDashboardActivity';
import EnergyMetersConnectivity from './EnergyMetersConnectivity';
import EnergyConsumption from './EnergyConsumption';
import EnergyTariffs from './EnergyTariffs';
import MUGIntegrationInfo from './MUGIntegrationInfo';

import NoData from './NoData';

import {
  getSchoolsMonitoringDataList,
  updateSchoolMetricsData,
  getUpdatedSmartAppStatus,
  updateSchoolSmartAppStatus,
} from '../../../actions/schoolsMonitoringActions';

import { showMessageSnackbar } from '../../../actions/dialogActions';

import copyClick from '../../../utils/copyClick';

import {
  MIN_WINDOW_SCROLL_PIXELS,
  WINDOW_SCROLL_DELAY,
  METRIC_ITEMS_TO_DISPLAY_IN_SCHOOLS_LIST,
  METRIC_DISPLAY_CONFIG,
  PAGE_ELEMENT_ID,
  MENU_SCROLL_BUTTON_TYPE,
  getElementHeight,
  SCHOOL_SELECT_OPTIONS,
  LABELED_SCHOOL_SELECT_OPTIONS,
  NOT_AVAILABLE_LABEL,
  STATUS_COLOR,
} from './constants';

import {
  APP_TOP_BAR_ID, APP_FOOTER_ID,
} from '../../../constants/config';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(to bottom, rgb(250, 255, 255), rgba(0, 150, 212, 0.06) 90%, rgba(0, 150, 212, 0.08))',
    backgroundColor: 'rgb(255, 255, 255)',
    [theme.breakpoints.down('md')]: {
      height: 'auto !important',
    },
  },
  dashboardContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  pageTitle: {
    height: 60,
    width: '100%',
    backgroundColor: 'rgba(152, 229, 246, 0.5)',
    backgroundImage: 'radial-gradient(rgba(0, 188, 212, 0.2), rgb(38, 229, 243))',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  pageTitleText: {
    fontSize: 24,
    fontWeight: 500,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 2,
    wordSpacing: 10,
    color: 'rgba(0, 0, 0, 0.7)',
    [theme.breakpoints.down('md')]: {
      fontSize: 21,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
      wordSpacing: 4,
      letterSpacing: 0.7,
    },
  },
  menuRoot: {
    width: '90%',
    height: '100%',
    color: 'rgb(0, 0, 0)',
    position: 'relative',
    backgroundColor: 'rgba(179, 242, 255, 0.2)',
    zIndex: 999,
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('md')]: {
      borderRadius: 0,
    },
  },
  menuTitleContainer: {
    padding: '0px 25px',
    width: '100%',
    height: 60,
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      padding: '0px 12px',
    },
  },
  menuTitleText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgb(0, 0, 0)',
  },
  menuList: {
    width: '100%',
    padding: 0,
    overflow: 'auto',
  },
  menuItem: {
    overflow: 'hidden',
    breakInside: 'avoid',
    paddingLeft: 25,
    paddingRight: 8,
    maxWidth: '100%',
    color: 'rgba(0, 0, 0, 0.67)',
    '&:hover': {
      backgroundColor: 'rgba(0, 150, 255, 0.04)',
    },
  },
  menuItemSelected: {
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'rgba(0, 150, 255, 0.09) !important',
  },
  menuItemTextRoot: {
    paddingLeft: 0,
    paddingRight: 0,
    color: 'inherit !important',
  },
  menuItemText: {
    fontFamily: 'Roboto, Helvetica',
    fontSize: 14,
    color: 'inherit !important',
    textTransform: 'none',
    fontWeight: 500,
    paddingRight: 10,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
    },
  },
  menuItemExtraInfoItem: {
    width: '100%',
    fontSize: 14,
    textTransform: 'none',
    marginTop: 3,
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
    },
  },
  copyIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: 'rgba(0, 0, 0, 0.57) !important',
    verticalAlign: 'top',
    marginTop: '-2px',
  },
  expand: {
    visibility: 'hidden',
    right: 25,
    backgroundColor: 'rgb(0, 188, 212)',
    transform: 'rotate(180deg)',
    marginTop: 0,
    height: 40,
    width: 40,
    fontWeight: 700,
    zIndex: 1200,
    padding: 0, // for proper centering in IE
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 0.7)',
    },
    [theme.breakpoints.down('sm')]: {
      right: '1%',
    },
  },
  menuButtonContainer: {
    width: '100%',
    minHeight: 0,
    textAlign: 'right',
    padding: '0px 8px',
    backgroundColor: 'rgba(152, 229, 246, 0.7)',
  },
  listIcon: {
    fontSize: 32,
    marginRight: 8,
    [theme.breakpoints.down('sm')]: {
      fontSize: 28,
    },
  },
  openMenuButton: {
    color: 'rgba(0, 0, 0, 0.87)',
    borderRadius: 0,
  },
  contentContainer: {
    alignContent: 'flex-start',
    [theme.breakpoints.down('md')]: {
      height: 'auto !important',
    },
  },
  detailedInfoContainer: {
    overflow: 'auto',
    padding: '0px 25px 0px 0px',
    height: '100%',
    [theme.breakpoints.down('md')]: {
      height: 'auto !important',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '0px 12px',
    },
  },
  detailsItemsContainer: {
    marginBottom: 25,
  },
  detailsItemWrapper: {
    marginBottom: 25,
  },
  detailsItemRoot: {
    borderRadius: 13,
    backgroundColor: 'rgba(179, 242, 255, 0.05)',
  },
  searchInput: {
    '& input': {
      width: '100%',
      fontSize: 14,
      border: 'none',
      borderRadius: 5,
      lineHeight: '22px',
      padding: '5px 10px 5px 25px',
      height: 32,
      position: 'relative',
      '&:focus': {
        outline: 'none',
        border: '1px solid rgba(0, 188, 212, 0.5)',
      },
      '&::placeholder': { /* Chrome, Firefox, Opera, Safari 10.1+ */
        opacity: 0.6,
      },
      '&:-ms-input-placeholder': { /* Internet Explorer 10-11 */
        opacity: 0.6,
      },
      '&::-ms-input-placeholder': { /* Microsoft Edge */
        opacity: 0.6,
      },
      [theme.breakpoints.down('xs')]: {
        padding: '5px 10px 5px 20px',
      },
    },
  },
  schoolNameTextWrapper: {
    minHeight: 60,
    overflow: 'hidden',
  },
  schoolNameText: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 24,
    fontWeight: 500,
    textAlign: 'center',
    lineHeight: 'normal',
    padding: '8px 0px',
    maxHeight: '100%',
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      fontSize: 20,
    },
  },
  testLabel: {
    position: 'absolute',
    left: -10,
    width: 40,
    height: 20,
    fontWeight: 600,
    textAlign: 'center',
    transform: 'rotate(-90deg)',
    color: 'rgb(255, 255, 255)',
    background: 'rgb(204, 204, 204)',
    borderRadius: 5,
  },
  refreshSchoolDataIcon: {
    cursor: 'pointer',
    color: 'rgb(13, 180, 240)',
    marginLeft: 8,
  },
  notificationBadge: {
    marginLeft: 8,
    marginRight: 4,
    color: 'rgb(255, 255, 255)',
  },
  notificationBadgeBackground: {
    backgroundColor: STATUS_COLOR.alert,
  },
  monitoringDashboardButtons: {
    padding: '6px 14px',
    minHeight: 0,
    minWidth: 0,
    [theme.breakpoints.down('xs')]: {
      padding: '3px 6px',
    },
  },
});

class SchoolsMonitoringDashboard extends PureComponent {
  state = {
    selectedSchoolId: null,
    showMenu: false,
    searchTerm: '',
    selectedSchoolType: SCHOOL_SELECT_OPTIONS.all_schools,
  };

  mobileMenuRef = createRef();

  scrollButtonRef = Object.values(MENU_SCROLL_BUTTON_TYPE).reduce((res, type) => {
    res[type] = createRef();
    return res;
  }, {});

  componentDidMount() {
    this.handleWindowScroll = this.handleMenuListScroll(MENU_SCROLL_BUTTON_TYPE.mobile);
    window.addEventListener('scroll', this.handleWindowScroll);
    const { actions } = this.props;
    actions.getSchoolsMonitoringDataList();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleWindowScroll);
  }

  onSearchUpdate = (term) => {
    this.setState({ searchTerm: term });
  };

  getContainerHeight = (margin = 0) => {
    const menuHeight = getElementHeight(APP_TOP_BAR_ID);
    const footerHeight = getElementHeight(APP_FOOTER_ID);
    const delta = menuHeight + footerHeight + margin;
    return `calc(100vh - ${delta}px)`;
  }

  handleClickOutside = (e) => {
    if (!this.mobileMenuRef.current.contains(e.target) && !this.scrollButtonRef[MENU_SCROLL_BUTTON_TYPE.mobile].current.contains(e.target)) {
      this.toggleDrawer(false);
    }
  };

  handleMenuListScroll = (scrollButtonRefType = MENU_SCROLL_BUTTON_TYPE.desktop) => (event) => {
    event.stopPropagation();
    if (event.persist) {
      event.persist();
    }
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(event.target).scrollTop();
      const currentScrollButtonRef = this.scrollButtonRef[scrollButtonRefType];
      if (isNil(currentScrollButtonRef) || isNil(currentScrollButtonRef.current)) return;
      currentScrollButtonRef.current.style.visibility = scrollY > MIN_WINDOW_SCROLL_PIXELS ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  selectSchool = (school, closeDrawer = false) => () => {
    this.setState({
      selectedSchoolId: school.id,
    }, () => {
      if (closeDrawer) {
        this.toggleDrawer(false);
      }
    });
  };

  onMenuButtonClick = (e) => {
    e.stopPropagation();
    const { showMenu } = this.state;
    this.toggleDrawer(!showMenu);
  }

  getScrollButtonClickHandler = (scrolledContainerNode = 'html,body') => (e) => {
    e.stopPropagation();
    this.scrollMenuListToTop(scrolledContainerNode);
  }

  scrollMenuListToTop = (elementToScroll) => {
    $(elementToScroll).animate(
      {
        scrollTop: 0,
      },
      'fast',
    );
  }

  toggleDrawer = (open) => {
    this.setState({
      showMenu: open,
    });
  };

  onSelectUpdate = (event) => {
    const selectedValue = event.target.value;
    this.setState({ selectedSchoolType: selectedValue });
  };

  schoolTypeFilter = (arrayItem) => {
    const { selectedSchoolType } = this.state;
    switch (selectedSchoolType) {
      case SCHOOL_SELECT_OPTIONS.real_schools:
        return !arrayItem.is_test;
      case SCHOOL_SELECT_OPTIONS.test_schools:
        return arrayItem.is_test;
      default:
        return true;
    }
  }

  updateSelectedSchoolInfo = (options) => {
    const { actions } = this.props;
    const { selectedSchoolId } = this.state;
    actions.updateSchoolMetricsData(selectedSchoolId, options)
      .then((data) => {
        /* need to update smartApp status every time after metrics have been updated
          because refreshing of smartApp status does not trigger school metrics data update on backend side
        */
        this.updateSelectedSchoolSmartAppStatus(data);
      })
      .catch(() => {});
  }

  updateSelectedSchoolSmartAppStatus = (schoolData) => {
    if (schoolData && schoolData.smart_things_app_token) {
      const { app_id: smartAppId } = schoolData.smart_things_app_token;
      if (!isNil(smartAppId)) {
        const { actions } = this.props;
        actions.getUpdatedSmartAppStatus(smartAppId)
          .then((res) => {
            if (res.success) {
              const { id: schoolId } = schoolData;
              actions.updateSchoolSmartAppStatus(schoolId, res.data);
            }
          });
      }
    }
  }

  renderTestLabel = (isTest, className) => (
    isTest ? (
      <Box className={className}>
        test
      </Box>
    ) : ''
  )

  // eslint-disable-next-line consistent-return
  abbreviateAbnormalValueNotificationsCount = (notificationsCount) => {
    if (notificationsCount < 1e2) return notificationsCount;
    if (notificationsCount >= 1e2 && notificationsCount < 1e3) return '99+';
    if (notificationsCount >= 1e3 && notificationsCount < 1e6) return `${+(notificationsCount / 1e3).toFixed(1)}k`;
    if (notificationsCount >= 1e6 && notificationsCount < 1e9) return `${+(notificationsCount / 1e6).toFixed(1)}m`;
    if (notificationsCount >= 1e9 && notificationsCount < 1e12) return `${+(notificationsCount / 1e9).toFixed(1)}b`;
    if (notificationsCount >= 1e12) return `${+(notificationsCount / 1e12).toFixed(1)}t`;
  }

  renderMenuList = (mobileMode = false) => {
    const { classes, actions, schools } = this.props;
    const { selectedSchoolId, searchTerm, selectedSchoolType } = this.state;
    const filteredSchools = schools
      .filter(this.schoolTypeFilter)
      .filter(createFilter(searchTerm, ['name']));

    const { length: filteredSchoolsCount } = filteredSchools;

    return (
      <div ref={(node) => { this.menu = node; }} className={classes.menuRoot}>
        <Grid id={PAGE_ELEMENT_ID.menuTitle} container alignItems="center" className={classes.menuTitleContainer}>
          <Hidden xsDown>
            <Grid item xs={3} container alignItems="center">
              <Typography className={classes.menuTitleText}>SCHOOLS ({filteredSchoolsCount})</Typography>
            </Grid>
          </Hidden>
          <Grid item sm={4} xs={6} container alignItems="center" justify="center">
            <Select value={selectedSchoolType} onChange={this.onSelectUpdate}>
              {LABELED_SCHOOL_SELECT_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item sm={5} xs={6} container alignItems="center" justify="flex-end">
            <SearchInput value={searchTerm} className={classes.searchInput} onChange={this.onSearchUpdate} placeholder="Search by name" />
          </Grid>
        </Grid>
        <List
          ref={(node) => { this.menuList = node; }}
          component="div"
          className={classes.menuList}
          onScroll={this.handleMenuListScroll()}
          style={{
            height: `calc(100% - ${getElementHeight(PAGE_ELEMENT_ID.menuTitle)}px)`,
          }}
        >
          {filteredSchools.map((school) => {
            const {
              id, name, uid, pupils_count: pupilsCount, created_at: createdAt,
            } = school;
            const isActive = selectedSchoolId === id;
            return (
              <ListItem
                key={id}
                button
                classes={{ root: classes.menuItem, selected: classes.menuItemSelected }}
                disableRipple
                onClick={this.selectSchool(school, mobileMode)}
                selected={isActive}
              >
                {this.renderTestLabel(school.is_test, classes.testLabel)}
                <ListItemText
                  disableTypography
                  classes={{ root: classes.menuItemTextRoot, primary: classes.menuItemText }}
                >
                  <Grid container>
                    <Grid item container xs={6} alignItems="center" alignContent="center">
                      <Typography className={classes.menuItemText}>
                        <span style={{ color: 'rgb(13, 180, 225)' }}>{name}</span>
                      </Typography>
                      <br />
                      <Typography className={classes.menuItemExtraInfoItem}>
                        school uid: {uid}
                        <ContentCopy
                          className={classes.copyIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyClick(uid, `Copied ${name} uid`, actions.showMessageSnackbar);
                          }}
                        />
                      </Typography>
                      <Typography className={classes.menuItemExtraInfoItem}>
                        school id: {id}
                      </Typography>
                      <Typography className={classes.menuItemExtraInfoItem}>
                        pupils count: {!isNil(pupilsCount) ? pupilsCount : NOT_AVAILABLE_LABEL.question}
                      </Typography>
                      <Typography className={classes.menuItemExtraInfoItem}>
                        registered: {moment(createdAt).format('DD/MM/YYYY')}
                      </Typography>
                    </Grid>
                    <Grid item container xs={6}>
                      {METRIC_ITEMS_TO_DISPLAY_IN_SCHOOLS_LIST.map((item) => {
                        const itemConfig = METRIC_DISPLAY_CONFIG[item];
                        const {
                          title, dataProp, getStatusColor, getStatusInfo,
                        } = itemConfig;
                        const itemData = school[dataProp];
                        const status = itemConfig.getStatus(itemData);
                        return (
                          <Grid item key={`${item}_${id}`}>
                            <MetricStatus
                              statusId={`${item}_${id}`}
                              title={title}
                              statusColor={getStatusColor(status)}
                              statusInfo={getStatusInfo(status, itemData)}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                </ListItemText>
              </ListItem>
            );
          })
          }
        </List>
        <Hidden mdDown>
          <RootRef rootRef={this.scrollButtonRef[MENU_SCROLL_BUTTON_TYPE.desktop]}>
            <IconButton
              id={`school_monitoring_menu_scroll_button_${MENU_SCROLL_BUTTON_TYPE.desktop}`}
              className={classes.expand}
              style={{
                position: 'absolute',
                bottom: 10,
              }}
              onClick={this.getScrollButtonClickHandler(this.menuList)}
            >
              <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
            </IconButton>
          </RootRef>
        </Hidden>
      </div>
    );
  };

  renderDetailedInfo = (school) => {
    const { classes, history } = this.props;
    const { id: schoolId, uid: schoolUid, name: schoolName } = school;
    return (
      <Fragment>
        <Grid item container xs={12} justify="center" alignItems="center" className={classes.schoolNameTextWrapper}>
          <Typography className={classes.schoolNameText}>
            {schoolName}
            <RefreshIcon
              className={classes.refreshSchoolDataIcon}
              onClick={() => {
                this.updateSelectedSchoolInfo({
                  showMessageOnSucces: true,
                  showMessageOnFailure: true,
                });
              }}
            />
          </Typography>
        </Grid>
        <Grid item container xs={12} className={classes.detailsItemsContainer}>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <SmartThingsAppStatusCard
              classes={{ root: classes.detailsItemRoot }}
              data={school.smart_things_app_token}
              schoolId={schoolId}
            />
          </Grid>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <EnergyMetersConnectivity
              data={school.energy_meters}
              schoolId={schoolId}
              classes={{ root: classes.detailsItemRoot }}
              refreshSchoolInfo={() => {
                this.updateSelectedSchoolInfo({
                  showMessageOnSucces: true,
                  showMessageOnFailure: true,
                });
              }}
            />
          </Grid>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <EnergyConsumption
              schoolUid={schoolUid}
              data={school.consumption}
              meters={school.energy_meters}
              classes={{ root: classes.detailsItemRoot }}
              history={history}
            />
          </Grid>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <EnergyTariffs tariffs={school.tariffs} classes={{ root: classes.detailsItemRoot }} />
          </Grid>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <EnergyDashboardActivity
              classes={{ root: classes.detailsItemRoot }}
              schoolUid={schoolUid}
              activityStatisticsData={school.last_dashboard_ping}
            />
          </Grid>
          <Grid item container xs={12} className={classes.detailsItemWrapper}>
            <MUGIntegrationInfo
              school={{
                name: schoolName,
                id: schoolId,
                uid: schoolUid,
              }}
              data={school.mug_data}
              onUpdated={this.updateSelectedSchoolInfo}
              classes={{ root: classes.detailsItemRoot }}
            />
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  render() {
    const { classes, schools } = this.props;
    const { showMenu, selectedSchoolId } = this.state;
    const selectedSchool = schools.find(school => school.id === selectedSchoolId);

    return (
      <div className={classes.root} style={{ height: this.getContainerHeight() }}>
        <Grid container justify="center" alignContent="flex-start" className={classes.dashboardContainer}>
          <Grid id={PAGE_ELEMENT_ID.pageTitle} item container xs={12} justify="center" alignItems="center" className={classes.pageTitle}>
            <Typography align="center" className={classes.pageTitleText}>Schools Monitoring Dashboard</Typography>
          </Grid>
          <Grid container>
            <div className={classes.menuButtonContainer} ref={this.mobileMenuRef}>
              <Hidden lgUp>
                <Button onClick={this.onMenuButtonClick} className={classes.openMenuButton}>
                  <ListIcon className={classes.listIcon} />
                  <span>Schools list</span>
                </Button>
              </Hidden>
            </div>
            <Hidden lgUp>
              <Grid item container xs={12}>
                <Popper
                  anchorEl={this.mobileMenuRef.current}
                  open={showMenu}
                  placement="bottom-start"
                  transition
                  style={{
                    zIndex: 400,
                    width: '100%',
                    opacity: 1,
                    backgroundColor: 'rgba(240, 250, 255, 1)',
                  }}
                  popperOptions={{
                    modifiers: {
                      preventOverflow: {
                        enabled: false,
                        padding: 0,
                      },
                      hide: {
                        enabled: false,
                      },
                      flip: {
                        enabled: false,
                      },
                    },
                  }}
                >
                  {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={this.handleClickOutside}>
                      <Grow {...TransitionProps}>
                        {this.renderMenuList(true)}
                      </Grow>
                    </ClickAwayListener>
                  )}
                </Popper>
              </Grid>
            </Hidden>
          </Grid>
          <Grid
            container
            className={classes.contentContainer}
            justify="space-between"
            style={{
              height: `calc(100% - ${getElementHeight(PAGE_ELEMENT_ID.pageTitle)}px)`,
            }}
          >
            <Hidden mdDown>
              <Grid item lg={4} container style={{ height: '100%' }}>
                {this.renderMenuList()}
              </Grid>
            </Hidden>
            <Grid item container lg={8} justify="center" alignContent="flex-start" className={classes.detailedInfoContainer}>
              {!isNil(selectedSchool)
                ? this.renderDetailedInfo(selectedSchool)
                : (
                  <NoData
                    text="Please select a school from the list to see detailed information"
                  />
                )
              }
            </Grid>
          </Grid>
        </Grid>
        <Hidden lgUp>
          <RootRef rootRef={this.scrollButtonRef[MENU_SCROLL_BUTTON_TYPE.mobile]}>
            <IconButton
              id={`school_monitoring_menu_scroll_button_${MENU_SCROLL_BUTTON_TYPE.mobile}`}
              className={classes.expand}
              style={{
                position: 'fixed',
                bottom: 55,
              }}
              onClick={this.getScrollButtonClickHandler()}
            >
              <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
            </IconButton>
          </RootRef>
        </Hidden>
      </div>
    );
  }
}

SchoolsMonitoringDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  schools: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    schools: state.schoolsMonitoringData.schools.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getSchoolsMonitoringDataList,
      updateSchoolMetricsData,
      getUpdatedSmartAppStatus,
      updateSchoolSmartAppStatus,
      showMessageSnackbar,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(SchoolsMonitoringDashboard);
