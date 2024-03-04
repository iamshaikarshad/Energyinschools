import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import classNames from 'classnames';

import SearchInput from 'react-search-input';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';

import boxIcon from '../images/box.svg';

const styles = theme => ({
  boxIcon: {
    height: 50,
    width: 50,
  },
  variablesTitle: {
    padding: theme.spacing(2),
    backgroundColor: 'rgba(181, 181, 181, 0.1)',
    [theme.breakpoints.only('sm')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(1),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },
  },
  variablesDescription: {
    paddingLeft: 10,
    paddingRight: 10,
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  searchInputWrapper: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: 16,
    },
  },
  itemsPerPageContainer: {
    [theme.breakpoints.down('sm')]: {
      alignItems: 'center',
    },
  },
  shareBlock: {
    [theme.breakpoints.down('xs')]: {
      padding: '0px 0px 0px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  shareLabel: {
    [theme.breakpoints.down('xs')]: {
      display: 'inline-flex',
      alignItems: 'center',
    },
  },
  total: {
    fontSize: 16,
    color: 'rgb(181, 181, 181)',
    lineHeight: 1,
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'rgba(0, 0, 0, 0.87)',
      lineHeight: 1.5,
      marginBottom: 12,
      marginTop: 12,
      paddingLeft: 12,
    },
  },
  count: {
    [theme.breakpoints.down('xs')]: {
      display: 'inline-block',
      fontWeight: 500,
      marginRight: 20,
    },
  },
  totalItemsPerPageWrapper: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  itemsPerPageBlock: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 12,
    },
  },
  itemsPerPageWrapper: {
    display: 'inline-block',
    verticalAlign: 'super',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  itemsPerPageLabel: {
    fontSize: 16,
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
  },
  itemsPerPageValue: {
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'inline-block',
      fontWeight: 500,
    },
  },
  trianglesBlock: {
    display: 'inline-block',
    [theme.breakpoints.down('xs')]: {
      display: 'inline-flex',
      marginRight: 4,
      alignItems: 'center',
    },
  },
  triangles: {
    display: 'inline-block',
    lineHeight: 1,
    transform: 'scaleX(1.5)',
  },
  triangle: {
    padding: 0,
    minWidth: 0,
    minHeight: 0,
    border: 'none',
    outline: 'none',
    lineHeight: 1,
  },
});

const VariablesHeader = (props) => {
  const {
    classes, count, description, itemsPerPage, searchUpdate, handleIncrease, handleDecrease, fromMyLocation, handleChangeFromMyLocation,
  } = props;
  return (
    <Grid item xs={12} container alignItems="center" className={classes.variablesTitle}>
      <Hidden smDown>
        <Grid item xs={1} container justify="center" alignItems="center">
          <img src={boxIcon} alt="variable" className={classes.boxIcon} />
        </Grid>
      </Hidden>
      <Hidden smDown>
        <Grid item xs={3}>
          <br />
          <Typography component="div" className={classes.variablesDescription}>
            {description}
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} md={3} className={classes.searchInputWrapper}>
        <br />
        <SearchInput className="searchVariablesInput" onChange={searchUpdate} placeholder="Search by key" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Hidden xsDown>
          <br />
        </Hidden>
        <Typography component="div" className={classNames(classes.variablesDescription, classes.shareBlock)}>
          <span className={classes.shareLabel}>Only from my school</span>
          <Switch
            checked={fromMyLocation}
            onChange={handleChangeFromMyLocation}
            value=""
            color="primary"
          />
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={2} container direction="column" wrap="nowrap" justify="space-around" className={classes.itemsPerPageContainer}>
        <Grid className={classes.totalItemsPerPageWrapper}>
          <Typography component="div" className={classes.total}>
            <span>
              total
              <Hidden xsDown>
                <span>: </span>
              </Hidden>
            </span>
            <span className={classes.count}>{count}</span>
          </Typography>
          <Typography component="div" className={classes.itemsPerPageBlock}>
            <div className={classes.itemsPerPageWrapper}>
              <span className={classes.itemsPerPageLabel}>
                <span>Items per page</span>
                <Hidden xsDown>
                  <span>: </span>
                </Hidden>
              </span>
              <Hidden xsDown>
                <span className={classes.itemsPerPageValue}>{itemsPerPage}</span>
              </Hidden>
            </div>
            <div className={classes.trianglesBlock}>
              <Hidden smUp>
                <Typography
                  component="span"
                  className={classes.itemsPerPageValueWrapper}
                >
                  <span className={classes.itemsPerPageValue}>{itemsPerPage}</span>
                </Typography>
              </Hidden>
              <div className={classes.triangles}>
                <Button className={classes.triangle} onClick={handleIncrease}>&#9650;</Button>
                <br />
                <Button role="button" className={classes.triangle} onClick={handleDecrease}>&#9660;</Button>
              </div>
            </div>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

VariablesHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  searchUpdate: PropTypes.func.isRequired,
  handleIncrease: PropTypes.func.isRequired,
  handleDecrease: PropTypes.func.isRequired,
  fromMyLocation: PropTypes.bool.isRequired,
  handleChangeFromMyLocation: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(VariablesHeader);
