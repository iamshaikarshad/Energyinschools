import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'redux';
import { animateScroll as scroll } from 'react-scroll';

import Grid from '@material-ui/core/Grid';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import RootRef from '@material-ui/core/RootRef';

import { isNil } from 'lodash';

import {
  ENERGY_MANAGER_DASHBOARD_ITEMS, CARD_STYLE, MIN_WINDOW_SCROLL_PIXELS, WINDOW_SCROLL_DELAY, ENERGY_MANAGER_DASHBOARD_CURRENT_THEME,
} from './constants';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    backgroundImage: ENERGY_MANAGER_DASHBOARD_CURRENT_THEME.main.backgroundImage,
    overflowX: 'hidden',
    [theme.breakpoints.up('lg')]: {
      minHeight: '87vh', // need it only for IE
    },
  },
  cardRoot: {
    ...CARD_STYLE,
  },
  dashboardContainer: {
    justifyContent: 'center',
    marginBottom: 70,
  },
  pageTitle: {
    height: 80,
    width: '100%',
    backgroundImage: ENERGY_MANAGER_DASHBOARD_CURRENT_THEME.header.backgroundImage,
    [theme.breakpoints.down('md')]: {
      height: 60,
    },
  },
  pageTitleText: {
    fontSize: 24,
    fontWeight: 500,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 3,
    wordSpacing: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 21,
    },
  },
  expand: {
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
  menuButtonContainer: {
    width: '100%',
    minHeight: 24,
    textAlign: 'right',
    padding: '0px 8px',
  },
});

class EnergyManagerDashboard extends React.Component {
  mobileMenuRef = React.createRef();

  scrollButtonRef = React.createRef();

  componentDidMount() {
    window.addEventListener('scroll', this.handleWindowScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleWindowScroll);
  }

  handleWindowScroll = () => {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(window).scrollTop();
      if (isNil(this.scrollButtonRef) || isNil(this.scrollButtonRef.current)) return;
      this.scrollButtonRef.current.style.visibility = scrollY > MIN_WINDOW_SCROLL_PIXELS ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container justify="center" className={classes.dashboardContainer}>
          <Grid item container xs={12} justify="center">
            <Grid item container xs={12} justify="center" alignItems="center" className={classes.pageTitle}>
              <Typography align="center" className={classes.pageTitleText}>Energy Dashboard</Typography>
            </Grid>
            <Grid container>
              <div className={classes.menuButtonContainer} ref={this.mobileMenuRef} />
            </Grid>
            <Grid container justify="center" spacing={3}>
              <Grid item container lg={10} spacing={3} justify="center">
                {ENERGY_MANAGER_DASHBOARD_ITEMS.map((item) => {
                  const ItemComponent = item.component;
                  const { name } = item;
                  return (
                    <Grid key={`energy_manager_dashboard_item_${item.id}`} item xs={12} sm={10} md={9} lg={6} className={classes.itemComponentWrapper}>
                      <ItemComponent classes={{ root: classes.cardRoot }} name={name} />
                    </Grid>
                  );
                })
                }
              </Grid>
            </Grid>
            <Grid item container xs={12} justify="center">
              <RootRef rootRef={this.scrollButtonRef}>
                <IconButton
                  className={classes.expand}
                  onClick={() => { scroll.scrollToTop(); }}
                >
                  <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
                </IconButton>
              </RootRef>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

EnergyManagerDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(EnergyManagerDashboard);
