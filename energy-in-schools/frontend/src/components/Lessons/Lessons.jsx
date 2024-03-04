import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import queryString from 'query-string';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import RootRef from '@material-ui/core/RootRef';

import { isNil, isEmpty } from 'lodash';

import { animateScroll as scroll, Element, scroller } from 'react-scroll';

import * as lessonsActions from '../../actions/lessonsActions';
import { showMessageSnackbar } from '../../actions/dialogActions';

import LessonCard from './LessonCard';
import LessonsNavigationPanel from './LessonsNavigationPanel';
import Lesson from './Lesson';
import NoItems from '../NoItems';

import copyClick from '../../utils/copyClick';

import getInteger from '../../utils/getInteger';

import paramsSerializer from '../../utils/paramsSerializer';

import isMobileBrowser from '../../utils/detectMobileBrowser';

import {
  NAVIGATION_PANEL_DEFAULT_STATE,
  MIN_SCROLL_PIXELS,
  SCROLLER_CONFIG,
  LESSON_PREFIX,
  LESSONS_NAVIGATION_PANEL_CONTAINER_ID,
  LESSON_SEARCH_NUMERATION_PROP,
  WINDOW_SCROLL_DELAY,
  WINDOW_RESIZE_DELAY,
} from './constants';

import { ROUTE_PATH } from '../../constants/routing';

import { APP_TOP_BAR_ID } from '../../constants/config';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
  },
  navigationPanelContainer: {
    position: 'fixed',
    left: 0,
    zIndex: 100,
  },
  lessonsList: {
    width: '100%', // for IE compatibility
    marginTop: 8,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 0,
    },
  },
  expand: {
    visibility: 'hidden',
    position: 'fixed',
    right: '2%',
    bottom: 60,
    left: 'auto',
    top: 'auto',
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
  navigationPanelRoot: {
    backgroundColor: 'rgba(236, 252, 255, 1)',
  },
  specialLessonCard: {
    backgroundColor: 'rgba(247, 252, 255, 1)',
  },
});

class Lessons extends React.PureComponent {
  state = {
    navigationPanelExpanded: NAVIGATION_PANEL_DEFAULT_STATE,
  };

  navigationPanelPositionInfo = {
    top: 0,
    height: 0,
  };

  scrollButtonRef = React.createRef();

  isMobile = isMobileBrowser();

  componentDidMount() {
    const { actions, match: { params } } = this.props;
    const lessonsCategoryId = getInteger(params.category_id);
    window.addEventListener('scroll', this.windowScrollHandler);
    if (this.isMobile) {
      this.bindWindowChangeOrientationHandler();
    } else {
      this.bindWindowResizeHandler();
    }
    if (isNil(lessonsCategoryId) || lessonsCategoryId <= 0) return;
    actions.getLessons(lessonsCategoryId)
      .then((lessons) => {
        let currentLesson;
        try {
          const { location: { search } } = this.props;
          const lessonSearchRouteNumber = queryString.parse(search)[LESSON_SEARCH_NUMERATION_PROP];
          if (!isNil(lessonSearchRouteNumber)) {
            currentLesson = lessons.find(lessonData => lessonSearchRouteNumber === String(lessonData.session_number));
          }
          if (!isNil(currentLesson)) {
            this.onNavigate(currentLesson.id);
          } else {
            scroll.scrollToTop();
          }
        } catch (e) {
          console.log(e); // eslint-disable-line no-console
        }
      });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.windowScrollHandler);
    window.removeEventListener('orientationchange', this.windowChangeOrientationHandler);
    window.removeEventListener('resize', this.windowResizeHandler);
  }

  onCopyLink = lessonData => (e) => {
    e.stopPropagation();
    const { actions } = this.props;
    const { origin } = window.location;
    const searchString = paramsSerializer({ [LESSON_SEARCH_NUMERATION_PROP]: lessonData.session_number });
    const lessonLink = `${origin}${ROUTE_PATH.lessons}/${lessonData.lesson_group}?${searchString}`;
    copyClick(lessonLink, 'Copied link to clipboard', actions.showMessageSnackbar);
  };

  onNavigate = (dataId) => {
    const targetName = this.getNavigationElementName(dataId);
    this.scrollToElement(targetName)();
  };

  onNavigationPanelExpandChange = () => {
    this.setState(prevState => ({ navigationPanelExpanded: !prevState.navigationPanelExpanded }));
  };

  getNavigationElementName = dataId => `${LESSON_PREFIX}${dataId}`;

  getLessonLabel = lessonData => lessonData.lesson_label;

  getElementHeight = (elementId, defaultHeight = 0) => {
    const element = $(`#${elementId}`);
    const height = element.height();
    return !isNil(height) ? height : defaultHeight;
  }

  downloadLessonMaterials = (lessonPlanUrl, fileName) => (e) => {
    e.stopPropagation();
    const { actions } = this.props;
    actions.downloadLessonMaterials(lessonPlanUrl, fileName);
  };

  downloadCategoryLessonsMaterials = lessons => (e) => {
    e.stopPropagation();
    const { actions } = this.props;
    if (isEmpty(lessons)) return;
    const categoryId = lessons[0].lesson_group;
    actions.getLessonCategory(categoryId)
      .then((data) => {
        if (!isNil(data) && !isNil(data.materials)) {
          actions.downloadLessonMaterials(data.materials, `${data.title}_all_materials`);
        } else {
          actions.showMessageSnackbar('No materials!', 4000);
        }
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
        actions.showMessageSnackbar('Something went wrong! Try it later', 4000);
      });
  }

  scrollToElement = elementName => () => {
    const { height, top } = this.navigationPanelPositionInfo;
    const offset = (-1) * (height + top);
    scroller.scrollTo(elementName, {
      ...SCROLLER_CONFIG,
      offset,
    });
  };

  bindWindowChangeOrientationHandler = () => {
    window.addEventListener('orientationchange', this.windowChangeOrientationHandler);
  };

  bindWindowResizeHandler = () => {
    window.addEventListener('resize', this.windowResizeHandler);
  };

  windowScrollHandler = () => {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(window).scrollTop();
      if (isNil(this.scrollButtonRef) || isNil(this.scrollButtonRef.current)) return;
      this.scrollButtonRef.current.style.visibility = scrollY > MIN_SCROLL_PIXELS ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  windowResizeHandler = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.update();
    }, WINDOW_RESIZE_DELAY);
  };

  windowChangeOrientationHandler = () => {
    setTimeout(() => {
      this.update();
    }, WINDOW_RESIZE_DELAY);
  };

  update = () => {
    this.setState(prevState => prevState); // safe analog of forceUpdate
  };

  render() {
    const { actions, classes, lessons: { data } } = this.props;

    const lessonsAvailable = data.length > 0;

    if (!lessonsAvailable) return (<NoItems paddingTop={0} />);

    const numerationData = data.map((lessonData) => {
      const numerationLabel = this.getLessonLabel(lessonData);
      return {
        label: numerationLabel,
        dataId: lessonData.id,
      };
    });

    const showDownloadAllButton = lessonsAvailable && data.some(lessonData => Boolean(lessonData.plan_material));

    this.navigationPanelPositionInfo = {
      top: this.getElementHeight(APP_TOP_BAR_ID),
      height: this.getElementHeight(LESSONS_NAVIGATION_PANEL_CONTAINER_ID),
    };

    return (
      <div className={classes.root}>
        <Grid
          id={LESSONS_NAVIGATION_PANEL_CONTAINER_ID}
          container
          alignItems="center"
          justify="center"
          className={classes.navigationPanelContainer}
          style={{ top: this.navigationPanelPositionInfo.top }}
        >
          <Grid item container xs={12} md={10}>
            <LessonsNavigationPanel
              classes={{ root: classes.navigationPanelRoot }}
              numerationData={numerationData}
              onNavigate={this.onNavigate}
              onNavigationPanelExpandChange={this.onNavigationPanelExpandChange}
            />
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="center">
          <Grid item container xs={12} md={10} style={{ overflow: 'hidden', marginTop: this.navigationPanelPositionInfo.height }}>
            <List component="div" classes={{ root: classes.lessonsList }}>
              {showDownloadAllButton && (
                <Element>
                  <LessonCard
                    classes={{ root: classes.specialLessonCard }}
                    subTitle="ALL MATERIALS"
                    title="All Materials"
                    overview="Download all supporting documentation"
                    primaryButtonLabel="Download"
                    onPrimaryButtonClick={this.downloadCategoryLessonsMaterials(data)}
                  />
                </Element>
              )}
              {
                data.map((lessonData, index) => {
                  const { id } = lessonData;
                  return (
                    <Element key={id} name={this.getNavigationElementName(id)}>
                      <Lesson
                        lessonData={lessonData}
                        listIndex={index}
                        downloadData={
                          this.downloadLessonMaterials(
                            lessonData.plan_material,
                            'lesson_materials',
                          )
                        }
                        copyLink={this.onCopyLink(lessonData)}
                        showMessageSnackbar={actions.showMessageSnackbar}
                      />
                    </Element>
                  );
                })
              }
            </List>
          </Grid>
        </Grid>
        <RootRef rootRef={this.scrollButtonRef}>
          <IconButton
            className={classes.expand}
            onClick={() => { scroll.scrollToTop(); }}
          >
            <ExpandMore style={{ color: 'rgb(255, 255, 255)' }} />
          </IconButton>
        </RootRef>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    lessons: state.lessons,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...lessonsActions,
      showMessageSnackbar,
    }, dispatch),
  };
}

Lessons.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  lessons: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Lessons);
