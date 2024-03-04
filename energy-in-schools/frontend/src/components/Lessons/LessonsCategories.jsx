import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import LessonCategoryCard from './LessonCategoryCard';

import * as lessonsActions from '../../actions/lessonsActions';
import { showMessageSnackbar } from '../../actions/dialogActions';
import NoItems from '../NoItems';

const styles = theme => ({
  root: {
    width: '100%',
  },
  categoriesContainer: {
    marginTop: 24,
    padding: 24,
    overflowX: 'hidden',
    [theme.breakpoints.down('xs')]: {
      marginTop: 8,
      marginBottom: 8,
      padding: 0,
    },
  },
  mobileCategoriesWrapper: {
    [theme.breakpoints.down('xs')]: {
      width: '100% !important',
      margin: '0px !important',
    },
  },
  categoryCardWrapper: {
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: '8px !important',
    },
  },
});

class LessonsCategories extends React.Component {
  state = {
    loading: true,
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getLessonsCategories()
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  onCategoryDetailClick = category => () => {
    const { id } = category;
    const { history } = this.props;
    history.push(`/lessons/${id}`);
  }

  render() {
    const { loading } = this.state;

    if (loading) return null;

    const { actions, classes, categories: { data } } = this.props;

    return (
      <div className={classes.root}>
        <Grid container className={classes.categoriesContainer} justify="center">
          {data.length > 0 ? (
            <Grid item container xs={12} lg={10} justify="center" spacing={6} classes={{ 'spacing-xs-6': classes.mobileCategoriesWrapper }}>
              {data.map((category) => {
                const { id, title, overview } = category;
                return (
                  <Grid key={id} item className={classes.categoryCardWrapper}>
                    <LessonCategoryCard
                      avatar={category.group_avatar}
                      title={title}
                      overview={overview}
                      onDetailClick={this.onCategoryDetailClick(category)}
                      showMessageSnackbar={actions.showMessageSnackbar}
                    />
                  </Grid>
                );
              })
              }
            </Grid>
          ) : (
            <NoItems />
          )
          }
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    categories: state.lessonsCategories,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      showMessageSnackbar,
      ...lessonsActions,
    }, dispatch),
  };
}

LessonsCategories.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default compose(
  withRouter,
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(LessonsCategories);
