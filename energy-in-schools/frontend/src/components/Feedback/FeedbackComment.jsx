import React from 'react';
import moment from 'moment';

import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import StarIcon from '@material-ui/icons/Star';

import {
  FEEDBACK_COLORS,
  COMMENT_CREATED_TIME_FORMAT,
} from './constants';

const styles = theme => ({
  commentItem: {
    width: '100%',
    marginBottom: 15,
  },
  commentText: {
    width: '100%',
    color: FEEDBACK_COLORS.text,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    padding: theme.spacing(1),
    borderRadius: '15px 15px 15px 0',
    marginBottom: 3,
  },
  commentExtraBlock: {
    display: 'flex',
    alignItems: 'center',
  },
  commentCreatedInfo: {
    fontSize: 12,
    color: FEEDBACK_COLORS.grey,
    display: 'inline-block',
  },
  commentEditButtonsBlock: {
    display: 'inline-block',
  },
  commentEditButton: {
    fontSize: 12,
    color: FEEDBACK_COLORS.highlight,
    marginLeft: 8,
    padding: '0 8px',
    minWidth: 0,
    textTransform: 'none',
    minHeight: 32,
  },
  adminBlock: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  adminIcon: {
    fontSize: 12,
    color: FEEDBACK_COLORS.highlight,
    marginLeft: 15,
    marginRight: 3,
    marginTop: '-2px',
  },
  adminTitle: {
    color: FEEDBACK_COLORS.highlight,
    fontSize: 12,
  },
});

const commentCreatedFormatTime = (time, format, isTimeStamp = false) => {
  if (isTimeStamp) {
    return moment.unix(time).format(format);
  }
  return moment(time).format(format);
};

const FeedbackComment = (props) => {
  const {
    classes, comment, onEdit, onDelete, isAdmin, isAuthor,
  } = props;

  return (
    <div className={classes.commentItem}>
      <Typography className={classes.commentText} component="div">
        {comment.content}
      </Typography>
      <div className={classes.commentExtraBlock}>
        <Typography className={classes.commentCreatedInfo}>
          {commentCreatedFormatTime(comment.created_at, COMMENT_CREATED_TIME_FORMAT)}
        </Typography>
        {(isAuthor || isAdmin) && (
          <Typography className={classes.commentEditButtonsBlock}>
            {isAuthor && (
              <Button className={classes.commentEditButton} onClick={onEdit(comment)}>
                Edit
              </Button>
            )}
            <Button className={classes.commentEditButton} onClick={onDelete(comment)}>
              Delete
            </Button>
          </Typography>
        )}
        {comment.is_admin && (
          <div className={classes.adminBlock}>
            <StarIcon className={classes.adminIcon} />
            <Typography className={classes.adminTitle}>
              Admin
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

FeedbackComment.propTypes = {
  classes: PropTypes.object.isRequired,
  comment: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAuthor: PropTypes.bool.isRequired,
};

export default compose(withStyles(styles))(FeedbackComment);
