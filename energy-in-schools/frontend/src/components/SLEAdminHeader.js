import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';

import avatar from '../images/school_avatar_grey.svg';

const styles = theme => ({
  root: {
    borderRight: '2px solid #d9d9d9',
    fontFamily: 'Roboto-Medium',
    padding: '2px 24px',
    height: 56,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  leftContentRoot: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 50,
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1.5),
    },
  },
  rightContentRoot: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  title: {
    color: '#3c3c3c',
    fontSize: 21,
    lineHeight: 1.25,
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  subheader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#00bcd4',
    lineHeight: '16px',
  },
  avatar: {
    borderRadius: 0,
  },
  button: {
    border: 0,
    fontSize: 14,
    textTransform: 'none',
    [theme.breakpoints.down('xs')]: {
      paddingRight: theme.spacing(1),
    },
  },
  rightContentButton: {
    width: 'auto',
    borderRadius: 40,
    backgroundColor: '#dedede',
    paddingRight: 20,
    paddingLeft: 10,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      borderRadius: 0,
      marginTop: 30,
      height: 70,
    },
  },
  rightContentLabel: {
    color: '#b5b5b5',
  },
});

function SLEAdminHeader(props) {
  const {
    classes, title, schoolID, leftContent, rightContent, onRefreshClick, disabled, updateButtonLabel,
  } = props;

  return (
    <Grid container justify="space-between">
      <Grid item md={7} xs={12}>
        <Grid container className={classes.leftContentRoot}>
          <CardHeader
            avatar={
              <Avatar alt="School" src={avatar} classes={{ root: classes.avatar }} />
              }
            title={title}
            subheader={`SCHOOL ID: ${schoolID}`}
            classes={{ root: classes.root, title: classes.title, subheader: classes.subheader }}
          />
          {leftContent || (
            <Button
              color="primary"
              className={classes.button}
              disabled={disabled}
              onClick={onRefreshClick}
            >
              <RefreshIcon style={{ marginRight: 9, width: 16 }} />
              {updateButtonLabel}
            </Button>
          )}
        </Grid>
      </Grid>
      {
        rightContent && (
          <Grid item md={5} xs={12}>
            <Grid container className={classes.rightContentRoot}>
              <Button component="div" classes={{ root: classes.rightContentButton, label: classes.rightContentLabel }} onClick={rightContent.onClick}>
                <Fab size="small" color="primary" aria-label="add" style={{ marginRight: 10 }}>
                  { rightContent.icon ? <rightContent.icon /> : <AddIcon /> }
                </Fab>
                {rightContent.label}
              </Button>
            </Grid>
          </Grid>
        )
      }
    </Grid>
  );
}

SLEAdminHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  updateButtonLabel: PropTypes.string,
  schoolID: PropTypes.string,
  onRefreshClick: PropTypes.func,
  disabled: PropTypes.bool,

  leftContent: PropTypes.element,
  rightContent: PropTypes.object,
};

SLEAdminHeader.defaultProps = {
  title: '',
  schoolID: '',
  updateButtonLabel: 'Update info',
  rightContent: null,
  disabled: false,
  onRefreshClick: () => {},
  leftContent: null,
};

export default compose(withStyles(styles))(SLEAdminHeader);
