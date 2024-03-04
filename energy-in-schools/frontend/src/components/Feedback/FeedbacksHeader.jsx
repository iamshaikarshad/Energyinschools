import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import SearchInput from 'react-search-input';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';

import boxIcon from '../../images/feedback_header_icon.svg';

const styles = theme => ({
  boxIcon: {
    height: 45,
    width: 45,
  },
  title: {
    padding: theme.spacing(2),
    backgroundColor: 'rgba(181, 181, 181, 0.1)',
    [theme.breakpoints.only('sm')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },
  description: {
    paddingLeft: 10,
    paddingRight: 10,
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  searchWrapper: {
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 10,
    },
  },
  itemsPerPageContainer: {
    alignItems: 'flex-end',
  },
  itemsPerPageWrapper: {
    display: 'inline-block',
    verticalAlign: 'super',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  itemsPerPage: {
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
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

const FeedbacksHeader = (props) => {
  const {
    classes,
    count,
    itemsPerPage,
    searchUpdate,
    handleIncrease,
    handleDecrease,
    fromMyLocation,
    handleChangeFromMyLocation,
    isAdmin,
  } = props;
  return (
    <Grid item xs={12} container alignItems="center" className={classes.title}>
      <Hidden smDown>
        <Grid item xs={1} container justify="center" alignItems="center">
          <img src={boxIcon} alt="variable" className={classes.boxIcon} />
        </Grid>
      </Hidden>
      <Hidden mdDown>
        <Grid item lg={isAdmin ? 6 : 4}>
          <Typography component="div" className={classes.description}>
            This is a questions & proposals page. Create your own request with proposal
            to improve the portal. Сomment on and vote for the community requests.
            Top items appear first in the list.
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} md={isAdmin ? 5 : 4} lg={3} className={classes.searchWrapper}>
        <SearchInput className="searchVariablesInput" onChange={searchUpdate} placeholder="Search" />
      </Grid>
      {!isAdmin && (
        <Grid item xs={6} md={3} lg={2} container alignItems="center">
          <br />
          <Typography component="div" className={classes.variablesDescription} align="center">
            <span>Only from my school</span>
            <Switch
              checked={fromMyLocation}
              onChange={handleChangeFromMyLocation}
              value=""
              color="primary"
            />
          </Typography>
        </Grid>
      )}
      <Grid item xs={isAdmin ? 12 : 6} md={isAdmin ? 6 : 4} lg={2} container direction="column" wrap="nowrap" justify="space-around" className={classes.itemsPerPageContainer}>
        <Grid>
          <Typography component="div" style={{ color: 'rgb(181,181,181)', lineHeight: 1 }}>total: {count}</Typography>
          <Typography component="div">
            <div className={classes.itemsPerPageWrapper}>
              <span>Items per page:</span>
              <span className={classes.itemsPerPage}>{itemsPerPage}</span>
            </div>
            <div className={classes.triangles}>
              <Button className={classes.triangle} onClick={handleIncrease}>&#9650;</Button>
              <br />
              <Button role="button" className={classes.triangle} onClick={handleDecrease}>&#9660;</Button>
            </div>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

FeedbacksHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  searchUpdate: PropTypes.func.isRequired,
  handleIncrease: PropTypes.func.isRequired,
  handleDecrease: PropTypes.func.isRequired,
  fromMyLocation: PropTypes.bool.isRequired,
  handleChangeFromMyLocation: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default compose(withStyles(styles))(FeedbacksHeader);
