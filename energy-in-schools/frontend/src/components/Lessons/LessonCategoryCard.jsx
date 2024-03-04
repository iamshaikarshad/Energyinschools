import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import TextTruncate from 'react-text-truncate';
import defaultLessonCategoryCardAvatar from '../../images/lesson_arts/codeHere.jpg';

const styles = theme => ({
  card: {
    maxWidth: '100%',
    width: 360,
    cursor: 'default',
    transition: 'all 0.3s ease-in-out',
    borderRadius: 10,
    border: 'none',
    '&:hover': {
      transform: 'scale(1.05, 1.05)',
      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  mediaImage: {
    height: 250,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  cardActionsRoot: {
    height: 'auto',
    padding: '8px 16px 16px',
  },
  cardActionButton: {
    padding: '6px 15px',
    fontSize: 16,
    fontFamily: 'Roboto, Helvetica',
    fontWeight: 500,
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgba(3, 169, 244, 0.9)',
    lineHeight: 1.5,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(3, 169, 244, 1)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  title: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 21,
    },
  },
  overview: {
    minHeight: 65,
  },
});

const LessonCategoryCard = (props) => {
  const {
    classes, avatar, overview, title, onDetailClick, showMessageSnackbar,
  } = props;

  return (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        alt="Avatar"
        className={classes.mediaImage}
        src={avatar || defaultLessonCategoryCardAvatar}
        title="Manual"
        onError={(e) => {
          e.target.src = defaultLessonCategoryCardAvatar;
          showMessageSnackbar(`${title} avatar is broken! Changed it to default avatar!`, 5000);
        }}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2" className={classes.title}>
          <TextTruncate line={2} text={title} />
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" component="div" className={classes.overview}>
          <TextTruncate line={9} text={overview} />
        </Typography>
      </CardContent>
      <CardActions disableSpacing classes={{ root: classes.cardActionsRoot }}>
        <Button variant="contained" className={classes.cardActionButton} onClick={onDetailClick}>
          View Content
        </Button>
      </CardActions>
    </Card>
  );
};

LessonCategoryCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  overview: PropTypes.string.isRequired,
  onDetailClick: PropTypes.func.isRequired,
  showMessageSnackbar: PropTypes.func.isRequired,
};

LessonCategoryCard.defaultProps = {
  avatar: defaultLessonCategoryCardAvatar,
};

export default withStyles(styles)(LessonCategoryCard);
