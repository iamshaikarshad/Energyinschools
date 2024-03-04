import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import { withStyles } from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import ExpandMore from '@material-ui/icons/ExpandMore';

import PeriodConsumption from './PeriodConsumption';

import { CONSUMPTION_PERIOD } from './constants';

const styles = theme => ({
  root: {
    padding: '0px 20px',
    borderRadius: 20,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  titleContainer: {},
  titleText: {
    fontWeight: 500,
    fontSize: 18,
    padding: '12px 8px',
    lineHeight: 'normal',
  },
  dividerRoot: {
    width: '100%',
  },
  titleDivider: {},
  chartsContainer: {},
  expand: {
    padding: 8,
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class PeriodsConsumptionContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.openedOnInit,
    };
  }

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    const {
      classes, data, title, showTitle, showExpand,
    } = this.props;
    const { expanded } = this.state;

    return (
      <Grid container className={classes.root}>
        {showTitle && (
          <Grid container className={classes.titleContainer}>
            <Grid container justify="center">
              <Typography className={classes.titleText}>
                {title}
              </Typography>
              {expanded && (
                <Divider light className={classnames(classes.dividerRoot, classes.titleDivider)} />
              )}
            </Grid>
          </Grid>
        )}
        {expanded && (
          <Grid item container xs={12} className={classes.chartsContainer}>
            {Object.values(CONSUMPTION_PERIOD).map(period => (
              <Grid key={period} item xs={12} sm={6} lg={3}>
                <PeriodConsumption period={period} data={data[period] || {}} />
              </Grid>
            ))
            }
          </Grid>
        )}
        {showExpand && (
          <Grid container className={classes.expandContainer}>
            <Grid container item xs={12} justify="center">
              <Divider light className={classes.dividerRoot} />
              <IconButton
                className={classnames(classes.expand, { [classes.expandOpen]: expanded })}
                onClick={this.handleExpandClick}
              >
                <ExpandMore />
              </IconButton>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }
}

PeriodsConsumptionContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  openedOnInit: PropTypes.bool,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  showExpand: PropTypes.bool,
};

PeriodsConsumptionContainer.defaultProps = {
  title: 'Meter daily consumption',
  showTitle: true,
  showExpand: true,
  openedOnInit: false,
};

export default withStyles(styles)(PeriodsConsumptionContainer);
