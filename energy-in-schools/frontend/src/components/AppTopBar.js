import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Hidden from '@material-ui/core/Hidden';
import withWidth from '@material-ui/core/withWidth';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HelpIcon from '@material-ui/icons/Help';

import { connect } from 'react-redux';
import logo from '../images/logo.svg';
import logoutIcon from '../images/logout.png';

import { menuConfig, NEW_PRIMARY_COLOR } from '../styles/stylesConstants';
import TokenManager from '../utils/tokenManager';
import ROUTES, { ENERGY_USAGE_LABEL, CODING_EDITOR_LABEL, ANONYMOUS_USER_ROUTES } from '../constants/routing';
import * as schoolsActions from '../actions/schoolsActions';

const styles = theme => ({
  root: {
    backgroundColor: NEW_PRIMARY_COLOR,
    width: '100%',
    padding: '40px 0',
    [theme.breakpoints.down('xs')]: {
      padding: '20px 0',
    },
  },
  logoIcon: {
    height: 80,
    width: 200,
    [theme.breakpoints.down('xs')]: {
      height: 45,
      width: 140,
    },
  },
  link: {
    border: 0,
    height: 36,
    color: 'white',
    borderRadius: 18,
    textTransform: 'none',
    padding: '5px 10px 2px',
    margin: '5px 0 5px 5px',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SamsungSharpSans',
    '&:hover': {
      backgroundColor: 'white',
      color: NEW_PRIMARY_COLOR,
    },
    '@media (max-width: 786px)': {
      width: '100%',
    },
  },
  arrow: {
    fontSize: 11,
    marginLeft: 3,
  },
  menu: {
    marginTop: 40,
    '& ul': {
      padding: 0,
    },
    '& div': {
      backgroundColor: 'transparent',
    },
    '@media (max-width: 786px)': {
      '& div': {
        width: '80%',
      },
    },
    '@media (min-width: 786px)': {
      '& div': {
        '&::-webkit-scrollbar': {
          width: 10,
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f155',
          borderRadius: 5,
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#d9d9d9',
          borderRadius: 5,
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#eae9e9',
        },
      },
    },
  },
  menuItem: {
    minHeight: 32,
    padding: '5px 10px 2px 10px',
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'SamsungSharpSans',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
    '@media (max-width: 786px)': {
      justifyContent: 'center',
    },
  },
  helpIcon: {
    marginLeft: 3,
    marginBottom: 2,
  },
});

const MENU_ITEM_HEIGHT = 32;

const AppTopBar = (props) => {
  const {
    actions, classes, goToPage, pathname, userLoggedIn, onLogout, width, openEditorHelpDialog, schools: {
      data: openSchools,
    },
  } = props;
  const userRole = TokenManager.getUserRole();
  const anonymousUserRoutes = !userLoggedIn ? ANONYMOUS_USER_ROUTES.map((route) => {
    if (route.label === ENERGY_USAGE_LABEL && openSchools) {
      return {
        menu: true,
        label: ENERGY_USAGE_LABEL,
        items: openSchools.map(school => ({
          label: school.name,
          path: `/energy-usage/${school.uid}`,
        })),
      };
    }
    return route;
  }) : [];
  const drawerRoutes = userLoggedIn ? ROUTES[userRole] || [] : anonymousUserRoutes;

  const [mobileRoutes, initialAnchors] = drawerRoutes.reduce((result, route) => {
    const [mobileRoutesAccumulator, initialAnchorsAccumulator] = result;

    if (route.menu) {
      mobileRoutesAccumulator.push(...route.items
        .map(item => ({ ...item, label: `${item.label} (${route.label})` })));
    } else {
      mobileRoutesAccumulator.push(route);
    }

    return [mobileRoutesAccumulator, {
      ...initialAnchorsAccumulator,
      [route.label]: null,
    }];
  }, [[], {}]);

  const [anchorElements, setAnchorElements] = useState(initialAnchors);
  const [showMenuItems, setShowMenuItems] = useState(false);

  useEffect(() => {
    actions.getOpenSchools();
  }, []);

  const handleClose = (label) => {
    setAnchorElements({ ...anchorElements, [label]: null });
  };

  const handleOpen = (label, value) => {
    setAnchorElements({ ...anchorElements, [label]: value });
  };

  const menuOpened = Object.values(anchorElements).find(value => value !== null);
  const openedItemsCount = menuOpened && menuOpened.size;
  const mdDown = ['xs', 'sm', 'md'].includes(width);

  return (
    <header
      className={classes.root}
      style={mdDown && showMenuItems ? {
        height: '100vh',
        overflow: 'auto',
      } : {}}
    >
      <Grid container justify="center">
        <Grid item container xs={10} md={9}>
          <Grid
            container
            direction={mdDown && showMenuItems ? 'column' : 'row'}
            alignItems={mdDown && showMenuItems ? 'flex-start' : 'center'}
          >
            <Grid
              container
              direction="row"
              style={mdDown ? { flex: 1 } : { width: 220 }}
              justify="space-between"
              alignItems="center"
            >
              <Link to="/">
                <img src={logo} alt="energy-in-schools-logo" className={classes.logoIcon} />
              </Link>
              <Hidden lgUp>
                <Grid container justify="flex-end" style={{ flex: 1 }} alignItems="center">
                  <Tooltip title={showMenuItems ? 'Expand' : 'Hide'} placement="bottom">
                    <IconButton onClick={() => { setShowMenuItems(!showMenuItems); }}>
                      <MenuIcon style={{ color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                  {userLoggedIn && (
                    <Tooltip title="Logout" placement="bottom">
                      <Avatar
                        className={classes.userAvatar}
                        onClick={onLogout}
                        src={logoutIcon}
                        alt="logout"
                      />
                    </Tooltip>
                  )}
                </Grid>
              </Hidden>
            </Grid>
            <Hidden mdDown={!showMenuItems} lgUp>
              {mobileRoutes.map(route => (
                <Button
                  key={`mobile-${route.label}`}
                  variant="outlined"
                  className={classes.link}
                  style={{ textDecoration: pathname === route.path ? 'underline' : 'none' }}
                  onClick={() => {
                    setShowMenuItems(!showMenuItems);
                    goToPage(route.path);
                    if (route.label === CODING_EDITOR_LABEL) window.location.reload();
                  }}
                >
                  {route.label === CODING_EDITOR_LABEL ? (
                    <Grid container justify="center" alignItems="center">
                      {route.label}
                      <HelpIcon
                        className={classes.helpIcon}
                        onClick={(event) => {
                          event.stopPropagation();
                          setShowMenuItems(!showMenuItems);
                          openEditorHelpDialog();
                        }}
                      />
                    </Grid>
                  ) : route.label}
                </Button>
              ))}
            </Hidden>
            <Hidden mdDown>
              {drawerRoutes.map(route => (route.menu ? (
                <React.Fragment key={route.label}>
                  <Button
                    disabled={!route.items.length}
                    variant="outlined"
                    className={classes.link}
                    style={anchorElements[route.label] ? {
                      backgroundColor: 'white',
                      color: NEW_PRIMARY_COLOR,
                    } : {}}
                    onClick={(event) => {
                      handleOpen(route.label, {
                        anchor: event.currentTarget,
                        size: route.items.length,
                      });
                    }}
                  >
                    {route.label}<span className={classes.arrow}>&#9660;</span>
                  </Button>
                  <Menu
                    {...menuConfig}
                    anchorEl={anchorElements[route.label] && anchorElements[route.label].anchor}
                    open={!!anchorElements[route.label]}
                    onClose={() => {
                      handleClose(route.label);
                    }}
                    className={classes.menu}
                  >
                    {route.items.map(item => (
                      <MenuItem
                        key={item.label}
                        onClick={() => {
                          handleClose(route.label);
                          goToPage(item.path);
                          if (item.label === CODING_EDITOR_LABEL) window.location.reload();
                        }}
                        className={classes.menuItem}
                      >
                        {item.label === CODING_EDITOR_LABEL ? (
                          <Grid container alignItems="center">
                            {item.label}
                            <HelpIcon
                              className={classes.helpIcon}
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditorHelpDialog();
                              }}
                            />
                          </Grid>
                        ) : item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              ) : (
                <Button
                  key={route.label}
                  variant="outlined"
                  className={classes.link}
                  style={{ textDecoration: pathname === route.path ? 'underline' : 'none' }}
                  onClick={() => {
                    goToPage(route.path);
                  }}
                >
                  {route.label}
                </Button>
              )))}
            </Hidden>
            {userLoggedIn && !mdDown && (
              <Tooltip title="Logout" placement="bottom">
                <Avatar
                  className={classes.userAvatar}
                  onClick={onLogout}
                  src={logoutIcon}
                  alt="logout"
                />
              </Tooltip>
            )}
            {openedItemsCount && (
              <div
                style={{
                  width: '100%',
                  height: (MENU_ITEM_HEIGHT * Math.min(openedItemsCount, 4)) - 55,
                }}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </header>
  );
};

AppTopBar.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  goToPage: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  openEditorHelpDialog: PropTypes.func.isRequired,
  userLoggedIn: PropTypes.bool.isRequired,
  schools: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...schoolsActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    schools: state.openSchools,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withWidth(),
  withStyles(styles),
)(AppTopBar);
