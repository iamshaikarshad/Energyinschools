import React from 'react';
import _, { isNil } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { Element, scroller } from 'react-scroll';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import LearningResource from './LearningResource';

// import ProjectsAndActivities from './ProjectsAndActivities';
import { showMessageSnackbar } from '../../actions/dialogActions';
import { getLessonsGroups } from '../../actions/lessonsActions';
import {
  LANDING_PAGE_COMMON_STYLES,
  MIN_SCROLL_PIXELS_COUNT_TO_SHOW_SCROLL_BUTTON,
  WINDOW_SCROLL_DELAY,
} from '../LandingPage/constants';
import { ENERGY_CHAMPIONS_BLOCK, LESSON_PLANS_BLOCK } from '../../constants/routing';
import benefits from '../../images/LandingPageArts/benefits.jpg';

const styles = theme => ({
  ...LANDING_PAGE_COMMON_STYLES(theme),
  background: {
    backgroundColor: '#f2efed',
    marginBottom: 40,
  },
  blackTitle: {
    margin: '40px 0 10px 0',
    color: '#000',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    [theme.breakpoints.down('xs')]: {
      fontSize: 30,
    },
  },
  overview: {
    textAlign: 'justify',
    fontFamily: 'Inter',
    fontSize: 20,
    [theme.breakpoints.down('xs')]: {
      fontSize: 15,
    },
  },
  energyChampionsBlock: {
    marginTop: 30,
  },
});

const SCROLLER_DEFAULT_OFFSET = 0;

const SCROLLER_CONFIG = Object.freeze({
  duration: 1000,
  delay: 100,
  smooth: true,
});

class LessonPlans extends React.PureComponent {
  state = {
    loading: true,
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getLessonsGroups()
      .finally(() => {
        this.setState({ loading: false });
      });

    window.addEventListener('scroll', this.windowScrollHandler);
  }

  componentDidUpdate() {
    const { loading } = this.state;
    const { history, match: { params: { activeBlock } } } = this.props;

    if (!loading && activeBlock) {
      this.onNavigate(activeBlock);
      history.push('/learning-resources');
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.windowScrollHandler);
  }

  downloadLessonMaterials = (lessonPlanUrl) => {
    const { actions } = this.props;

    if (lessonPlanUrl) {
      const link = document.createElement('a');
      link.href = lessonPlanUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      actions.showMessageSnackbar('No materials', 3000);
    }
  };

  onNavigate = (pageName, offset = SCROLLER_DEFAULT_OFFSET) => {
    scroller.scrollTo(pageName, {
      ...SCROLLER_CONFIG,
      offset,
    });
  };

  windowScrollHandler = () => {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = $(window).scrollTop();
      if (isNil(this.scrollButtonRef) || isNil(this.scrollButtonRef.current)) return;
      this.scrollButtonRef.current.style.visibility = scrollY > MIN_SCROLL_PIXELS_COUNT_TO_SHOW_SCROLL_BUTTON ? 'visible' : 'hidden';
    }, WINDOW_SCROLL_DELAY);
  }

  render() {
    const { loading } = this.state;
    const {
      classes, actions, groups: { data },
    } = this.props;

    const blocks = _.groupBy(data, 'type');

    if (loading) {
      return null;
    }

    const lessons = blocks['learning-resources'] || [];
    const energyChampions = blocks['energy-champions'] || [];

    return (
      <Grid container justify="center" className={classes.background}>
        <Grid item container xs={10} md={9}>
          <Element name={LESSON_PLANS_BLOCK}>
            <h1 className={classes.blackTitle}>Learning resources</h1>
            {lessons && lessons.map((lesson, index) => (
              <LearningResource
                key={`lesson-${lesson.id}`}
                index={index}
                lesson={lesson}
                downloadMaterials={this.downloadLessonMaterials}
                showMessageSnackbar={actions.showMessageSnackbar}
              />
            ))}
          </Element>
        </Grid>
        {/* <ProjectsAndActivities */}
        {/*   cards={blocks['projects-and-activities'] || []} */}
        {/*   downloadMaterials={this.downloadLessonMaterials} */}
        {/*   showMessageSnackbar={actions.showMessageSnackbar} */}
        {/* /> */}
        <Element name={ENERGY_CHAMPIONS_BLOCK}>
          <Grid container justify="center">
            <Grid item container xs={10} md={9}>
              <h1 className={classes.blackTitle}>Energy champions</h1>
            </Grid>
            {energyChampions && energyChampions.map((energyChampion, index) => (
              <Grid container justify="center" className={classes.energyChampionsBlock}>
                <Grid container className={classes.whiteBackground}>
                  <Grid item container xs={12} md={6} className={classes.benefitsImageBlock}>
                    <img src={benefits} alt="Benefits" className={classes.benefitsImage} />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Grid container direction="column" className={classes.benefitsBlock}>
                      <h1 className={classes.title}>{energyChampion.title}</h1>
                      <p className={classes.overview}>{energyChampion.overview}</p>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item container xs={10} md={9}>
                  <LearningResource
                    energyChampionsResource
                    index={index + lessons.length}
                    lesson={energyChampion}
                    downloadMaterials={this.downloadLessonMaterials}
                    showMessageSnackbar={actions.showMessageSnackbar}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Element>
      </Grid>
    );
  }
}

LessonPlans.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    groups: state.lessonsGroups,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      showMessageSnackbar,
      getLessonsGroups,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(LessonPlans);
