import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { bindActionCreators, compose } from 'redux';
import { animateScroll as scroll } from 'react-scroll';

import queryString from 'query-string';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import List from '@material-ui/core/List';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import RootRef from '@material-ui/core/RootRef';

import InfoIcon from '@material-ui/icons/Info';

import { isEmpty, isNil } from 'lodash';

import paramsSerializer from '../../utils/paramsSerializer';

import * as manualsActions from '../../actions/manualsActions';
import * as dialogActions from '../../actions/dialogActions';
import ManualCard from './ManualCard';
import NoItems from '../../components/NoItems';

import {
  CATEGORY_ALL, DEFAULT_SELECTED_CATEGORIES, MIN_WINDOW_SCROLL_PIXELS, TAB, WINDOW_SCROLL_DELAY, getNonEmptyCategories,
} from './constants';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    backgroundImage: 'linear-gradient(to bottom, rgb(255, 255, 255), rgba(0, 150, 212, 0.1) 90%, rgba(147, 212, 242, 0.2))',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  manualContainer: {
    justifyContent: 'center',
    marginBottom: 70,
  },
  pageTitle: {
    height: 70,
    width: '100%',
    backgroundImage: 'radial-gradient(rgb(0, 188, 212), rgb(38, 229, 243))',
    [theme.breakpoints.down('sm')]: {
      height: 60,
    },
  },
  pageTitleText: {
    fontSize: 24,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 3,
    wordSpacing: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 20,
      letterSpacing: 2,
    },
  },

  categoryMenu: {
    width: '100%',
    maxHeight: 400,
    overflow: 'auto',
    color: 'rgba(0, 188, 212)',
    position: 'relative',
    backgroundImage: 'linear-gradient(to bottom, rgb(255, 255, 255), rgba(0, 200, 255, 0.1) 95%, rgba(0, 200, 255, 0.15))',
    backgroundColor: 'rgb(255, 255, 255)',
    zIndex: 1200,
    padding: '8px 0px',
    boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
  },

  categoryMenuList: {
    width: '100%',
    padding: 0,
    columns: '640px 2',
  },

  categoryMenuItem: {
    overflow: 'hidden',
    breakInside: 'avoid',
    paddingLeft: 25,
    maxWidth: '100%',
    '&:hover': {
      backgroundColor: 'rgba(0, 150, 255, 0.1)',
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: 15,
    },
  },

  categoryMenuItemTextRoot: {
    paddingRight: 8,
  },

  categoryMenuItemText: {
    fontFamily: 'Roboto, Helvetica',
    fontSize: 16,
    color: 'rgb(0, 188, 212)',
    textTransform: 'uppercase',
    fontWeight: 500,
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
  },

  categoriesList: {
    width: '100%', // for IE compatibility
  },

  categoryTitle: {
    padding: '32px 24px',
    [theme.breakpoints.down('md')]: {
      padding: 24,
    },
    [theme.breakpoints.only('xs')]: {
      padding: '24px 16px',
    },
  },

  categoryTitleText: {
    fontSize: 21,
    fontWeight: 500,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 2,
    wordSpacing: 5,
    color: 'rgb(0, 188, 220)',
    textTransform: 'uppercase',
    textAlign: 'center',
    borderBottom: '2px solid rgb(0, 188, 220)',
    [theme.breakpoints.only('sm')]: {
      fontSize: 18,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },

  manualItem: {
    position: 'relative',
    overflow: 'auto',
    width: 800,
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
  },

  expand: {
    visibility: 'hidden',
    position: 'fixed',
    right: '2%',
    bottom: 70,
    backgroundColor: 'rgb(0, 188, 212)',
    transform: 'rotate(180deg)',
    marginTop: 0,
    height: 40,
    width: 40,
    fontWeight: 700,
    zIndex: 100,
    padding: 0, // for proper centering in IE
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 0.7)',
    },
  },

  tabsMenuContainer: {
    width: '100%',
    backgroundImage: 'radial-gradient(rgb(38, 229, 243), rgb(0, 188, 212))',
    backgroundColor: 'rgb(255, 255, 255)',
  },

  tabLabelWrapper: {
    flexDirection: 'row',
    width: 'auto',
  },

  tabLabelIcon: {
    minHeight: 0,
    padding: 0,
  },

  tabLabelContainer: {
    padding: '6px 8px',
    textAlign: 'left',
  },

  tabsRoot: {
    width: '100%',
  },

  tabsIndicator: {
    backgroundColor: 'rgb(255, 255, 255)',
    bottom: 3,
  },

  tab: {
    width: 200,
    height: 64,
    color: 'rgb(255, 255, 255)',
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: 2,
    opacity: 0.9,
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
      width: '50%',
      height: 48,
    },
  },

  tabSelected: {
    fontWeight: 700,
  },

  manualCardWrapper: {
    marginBottom: 16,
  },

  manualCardRoot: {
    width: '90%',
    [theme.breakpoints.only('sm')]: {
      width: '80%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  listIcon: {
    fontSize: 32,
    marginBottom: '0px !important',
    marginRight: 6,
    [theme.breakpoints.down('sm')]: {
      fontSize: 28,
    },
  },
  hintContainer: {
    marginTop: 8,
    padding: 32,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 24,
      paddingRight: 16,
    },
  },
  hintBlock: {
    position: 'relative',
  },
  infoIcon: {
    position: 'absolute',
    top: -14,
    left: -14,
    color: 'rgb(92, 197, 231)',
    fontSize: 28,
  },
  hintText: {
    marginLeft: 16,
    fontSize: 21,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.7)',
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
    },
  },
});

class Manuals extends React.Component {
  state = {
    loading: true, // need it to prevent extra rendering
    nonEmptyCategories: [],
    selectedTab: TAB.preview.value,
    selectedCategory: null,
    showMenu: false,
  };

  tabsMenuRef = React.createRef();

  scrollButtonRef = React.createRef();

  componentDidMount() {
    const { actions } = this.props;
    window.addEventListener('scroll', this.handleWindowScroll);
    actions.getCategories()
      .then(() => {
        this.setComponentStateFromQuery();
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleWindowScroll);
    this.onBeforeNavigateOut();
  }

  static getDerivedStateFromProps(props, currentState) {
    if (isEmpty(currentState.notEmptyCategories) && !isEmpty(props.categories.data)) {
      const nonEmptyCategories = getNonEmptyCategories(props.categories.data);
      return {
        nonEmptyCategories,
      };
    }
    return null;
  }

  getDefaultSelectedCategories = () => {
    const { nonEmptyCategories } = this.state;
    if (!nonEmptyCategories.length) return [];
    const defaultSelectedCategories = nonEmptyCategories.filter(category => DEFAULT_SELECTED_CATEGORIES.includes(category.title));
    return defaultSelectedCategories.length > 0 ? defaultSelectedCategories : [nonEmptyCategories[0]];
  };

  getParamsFromQuery = () => {
    const { location } = this.props;
    try {
      const query = queryString.parse(location.search);
      if (isNil(query) || isNil(query.category)) return {};
      return { targetCategory: query.category };
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
      return {};
    }
  }

  setComponentStateFromQuery = () => {
    const { categories } = this.props;
    const { targetCategory } = this.getParamsFromQuery();
    if (isNil(targetCategory) || DEFAULT_SELECTED_CATEGORIES.includes(targetCategory)) return;
    if (targetCategory === CATEGORY_ALL || categories.data.some(category => category.title === targetCategory)) {
      this.navigateToCategory(targetCategory)();
    }
  }

  handleClickOutside = (e) => {
    if (!this.menu.contains(e.target)) {
      this.toggleDrawer(false);
    }
  };

  handleTabChange = (event, value) => {
    const { selectedTab, showMenu } = this.state;
    if (value === TAB.categories.value) {
      if (!showMenu) {
        this.toggleDrawer(true);
      }
      return;
    }
    if (selectedTab !== value) {
      this.setState({ selectedTab: value });
    }
  };

  handleWindowScroll = () => {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(window).scrollTop();
      if (isNil(this.scrollButtonRef) || isNil(this.scrollButtonRef.current)) return;
      this.scrollButtonRef.current.style.visibility = scrollY > MIN_WINDOW_SCROLL_PIXELS ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  openDetailedManualView = manualSlug => () => {
    const { history } = this.props;
    const path = `/manuals/${manualSlug}`;
    history.push(path);
  };

  navigateToCategory = categoryTitle => () => {
    this.setState({
      selectedCategory: categoryTitle,
      selectedTab: TAB.categories.value,
    }, () => {
      this.toggleDrawer(false);
    });
  };

  getSelectedCategories = (categories) => {
    const { selectedTab } = this.state;
    switch (selectedTab) {
      case TAB.preview.value:
        return this.getDefaultSelectedCategories();
      case TAB.categories.value: {
        const { selectedCategory } = this.state;
        if (isNil(selectedCategory)) return [];
        if (selectedCategory === CATEGORY_ALL) {
          return categories;
        }
        return categories.filter(category => category.title === selectedCategory);
      }
      default:
        return [];
    }
  };

  onBeforeNavigateOut = () => {
    const { history, location } = this.props;
    const { selectedCategory, selectedTab } = this.state;
    const queryParamsString = paramsSerializer({
      category: selectedTab !== TAB.preview.value ? selectedCategory : undefined,
    });
    const targetRouterLocation = { ...history.location };
    history.replace({
      pathname: location.pathname,
      search: `?${queryParamsString}`,
    });
    history.push({ ...targetRouterLocation });
  }

  toggleDrawer = (open) => {
    this.setState({
      showMenu: open,
    });
  };

  render() {
    const { loading } = this.state;

    if (loading) return null;

    const {
      nonEmptyCategories, selectedTab, showMenu,
    } = this.state;

    const { classes } = this.props;

    const selectedCategories = this.getSelectedCategories(nonEmptyCategories);

    const categoriesAvailable = nonEmptyCategories.length > 0;

    const menuList = (
      <div ref={(node) => { this.menu = node; }} className={classes.categoryMenu}>
        <List component="div" className={classes.categoryMenuList}>
          { nonEmptyCategories.map((category) => {
            const categoryTitle = category.title;
            return (
              <ListItem key={category.id} button className={classes.categoryMenuItem} disableRipple onClick={this.navigateToCategory(categoryTitle)}>
                <ListItemText primary={categoryTitle} classes={{ root: classes.categoryMenuItemTextRoot, primary: classes.categoryMenuItemText }} />
              </ListItem>
            );
          })
          }
          {(
            <ListItem button className={classes.categoryMenuItem} disableRipple onClick={this.navigateToCategory(CATEGORY_ALL)}>
              <ListItemText primary={CATEGORY_ALL} classes={{ primary: classes.categoryMenuItemText }} />
            </ListItem>)
          }
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <Grid container className={classes.manualContainer}>
          { categoriesAvailable ? (
            <Grid item container xs={12} justify="center">
              <Grid item container xs={12} justify="center" alignItems="center" className={classes.pageTitle}>
                <Typography align="center" className={classes.pageTitleText}>MANUALS AND TUTORIALS</Typography>
              </Grid>
              <Grid container>
                <div className={classes.tabsMenuContainer} ref={this.tabsMenuRef}>
                  <Tabs
                    name="tabsMenu"
                    classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                    value={selectedTab}
                    onChange={this.handleTabChange}
                    centered
                  >
                    {Object.values(TAB).map((tab) => {
                      const { label, value } = tab;
                      const TabIcon = tab.icon;
                      return (
                        <Tab
                          key={value}
                          classes={{
                            root: classes.tab,
                            wrapper: classes.tabLabelWrapper,
                            labelIcon: classes.tabLabelIcon,
                            selected: classes.tabSelected,
                          }}
                          label={(
                            <span>{label}</span>
                          )}
                          icon={!isNil(TabIcon) ? (<TabIcon className={classes.listIcon} />) : null}
                          value={value}
                        />
                      );
                    })
                    }
                  </Tabs>
                </div>
                <Grid item container xs={12}>
                  <Popper
                    anchorEl={this.tabsMenuRef.current}
                    open={showMenu}
                    placement="bottom"
                    transition
                    style={{ zIndex: 10000, width: '100%', opacity: 1 }}
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
                          {menuList}
                        </Grow>
                      </ClickAwayListener>
                    )}
                  </Popper>
                </Grid>
                { selectedCategories.map((category) => {
                  const categoryTitle = category.title;
                  return (
                    <Grid key={category.id} item container xs={12} justify="center">
                      <Grid item container justify="center" xs={12} className={classes.categoryTitle}>
                        <Typography className={classes.categoryTitleText}>
                          {categoryTitle}
                        </Typography>
                      </Grid>
                      { category.manuals.map((manual) => {
                        const manualId = manual.id;
                        return (
                          <Grid key={manualId} className={classes.manualCardWrapper} item container justify="center" xs={12} md={6} lg={4} xl={3}>
                            <ManualCard
                              classes={{
                                card: classes.manualCardRoot,
                              }}
                              manualId={manualId}
                              manualTitle={manual.title}
                              manualAvatarImage={manual.avatar_image}
                              manualAvatarVideo={manual.avatar_video}
                              onDetailClick={this.openDetailedManualView(manual.slug)}
                            />
                          </Grid>
                        );
                      })
                      }
                    </Grid>
                  );
                })
                }
                {(selectedTab === TAB.preview.value) && (
                  <Grid item container xs={12} justify="center" alignItems="center" className={classes.hintContainer}>
                    <Typography component="div" className={classes.hintBlock}>
                      <InfoIcon className={classes.infoIcon} />
                      <Typography className={classes.hintText}>
                        For installation instructions please select &quot;Categories&quot; from the menu above.
                      </Typography>
                    </Typography>
                  </Grid>
                )}
              </Grid>
              <Grid item container xs={12} justify="center">
                { categoriesAvailable && (
                  <RootRef rootRef={this.scrollButtonRef}>
                    <IconButton
                      className={classes.expand}
                      onClick={() => { scroll.scrollToTop(); }}
                    >
                      <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
                    </IconButton>
                  </RootRef>
                )}
              </Grid>
            </Grid>
          ) : (<NoItems style={{ padding: 60 }} />)
          }
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    manuals: state.manuals,
    categories: state.categories,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...manualsActions,
      ...dialogActions,
    }, dispatch),
  };
}

Manuals.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(Manuals);
