import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import HelpIcon from '@material-ui/icons/Help';

import logo from '../../images/logo.svg';
import microbitBristol from '../../images/LandingPageArts/samsung_microbit_bristol.jpg';

import { menuConfig, NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';
import { LANDING_PAGE_COMMON_STYLES } from './constants';
import { ENERGY_CHAMPIONS_BLOCK, LESSON_PLANS_BLOCK } from '../../constants/routing';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  root: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    paddingTop: 40,
    backgroundColor: NEW_PRIMARY_COLOR,
    [theme.breakpoints.down('xs')]: {
      padding: '20px 0',
    },
  },
  leftHalf: {
    width: '50%',
    height: '100%',
    '@media (max-width: 786px)': {
      width: '100%',
      position: 'relative',
      zIndex: 100,
    },
  },
  logoIcon: {
    height: 80,
    width: 200,
    userSelect: 'none',
    '-webkit-user-select': 'none',
    [theme.breakpoints.down('xs')]: {
      height: 45,
      width: 140,
    },
  },
  navAndInfo: {
    paddingRight: 20,
    color: 'white',
    flex: 1,
    '@media (max-width: 786px)': {
      padding: 0,
    },
  },
  mainDescription: {
    fontFamily: 'SamsungSharpSans',
    fontSize: 18,
    '@media (max-width: 1150px)': {
      fontSize: 16,
    },
    '@media (max-width: 786px)': {
      textAlign: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  navContainer: {
    '@media (max-width: 786px)': {
      justifyContent: 'center',
    },
  },
  mainImage: {
    position: 'absolute',
    overflow: 'hidden',
    height: '100%',
    width: '50%',
    right: 0,
    objectFit: 'cover',
    '@media (min-width: 786px)': {
      top: 0,
    },
    '@media (max-width: 786px)': {
      display: 'none',
    },
  },
  link: {
    border: 0,
    height: 32,
    color: 'white',
    borderRadius: 16,
    textTransform: 'none',
    padding: '5px 10px 2px 10px',
    margin: '5px 8px 5px 0',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'SamsungSharpSans',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
    '@media (max-width: 786px)': {
      width: '100%',
      marginRight: 0,
      paddingRight: 0,
    },
  },
  arrow: {
    fontSize: 11,
    marginLeft: 3,
  },
  microbitMenu: {
    '& ul': {
      padding: 0,
      width: '126px !important',
    },
    '@media (max-width: 786px)': {
      '& ul': {
        width: 'calc(100% - 20px) !important',
      },
    },
  },
  menu: {
    marginRight: 20,
    marginTop: 40,
    '& ul': {
      padding: 0,
      width: 180,
    },
    '& div': {
      backgroundColor: 'transparent',
    },
    '@media (max-width: 786px)': {
      marginLeft: 15,
      '& div': {
        width: '100%',
      },
      '& ul': {
        width: 'calc(100% - 10.5px)',
      },
      '& li': {
        width: '80%',
        margin: 'auto',
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
    padding: 3,
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'SamsungSharpSans',
    textTransform: 'none',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  },
  mobileFullWidth: {
    '@media (max-width: 786px)': {
      width: '100%',
    },
  },
});

const LandingMainComponent = (props) => {
  const [learningResourcesAnchorEl, setLearningResourcesAnchorEl] = useState(null);
  const [microbitCodingAnchorEl, setMicrobitCodingAnchorEl] = useState(null);
  const [openDataAnchorEl, setOpenDataAnchorEl] = useState(null);

  const showMicrobitCodingMargin = useMediaQuery('(max-width:1427px)');
  const showOpenDataMargin = useMediaQuery('(max-width:1087px)');

  const {
    classes, goToPage, openSchools, openEditorHelpDialog, cookiesConsentBannerOpened,
  } = props;

  const MENU = {
    openData: 'openData',
    microbitCoding: 'microbitCoding',
    learningResources: 'learningResources',
  };

  const MICROBIT_MENU_ITEMS = [
    {
      id: 1,
      onClick: () => {
        goToPage('/editor');
        window.location.reload();
      },
      helpIconComponent: <HelpIcon
        className={classes.helpIcon}
        onClick={(event) => {
          event.stopPropagation();
          openEditorHelpDialog();
        }}
      />,
      title: 'Coding editor',
    },
    {
      id: 2,
      onClick: () => goToPage('/tutorials'),
      title: 'Coding tutorials',
    },
    {
      id: 3,
      onClick: () => goToPage('/webhub'),
      title: 'Webhub',
    },
    {
      id: 4,
      onClick: () => goToPage('/floors-maps'),
      title: 'Floors Maps',
    },
  ];

  const handleClose = (menu) => {
    switch (menu) {
      case MENU.openData: setOpenDataAnchorEl(null); break;
      case MENU.microbitCoding: setMicrobitCodingAnchorEl(null); break;
      case MENU.learningResources: setLearningResourcesAnchorEl(null); break;
      default: break;
    }
  };

  const handleOpenEnergyData = (schoolId) => {
    goToPage(`/energy-usage/${schoolId}`);
  };

  return (
    <Grid container justify="center" className={classes.root}>
      <Grid item container xs={10} md={9}>
        <Grid container direction="column" className={classes.leftHalf}>
          <Link to="/">
            <img src={logo} alt="energy-in-schools-logo" className={classes.logoIcon} />
          </Link>
          <Grid container direction="column" justify="center" className={classes.navAndInfo}>
            <h1 className={classes.mainTitle}>
              Energy and IoT micro:bit coding platform
            </h1>
            <p className={classes.mainDescription}>
              Our learning resources and micro:bit editor are free for any school to use;
              a limited number of trial schools can log-in for more data
            </p>
            <Grid container direction="row" alignItems="flex-start" className={classes.navContainer}>
              <div className={classes.mobileFullWidth}>
                <Button
                  variant="outlined"
                  className={classes.button}
                  onClick={(event) => {
                    setLearningResourcesAnchorEl(event.currentTarget);
                  }}
                >
                  Learning resources<span className={classes.arrow}>&#9660;</span>
                </Button>
                <div
                  style={{
                    height: learningResourcesAnchorEl ? 64 : 0,
                  }}
                />
                <Menu
                  {...menuConfig}
                  anchorEl={learningResourcesAnchorEl}
                  open={!!learningResourcesAnchorEl}
                  onClose={() => handleClose(MENU.learningResources)}
                  className={`${classes.menu} ${classes.microbitMenu}`}
                >
                  <MenuItem
                    onClick={() => goToPage(`/learning-resources/${LESSON_PLANS_BLOCK}`)}
                    className={classes.menuItem}
                  >
                    Lesson plans
                  </MenuItem>
                  <MenuItem
                    onClick={() => goToPage(`/learning-resources/${ENERGY_CHAMPIONS_BLOCK}`)}
                    className={classes.menuItem}
                  >
                    Energy champions
                  </MenuItem>
                </Menu>
              </div>
              <div className={classes.mobileFullWidth}>
                <Button
                  variant="outlined"
                  className={classes.link}
                  onClick={(event) => {
                    setMicrobitCodingAnchorEl(event.currentTarget);
                  }}
                >
                  micro:bit coding<span className={classes.arrow}>&#9660;</span>
                </Button>
                <div
                  style={{
                    height: microbitCodingAnchorEl && showMicrobitCodingMargin ? (32 * MICROBIT_MENU_ITEMS.length + 2) : 0,
                  }}
                />
                <Menu
                  {...menuConfig}
                  PaperProps={{
                    style: {
                      maxHeight: 32 * MICROBIT_MENU_ITEMS.length + 2,
                    },
                  }}
                  anchorEl={microbitCodingAnchorEl}
                  open={!!microbitCodingAnchorEl}
                  onClose={() => handleClose(MENU.microbitCoding)}
                  className={`${classes.menu} ${classes.microbitMenu}`}
                >
                  {MICROBIT_MENU_ITEMS.map(item => (
                    <MenuItem
                      key={item.id}
                      onClick={item.onClick}
                      className={classes.menuItem}
                    >
                      {item.title}
                      {item.helpIconComponent && (
                        item.helpIconComponent
                      )}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
              <div className={classes.mobileFullWidth}>
                <Button
                  variant="outlined"
                  className={classes.link}
                  onClick={(event) => {
                    setOpenDataAnchorEl(event.currentTarget);
                  }}
                  disabled={!openSchools.length}
                >
                  Open school energy data<span className={classes.arrow}>&#9660;</span>
                </Button>
                <div style={{ height: openDataAnchorEl && showOpenDataMargin ? (32 * Math.min(openSchools.length, 3)) : 0 }} />
                <Menu
                  {...menuConfig}
                  anchorEl={openDataAnchorEl}
                  open={!!openDataAnchorEl}
                  onClose={() => handleClose(MENU.openData)}
                  className={classes.menu}
                >
                  {openSchools.map(school => (
                    <MenuItem
                      key={school.uid}
                      onClick={() => handleOpenEnergyData(school.uid)}
                      className={classes.menuItem}
                    >
                      {school.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
              <Button
                variant="outlined"
                className={classes.link}
                onClick={() => {
                  goToPage('/login');
                }}
              >
                Login (trial schools only)
              </Button>
            </Grid>
          </Grid>
          {cookiesConsentBannerOpened && <Grid style={{ height: 112 }} />}
        </Grid>
      </Grid>
      <img src={microbitBristol} alt="Samsung Microbit Bristol" className={classes.mainImage} />
    </Grid>
  );
};

LandingMainComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  goToPage: PropTypes.func.isRequired,
  openEditorHelpDialog: PropTypes.func.isRequired,
  openSchools: PropTypes.arrayOf(PropTypes.object).isRequired,
  cookiesConsentBannerOpened: PropTypes.bool.isRequired,
};

export default compose(
  withStyles(styles),
)(LandingMainComponent);
