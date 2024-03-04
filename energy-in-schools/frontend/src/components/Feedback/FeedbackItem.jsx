import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import * as feedbacksActions from '../../actions/feedbacksActions';

import NewEditCommentDialog from '../dialogs/NewEditCommentDialog';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import NewEditFeedbackDialog from '../dialogs/NewEditFeedbackDialog';
import FeedbackComment from './FeedbackComment';

import dialogIcon from '../../images/dialog.svg';
import editBlueIcon from '../../images/edit_blue.svg';
import editTabletIcon from '../../images/feedback_edit_tablet.svg';
import deleteTabletIcon from '../../images/feedback_delete_tablet.svg';
import deleteIcon from '../../images/feedback_delete.svg';
import noCommentsBg from '../../images/no_comments_bg.svg';

import {
  FEEDBACK_COLORS,
  MAX_TEXT_LENGTH,
  MAX_TAGS_COUNT_TO_SHOW,
  FEEDBACK_TEXT_BOX,
  FEEDBACK_ERROR_MESSAGE,
  FEEDBACK_TYPES,
  FEEDBACK_TAGS,
  FEEDBACK_SUCCESS_MESSAGE,
  FEEDBACK_MESSAGE_DELAY,
} from './constants';

const styles = theme => ({
  root: {
    fontFamily: 'Roboto',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    paddingBottom: 0,
    marginBottom: 15,
    boxShadow: '0 2px 7px 0 rgba(0, 0, 0, 0.16)',
    borderRadius: 5,
    backgroundColor: 'rgb(255, 255, 255)',
  },
  header: {
    marginBottom: 15,
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-between',
      marginBottom: 0,
    },
  },
  order: {
    color: FEEDBACK_COLORS.highlight,
    fontSize: 28,
    marginRight: 35,
  },
  tags: {
    padding: '4px 16px',
    backgroundColor: FEEDBACK_COLORS.highlight,
    color: FEEDBACK_COLORS.white,
    fontSize: 12,
    borderRadius: 21,
    marginRight: 10,
  },
  type: {
    marginRight: 35,
  },
  timeInfo: {
    color: FEEDBACK_COLORS.grey,
    [theme.breakpoints.down('sm')]: {
      fontSize: 10,
    },
  },
  dot: {
    height: 5,
    width: 5,
    margin: '0px 5px',
    backgroundColor: FEEDBACK_COLORS.grey,
    borderRadius: '50%',
  },
  feedbackText: {
    color: FEEDBACK_COLORS.text,
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  icon: {
    height: 20,
    width: 'auto',
    verticalAlign: 'middle',
    marginRight: 5,
  },
  headerCountsInfo: {
    color: FEEDBACK_COLORS.highlight,
    marginBottom: 10,
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    margin: 'auto',
    height: 36,
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  votesBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 25,
    padding: theme.spacing(2),
    marginLeft: theme.spacing(-2),
    marginRight: theme.spacing(-2),
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
  },
  voteButton: {
    backgroundColor: FEEDBACK_COLORS.highlight,
    color: FEEDBACK_COLORS.white,
    borderRadius: 5,
  },
  textInputLabel: {
    fontSize: 16,
    color: FEEDBACK_COLORS.highlight,
  },
  textInputHelper: {
    fontSize: 12,
    color: FEEDBACK_COLORS.highlight,
    marginBottom: 10,
  },
  publishBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  commentsBlock: {
    [theme.breakpoints.down('sm')]: {
      padding: '16px 0',
    },
  },
  commentsHeader: {
    color: FEEDBACK_COLORS.highlight,
    marginBottom: 25,
  },
  mobileEditIcon: {
    height: 18,
    width: 'auto',
  },
  mobileDeleteButton: {
    backgroundColor: FEEDBACK_COLORS.text,
    marginLeft: 10,
    borderRadius: 5,
  },
  verticalScrollThumb: {
    minHeight: 0,
    backgroundColor: FEEDBACK_COLORS.highlight,
    width: 6,
    borderRadius: 5,
  },
  commentsWrapper: {
    paddingRight: 10,
    overflow: 'auto !important',
  },
});

class FeedbackItem extends React.Component {
  state = {
    expanded: false,
    newComment: '',
    commentsEditorOpened: false,
    currentComment: null,
    deleteCommentConfirmOpened: false,
    deleteFeedbackConfirmOpened: false,
    editFeedbackDialogOpened: false,
    commentCreateDialogOpened: false,
  };

  commentsInput = null;

  createCommentForm = null;

  commentsScrollBar = null;

  onCommentInit = () => {
    this.setState({ expanded: true }, () => {
      this.setFocusOnElem(this.commentsInput);
    });
  };

  onDeleteCommentInit = comment => () => {
    this.setState({ currentComment: comment, deleteCommentConfirmOpened: true });
  };

  onDeleteFeedbackInit = () => {
    this.toggleDeleteFeedbackConfirmDialog();
  };

  onEditComment = comment => () => {
    this.setState({ currentComment: comment, commentsEditorOpened: true });
  };

  onEditCommentFormSubmit = async (text) => {
    const { currentComment } = this.state;
    const {
      actions, feedback, updateFeedbacksList, showMessage,
    } = this.props;
    if (currentComment && currentComment.text !== text) {
      const editResponse = await actions.editComment(feedback.id, currentComment.id, text)
        .catch(() => {
          showMessage(FEEDBACK_ERROR_MESSAGE.post);
        });
      if (editResponse) {
        this.closeEditCommentDialog();
        showMessage(FEEDBACK_SUCCESS_MESSAGE.comment_updated, FEEDBACK_MESSAGE_DELAY);
        updateFeedbacksList();
      }
    } else {
      this.closeEditCommentDialog();
    }
  };

  onEditFeedbackInit = () => {
    this.toggleEditFeedbackDialog();
  };

  onEditFeedbackSubmit = async (type, text, tags) => {
    const {
      actions, feedback, updateFeedbacksList, showMessage, location,
    } = this.props;
    const editResponse = await actions.editFeedback(feedback.id, location.uid, type, text, tags)
      .catch(() => {
        showMessage(FEEDBACK_ERROR_MESSAGE.post);
      });
    if (editResponse) {
      this.toggleEditFeedbackDialog();
      showMessage(FEEDBACK_SUCCESS_MESSAGE.topic_updated, FEEDBACK_MESSAGE_DELAY);
      updateFeedbacksList();
    }
  };

  onCreateCommentFormSubmit = async (text) => {
    const {
      actions, user, feedback, updateFeedbacksList, showMessage,
    } = this.props;
    const { commentCreateDialogOpened } = this.state;
    const createResponse = await actions.createComment(user.id, feedback.id, text)
      .catch(() => {
        showMessage(FEEDBACK_ERROR_MESSAGE.post);
      });
    if (createResponse) {
      if (commentCreateDialogOpened) {
        this.toggleMobileCreateCommentDialog();
      }
      this.setState({ newComment: '' });
      showMessage(FEEDBACK_SUCCESS_MESSAGE.comment_created, FEEDBACK_MESSAGE_DELAY);
      await updateFeedbacksList();
      if (this.commentsScrollBar) {
        this.commentsScrollBar.scrollToBottom();
      }
    }
  };

  getFeedbackTags = (tags, width) => {
    const { classes } = this.props;
    const tagsCountToShow = Math.min(tags.length, MAX_TAGS_COUNT_TO_SHOW[width]);
    const tagsToProcess = tags.slice(0, tagsCountToShow);
    const tagsToShow = tagsToProcess.map((item) => {
      const tagData = FEEDBACK_TAGS.find(el => el.name === item);
      return tagData.label;
    });
    return (
      <React.Fragment>
        {
          tagsToShow.map(tag => (
            <Typography key={tag} className={classes.tags}>
              {tag}
            </Typography>
          ))
        }
      </React.Fragment>
    );
  };

  getFeedbackType = (type) => {
    const typeData = FEEDBACK_TYPES.find(elem => elem.type === type);
    return typeData.label;
  };

  getLastActivity = (feedback) => {
    let lastCommentTs = 0;
    if (feedback.comments.length) {
      const feedbackCommentsTsArr = feedback.comments.map(comment => moment(comment.created_at).unix());
      lastCommentTs = Math.max(...feedbackCommentsTsArr);
    }
    const lastActivityTs = Math.max(moment(feedback.updated_at).unix(), lastCommentTs);
    return this.getTimeDiff(lastActivityTs, true);
  };

  getSortedComments = comments => [...comments].sort((a, b) => moment(a.created_at).unix() - moment(b.created_at).unix());

  getTimeDiff = (time, isTimeStamp = false) => {
    const { nowTs } = this.props;
    const ts = isTimeStamp ? time : moment(time).unix();
    const timeDiff = nowTs - ts;
    const duration = moment.duration(timeDiff, 'seconds');
    return `${duration.humanize()} ago`;
  };

  setFocusOnElem = (elem) => {
    if (elem) {
      setTimeout(() => { elem.focus(); }, 100);
    }
  };

  clearCommentText = () => {
    this.setState({ newComment: '' }, () => {
      this.setFocusOnElem(this.commentsInput);
    });
  };

  deleteFeedback = async () => {
    const {
      actions, feedback, updateFeedbacksList, showMessage,
    } = this.props;
    const deleteResponse = await actions.deleteFeedback(feedback.id)
      .catch(() => {
        showMessage(FEEDBACK_ERROR_MESSAGE.delete);
      });
    if (deleteResponse) {
      this.toggleDeleteFeedbackConfirmDialog();
      showMessage(FEEDBACK_SUCCESS_MESSAGE.topic_deleted, FEEDBACK_MESSAGE_DELAY);
      updateFeedbacksList();
    }
  };

  deleteComment = async () => {
    const {
      actions, updateFeedbacksList, showMessage,
    } = this.props;
    const { currentComment } = this.state;
    const deleteResponse = await actions.deleteComment(currentComment.id)
      .catch(() => {
        showMessage(FEEDBACK_ERROR_MESSAGE.delete);
      });
    if (deleteResponse) {
      this.toggleDeleteCommentConfirmDialog();
      showMessage(FEEDBACK_SUCCESS_MESSAGE.comment_deleted, FEEDBACK_MESSAGE_DELAY);
      updateFeedbacksList();
    }
  };

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  closeEditCommentDialog = () => {
    this.setState({ commentsEditorOpened: false, currentComment: null });
  };

  toggleDeleteCommentConfirmDialog = () => {
    this.setState(prevState => ({ deleteCommentConfirmOpened: !prevState.deleteCommentConfirmOpened }));
  };

  toggleDeleteFeedbackConfirmDialog = () => {
    this.setState(prevState => ({ deleteFeedbackConfirmOpened: !prevState.deleteFeedbackConfirmOpened }));
  };

  toggleEditFeedbackDialog = () => {
    this.setState(prevState => ({ editFeedbackDialogOpened: !prevState.editFeedbackDialogOpened }));
  };

  toggleMobileCreateCommentDialog = () => {
    this.setState(prevState => ({ commentCreateDialogOpened: !prevState.commentCreateDialogOpened }));
  };

  render() {
    const {
      classes, feedback, width, isAdmin, user,
    } = this.props;

    const {
      expanded,
      newComment,
      commentsEditorOpened,
      currentComment,
      deleteCommentConfirmOpened,
      deleteFeedbackConfirmOpened,
      editFeedbackDialogOpened,
      commentCreateDialogOpened,
    } = this.state;

    const isAuthor = user.id === feedback.author;

    const comments = this.getSortedComments(feedback.comments);

    return (
      <Grid item container className={classes.root}>
        <Grid item xs={12} container alignItems="center" className={classes.header}>
          <Typography component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <Typography className={classes.order}>
              #{feedback.id}
            </Typography>
            {
              this.getFeedbackTags(feedback.tags, width)
            }
            <Typography className={classNames(classes.tags, classes.type)}>
              {this.getFeedbackType(feedback.type)}
            </Typography>
          </Typography>
          <Hidden smDown>
            <Typography className={classes.timeInfo}>
              Created {this.getTimeDiff(feedback.created_at)}
            </Typography>
            <Typography className={classes.dot} />
            <Typography className={classes.timeInfo}>
              Last activity {this.getLastActivity(feedback)}
            </Typography>
          </Hidden>
        </Grid>
        <Hidden mdUp>
          <Grid item xs={12} container alignItems="center" style={{ marginBottom: 10 }}>
            <Typography className={classes.timeInfo}>
              Created {this.getTimeDiff(feedback.created_at)}
            </Typography>
            <Typography className={classes.dot} />
            <Typography className={classes.timeInfo}>
              Last activity {this.getLastActivity(feedback)}
            </Typography>
          </Grid>
        </Hidden>
        <Grid item xs={12} md={6} container direction="column">
          <Typography className={classes.feedbackText}>
            {feedback.content}
          </Typography>
          <Hidden smDown>
            {expanded && (
              <React.Fragment>
                <ValidatorForm
                  ref={(el) => { this.createCommentForm = el; }}
                  onSubmit={() => this.onCreateCommentFormSubmit(newComment)}
                  style={{ width: '100%' }}
                >
                  <TextValidator
                    inputRef={(input) => {
                      this.commentsInput = input;
                    }}
                    multiline
                    rows={FEEDBACK_TEXT_BOX.rowsMax}
                    rowsMax={FEEDBACK_TEXT_BOX.rowsMax}
                    fullWidth
                    label="Leave a comment"
                    margin="dense"
                    onChange={e => this.setState({ newComment: e.target.value })}
                    name="text"
                    value={newComment}
                    validators={['required', `maxStringLength:${MAX_TEXT_LENGTH}`]}
                    helperText={`Maximum number of symbols: ${MAX_TEXT_LENGTH}`}
                    errorMessages={['Text is required', 'Max number of symbols has been exceeded']}
                    InputLabelProps={{ classes: { root: classes.textInputLabel } }}
                    FormHelperTextProps={{ classes: { root: classes.textInputHelper } }}
                  />
                </ValidatorForm>
                <Typography className={classes.publishBlock}>
                  <Button
                    style={{ fontSize: 12, color: FEEDBACK_COLORS.highlight }}
                    onClick={() => this.createCommentForm.submit()}
                  >
                    PUBLISH
                  </Button>
                  <Button
                    style={{ fontSize: 12, color: FEEDBACK_COLORS.text }}
                    onClick={this.clearCommentText}
                  >
                    CLEAR
                  </Button>

                </Typography>
              </React.Fragment>
            )}
          </Hidden>
          <Hidden mdUp>
            {expanded && (
              <Typography className={classes.votesBlock} component="div">
                <Typography
                  style={
                    {
                      color: FEEDBACK_COLORS.highlight,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }
                  }
                >
                  <Button
                    variant="contained"
                    className={classes.voteButton}
                    style={{ marginRight: 10 }}
                    onClick={() => this.toggleMobileCreateCommentDialog()}
                  >
                    <span>comment</span>
                  </Button>
                </Typography>
                {(isAuthor || isAdmin) && (
                  <Typography style={{ color: FEEDBACK_COLORS.highlight }}>
                    {isAuthor && (
                      <Button variant="contained" className={classes.voteButton} onClick={this.onEditFeedbackInit}>
                        <img src={editTabletIcon} alt="edit" className={classes.mobileEditIcon} />
                      </Button>
                    )}
                    <Button variant="contained" className={classes.mobileDeleteButton} onClick={this.onDeleteFeedbackInit}>
                      <img src={deleteTabletIcon} alt="delete" className={classes.mobileEditIcon} />
                    </Button>
                  </Typography>
                )}
              </Typography>
            )}
          </Hidden>
        </Grid>
        {!expanded ? (
          <Hidden smDown>
            <Grid item xs={5} container justify="flex-end">
              {(isAuthor || isAdmin) && (
                <React.Fragment>
                  <Grid item style={{ marginRight: 25, cursor: 'pointer' }} onClick={this.onDeleteFeedbackInit}>
                    <Typography component="div" className={classes.headerCountsInfo} align="center">
                      <img src={deleteIcon} alt="delete icon" className={classes.icon} />
                    </Typography>
                    <Typography
                      style={{ color: FEEDBACK_COLORS.text }}
                    >
                      DELETE
                    </Typography>
                  </Grid>
                  {isAuthor && (
                    <Grid item style={{ marginRight: 25, cursor: 'pointer' }} onClick={this.onEditFeedbackInit}>
                      <Typography component="div" className={classes.headerCountsInfo} align="center">
                        <img src={editBlueIcon} alt="edit icon" className={classes.icon} />
                      </Typography>
                      <Typography
                        style={{ color: FEEDBACK_COLORS.highlight }}
                      >
                        EDIT
                      </Typography>
                    </Grid>
                  )}
                </React.Fragment>
              )}
              <Grid item style={{ marginRight: 10, cursor: 'pointer' }} onClick={this.onCommentInit}>
                <Typography component="div" className={classes.headerCountsInfo} align="center">
                  <img src={dialogIcon} alt="dialog icon" className={classes.icon} />
                  <span>{feedback.comments.length}</span>
                </Typography>
                <Typography
                  style={{ color: FEEDBACK_COLORS.highlight }}
                >
                  COMMENT
                </Typography>
              </Grid>
            </Grid>
          </Hidden>
        ) : (
          <Grid item xs={12} md={5} container className={classes.commentsBlock} direction="column" wrap="nowrap">
            <Grid item xs={12} container style={{ flexBasis: 'auto' }}>
              <Typography component="div" className={classes.commentsHeader}>
                <img src={dialogIcon} alt="dialog icon" className={classes.icon} />
                <span>Comments ({feedback.comments.length})</span>
              </Typography>
            </Grid>
            <Grid item xs={12} container style={{ flexBasis: 'auto', overflow: 'auto', height: 300 }}>
              <Scrollbars
                ref={(node) => {
                  this.commentsScrollBar = node;
                }}
                renderView={props => <div {...props} className={classes.commentsWrapper} />}
                renderThumbVertical={props => <div {...props} className={classes.verticalScrollThumb} />}
                autoHeight
                autoHeightMin={0}
                autoHeightMax={300}
                universal
              >
                {comments.length ? (
                  <React.Fragment>
                    {
                      comments.map((comment) => {
                        const isAuthorOfComment = user.id === comment.author;
                        return (
                          <FeedbackComment
                            key={comment.id}
                            comment={comment}
                            onEdit={this.onEditComment}
                            onDelete={this.onDeleteCommentInit}
                            isAdmin={isAdmin}
                            isAuthor={isAuthorOfComment}
                          />
                        );
                      })
                    }
                  </React.Fragment>
                ) : (
                  <Typography
                    component="div"
                    style={
                      {
                        height: 280,
                        backgroundImage: `url(${noCommentsBg})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                      }
                    }
                  />
                )}
              </Scrollbars>
            </Grid>
          </Grid>
        )}
        <Divider component="div" style={{ width: '100%', marginTop: 25 }} />
        <Grid item xs={12} container>
          <IconButton
            className={classNames(classes.expand, { [classes.expandOpen]: expanded })}
            onClick={this.handleExpandClick}
          >
            <ExpandMore />
          </IconButton>
        </Grid>
        <NewEditCommentDialog
          isOpened={commentsEditorOpened}
          onClose={this.closeEditCommentDialog}
          onSubmit={this.onEditCommentFormSubmit}
          editedComment={currentComment}
          title="Edit comment"
          textBoxLabel="Edit comment"
        />
        <Hidden mdUp>
          <NewEditCommentDialog
            isOpened={commentCreateDialogOpened}
            onClose={this.toggleMobileCreateCommentDialog}
            onSubmit={this.onCreateCommentFormSubmit}
          />
        </Hidden>
        <ConfirmDialog
          title="Delete current comment?"
          isOpened={deleteCommentConfirmOpened}
          onSubmit={this.deleteComment}
          onClose={this.toggleDeleteCommentConfirmDialog}
        />
        <ConfirmDialog
          title="Delete current issue?"
          isOpened={deleteFeedbackConfirmOpened}
          onSubmit={this.deleteFeedback}
          onClose={this.toggleDeleteFeedbackConfirmDialog}
        />
        <NewEditFeedbackDialog
          isOpened={editFeedbackDialogOpened}
          onClose={this.toggleEditFeedbackDialog}
          onSubmit={this.onEditFeedbackSubmit}
          editedFeedback={feedback}
          title="Edit item"
          textBoxLabel="Edit comment"
          submitButtonName="Save"
        />
      </Grid>
    );
  }
}

FeedbackItem.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  feedback: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  nowTs: PropTypes.number.isRequired,
  updateFeedbacksList: PropTypes.func.isRequired,
  showMessage: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...feedbacksActions,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
  withWidth(),
)(FeedbackItem);
