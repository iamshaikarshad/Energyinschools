import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import cryingFaceIcon from '../images/crying_face_emoji.png';

const styles = theme => ({
  root: {
    width: '100%',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', 'sans-serif'",
  },
  title: {
    padding: '0px 15px',
    fontFamily: "'NoteWorthy', 'Roboto'",
    textAlign: 'center',
    fontSize: 64,
    fontWeight: 900,
    color: '#ee8176',
    letterSpacing: 2,
    textShadow: '2px 2px 2px #71b7e6',
    [theme.breakpoints.only('sm')]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    [theme.breakpoints.only('xs')]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  subtitle: {
    padding: '0px 15px',
    textAlign: 'center',
    color: 'rgba(0, 0 ,0, 0.87)',
    textTransform: 'uppercase',
  },
  errorCode: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 32,
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1),
    },
  },
  errorText: {
    display: 'inline-block',
    marginLeft: 5,
    fontSize: 28,
    textTransform: 'uppercase',
  },
  textIcon: {
    height: 32,
    width: 32,
    margin: '0px 4px',
    display: 'inline-block',
    verticalAlign: 'middle',
    '&:hover': {
      transform: 'scale(1.2, 1.2)',
    },
  },
  description: {
    textAlign: 'center',
    fontSize: 18,
    padding: 15,
    color: 'rgba(0, 0 ,0, 0.7)',
  },
  backHomeButton: {
    backgroundColor: 'rgb(249, 152, 39)',
    color: 'rgb(255, 255, 255)',
    borderRadius: 40,
    padding: 0,
    '&:hover': {
      backgroundColor: 'rgba(249, 152, 39, 0.8)',
    },
  },
  backHomeLink: {
    color: 'rgb(255, 255, 255)',
    padding: '12px 30px',
    textDecoration: 'none',
  },
});

const NotFoundPage = (props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <h1 className={classes.title}>
        Oops!
      </h1>
      <h3 className={classes.subtitle}>
        <span className={classes.errorCode}>
          <span>4</span>
          <img src={cryingFaceIcon} alt="0" className={classes.textIcon} />
          <span>4&nbsp;&ndash;&nbsp;</span>
        </span>
        <span className={classes.errorText}>Page not found</span>
      </h3>
      <h4 className={classes.description}>
        Sorry but the page you are looking for does not exist,
        have been <br /> removed, name changed or is temporarily unavailable
      </h4>
      <div align="center" style={{ marginBottom: 25 }}>
        <Button className={classes.backHomeButton}>
          <Link to="/" className={classes.backHomeLink}> Back to homepage </Link>
        </Button>
      </div>
    </div>
  );
};

NotFoundPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(NotFoundPage);
