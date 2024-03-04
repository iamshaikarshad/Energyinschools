import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { createFilter } from 'react-search-input';
import ReactPaginate from 'react-paginate';

import * as dialogActions from '../actions/dialogActions';
import * as schoolsActions from '../actions/schoolsActions';
import * as feedbacksActions from '../actions/feedbacksActions';

import SLEAdminHeader from '../components/SLEAdminHeader';
import NewEditFeedbackDialog from '../components/dialogs/NewEditFeedbackDialog';
import FeedbackItem from '../components/Feedback/FeedbackItem';
import FeedbacksHeader from '../components/Feedback/FeedbacksHeader';
import NoItems from '../components/NoItems';

import { FEEDBACK_ERROR_MESSAGE, FEEDBACK_SUCCESS_MESSAGE, FEEDBACK_MESSAGE_DELAY } from '../components/Feedback/constants';

import { ADMIN_ROLE } from '../constants/config';

import PAGINATION_UTILS from '../utils/paginationUtils';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  adminHeaderWrapper: {
    padding: '50px 0px',
    [theme.breakpoints.down('xs')]: {
      paddingTop: 30,
      paddingBottom: 16,
    },
  },
  item: {
    padding: theme.spacing(2),
  },
  title: {
    color: '#555555',
    fontSize: '18px',
  },
  subheader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#00bcd4',
    lineHeight: '16px',
  },
  adminHeader: {
    marginTop: 25,
    [theme.breakpoints.down('sm')]: {
      marginTop: 15,
    },
  },
  ...PAGINATION_UTILS.styles,
});

const KEYS_TO_FILTER = ['content'];

class FeedbackPage extends React.Component {
  state = {
    fromMyLocation: true,
    searchTerm: '',
    page: 0,
    itemsPerPage: 10,
    createFeedbackDialogOpened: false,
    nowTs: moment().unix(),
  };

  componentDidMount() {
    const { actions, user } = this.props;
    const isAdmin = this.isAdmin(user);
    if (!isAdmin) {
      actions.getSchoolInformation(user.location_id);
    }
    this.getFeedbacksList();
  }

  onCreateFeedbackSubmit = async (type, text, tags) => {
    const { actions, user, school } = this.props;
    const createResponse = await actions.createFeedback(user.id, school.uid, type, text, tags)
      .catch(() => {
        this.showMessage(FEEDBACK_ERROR_MESSAGE.post);
      });
    if (createResponse) {
      this.toggleCreateFeedbackDialog();
      this.showMessage(FEEDBACK_SUCCESS_MESSAGE.topic_created, FEEDBACK_MESSAGE_DELAY);
      this.getFeedbacksList();
    }
  };

  getFeedbacksList = async () => {
    const { actions, user } = this.props;
    const { fromMyLocation } = this.state;

    const isAdmin = this.isAdmin(user);
    const feedbacks = await actions.getFeedbacks(fromMyLocation && !isAdmin)
      .catch(() => {
        this.showMessage(FEEDBACK_ERROR_MESSAGE.get);
      });
    if (feedbacks) {
      this.updateTime();
    }
  };

  handleChangeFromMyLocation = getFeedbacks => () => {
    this.setState((prevState) => {
      getFeedbacks(!prevState.fromMyLocation);
      return { fromMyLocation: !prevState.fromMyLocation };
    });
  };

  handleDecrease = () => {
    const { itemsPerPage } = this.state;
    if (itemsPerPage > 1) {
      this.setState(prevState => ({ itemsPerPage: prevState.itemsPerPage - 1 }));
    }
  };

  handleIncrease = () => {
    this.setState(prevState => ({ itemsPerPage: prevState.itemsPerPage + 1 }));
  };

  handlePageClick = (data) => {
    const selected = data.selected;
    this.setState({ page: selected });
  };

  isAdmin = user => user.role === ADMIN_ROLE;

  searchUpdate = (term) => {
    this.setState({ searchTerm: term, page: 0 });
  };

  showMessage = (message, delay = 3000) => {
    const { actions } = this.props;
    actions.showMessageSnackbar(message, delay);
  };

  toggleCreateFeedbackDialog = () => {
    this.setState(prevState => ({
      createFeedbackDialogOpened: !prevState.createFeedbackDialogOpened,
    }));
  };

  updateTime = () => {
    this.setState({ nowTs: moment().unix() });
  };

  render() {
    const {
      classes, school, actions, feedbacks, user,
    } = this.props;

    const {
      createFeedbackDialogOpened, searchTerm, itemsPerPage, page, fromMyLocation, nowTs,
    } = this.state;

    const filteredFeedbacks = feedbacks.data.filter(createFilter(searchTerm, KEYS_TO_FILTER));

    const itemsCount = filteredFeedbacks.length;

    const pageCount = Math.ceil(itemsCount / itemsPerPage);

    const feedbacksToShow = PAGINATION_UTILS.getItemsToShow(filteredFeedbacks, page, itemsPerPage);

    const isAdmin = this.isAdmin(user);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          {(!isAdmin && school.name)
            && (
            <Grid item container xs={12} md={10} className={classes.adminHeaderWrapper}>
              <SLEAdminHeader
                title={school.name}
                schoolID={school.uid}
                onRefreshClick={() => { this.getFeedbacksList(); }}
                rightContent={{
                  label: 'CREATE QUESTION',
                  onClick: this.toggleCreateFeedbackDialog,
                }}
              />
            </Grid>
            )
          }
          {feedbacks.data.length
            ? (
              <Grid item container xs={12} md={10} className={isAdmin ? classes.adminHeader : ''}>
                <FeedbacksHeader
                  count={itemsCount}
                  itemsPerPage={itemsPerPage}
                  searchUpdate={this.searchUpdate}
                  handleIncrease={this.handleIncrease}
                  handleDecrease={this.handleDecrease}
                  fromMyLocation={fromMyLocation}
                  handleChangeFromMyLocation={this.handleChangeFromMyLocation(actions.getFeedbacks)}
                  isAdmin={isAdmin}
                />
              </Grid>
            )
            : null
          }
          <Grid xs={12} md={10} item container justify="center">
            {
              feedbacksToShow.length ? (
                <React.Fragment>
                  {
                    feedbacksToShow.map(feedback => (
                      <FeedbackItem
                        key={feedback.id}
                        feedback={feedback}
                        nowTs={nowTs}
                        showMessage={this.showMessage}
                        updateFeedbacksList={this.getFeedbacksList}
                        isAdmin={isAdmin}
                        location={school}
                        user={user}
                      />
                    ))
                  }
                  {pageCount > 1
                    ? (
                      <ReactPaginate
                        previousLabel="<"
                        nextLabel=">"
                        breakLabel={<span>...</span>}
                        breakClassName={classes.paginationBreak}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick}
                        containerClassName={classes.pagination}
                        pageClassName={classes.paginationItem}
                        previousClassName={`${classes.paginationItem} ${classes.prevNext}`}
                        nextClassName={`${classes.paginationItem} ${classes.prevNext}`}
                        activeClassName={classes.active}
                        disabledClassName={classes.disabled}
                      />
                    )
                    : null
                  }
                </React.Fragment>
              ) : (
                <NoItems />
              )
            }
          </Grid>
        </Grid>
        <NewEditFeedbackDialog
          isOpened={createFeedbackDialogOpened}
          onClose={this.toggleCreateFeedbackDialog}
          onSubmit={this.onCreateFeedbackSubmit}
        />
      </div>
    );
  }
}

FeedbackPage.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  feedbacks: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...schoolsActions,
      ...feedbacksActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    user: state.users.currentUser,
    allLocations: state.schools.allLocations,
    feedbacks: state.feedbacks,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(FeedbackPage);
