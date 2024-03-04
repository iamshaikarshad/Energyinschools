import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import TextTruncate from 'react-text-truncate';

import selectArrowIcon from '../../images/select_arrow.svg';

const styles = theme => ({
  root: {
    marginBottom: 32,
    borderRadius: '5px',
    backgroundColor: 'rgb(255, 255, 255)',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 24,
    },
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
      marginBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  titleWrapper: {
    paddingLeft: 40,
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 28,
    },
  },
  mobileTitleWrapper: {
    [theme.breakpoints.only('sm')]: {
      paddingLeft: 24,
      paddingRight: 24,
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 12,
      paddingRight: 8,
    },
  },
  title: {
    fontSize: 21,
    fontWeight: 500,
    paddingRight: 8,
    [theme.breakpoints.down('sm')]: {
      paddingRight: 0,
      marginBottom: 4,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  subtitle: {
    fontSize: 12,
    color: 'rgb(0, 188, 212)',
    fontWeight: 600,
    textTransform: 'uppercase',
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
    },
  },
  listItemTextRoot: {
    [theme.breakpoints.down('md')]: {
      paddingRight: 8,
    },
  },
  button: {
    minWidth: 120,
    marginRight: 24,
    fontSize: 12,
    backgroundColor: 'rgb(0, 188, 212)',
    color: 'rgb(255, 255, 255)',
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 0.7)',
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 100,
      fontSize: 10,
      padding: '4px 8px',
    },
  },
  selectIcon: {
    position: 'absolute',
    top: '50%',
    left: '-25px',
    transform: 'translateY(-50%)',
    height: 37,
    width: 45,
    overflow: 'visible',
    [theme.breakpoints.down('xs')]: {
      left: '-12px',
      height: 25,
      width: 32,
    },
  },
  overview: {
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
});

function LessonCard(props) {
  const {
    classes, subTitle, title, overview, primaryButtonLabel, children, onPrimaryButtonClick, onCardClick,
  } = props;
  return (
    <ListItem component="div" className={classes.root} onClick={onCardClick}>
      <ListItemText classes={{ root: classes.listItemTextRoot }}>
        <Grid item container xs={12}>
          <Grid item container xs={5} md={9} lg={8} direction="column" justify="center" className={classes.titleWrapper}>
            <img src={selectArrowIcon} alt="select arrow" className={classes.selectIcon} />
            <Typography component="div" className={classes.subtitle}>
              {subTitle}
            </Typography>
            <Hidden smDown>
              <Typography className={classes.title}>
                {title}
              </Typography>
              <Typography component="div" className={classes.overview}>
                <TextTruncate line={3} text={overview} />
              </Typography>
            </Hidden>
          </Grid>
          <Grid item container xs={7} md={3} lg={4} justify="flex-end" alignItems="center">
            <Button variant="contained" classes={{ root: classes.button }} onClick={onPrimaryButtonClick}>
              {primaryButtonLabel}
            </Button>
          </Grid>
          <Hidden mdUp>
            <Grid
              item
              container
              xs={12}
              direction="column"
              justify="center"
              className={classNames(classes.titleWrapper, classes.mobileTitleWrapper)}
              style={{ paddingTop: 8, paddingBottom: 8 }}
            >
              <Typography className={classes.title}>
                {title}
              </Typography>
              <Typography component="div" className={classes.overview}>
                <TextTruncate line={5} text={overview} />
              </Typography>
            </Grid>
          </Hidden>
        </Grid>
        {children}
      </ListItemText>
    </ListItem>
  );
}

LessonCard.propTypes = {
  classes: PropTypes.object.isRequired,
  subTitle: PropTypes.node,
  title: PropTypes.string,
  overview: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  primaryButtonLabel: PropTypes.string,
  onPrimaryButtonClick: PropTypes.func,
  onCardClick: PropTypes.func,
};

LessonCard.defaultProps = {
  subTitle: '',
  title: '',
  overview: '',
  children: null,
  primaryButtonLabel: 'Click',
  onPrimaryButtonClick: () => {},
  onCardClick: () => {},
};

export default compose(withStyles(styles))(LessonCard);
