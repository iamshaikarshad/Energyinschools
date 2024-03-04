import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

import { capitalize, isNil } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';

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
  infoDetailBlock: {
    padding: '8px 16px',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    '&:last-child': {
      borderRight: 'none',
    },
    [theme.breakpoints.down('md')]: {
      padding: 8,
    },
    [theme.breakpoints.down('xs')]: {
      borderRight: 'none',
    },
  },
  infoDetailText: {
    width: '100%',
    fontWeight: 400,
    paddingRight: 8,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
    },
  },
  infoDetailValue: {
    paddingRight: 0,
    fontWeight: 500,
  },
  dividerRoot: {
    width: '100%',
  },
  infoItemsBlocksDivider: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  expandContainer: {},
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

class EnergyMeterBillingInfoDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.openedOnInit,
    };
  }

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  renderInfoBlock = (infoItems) => {
    const { classes, formatValueFunc } = this.props;
    return (
      <Grid container>
        {infoItems.map((infoItem) => {
          const { key, label, value } = infoItem;
          return (
            <Grid key={key} container item xs={12} md alignItems="center" className={classes.infoDetailBlock}>
              <Grid container item xs={5}>
                <Typography className={classes.infoDetailText}>{label}</Typography>
              </Grid>
              <Grid container item xs={7}>
                <Typography className={classnames(classes.infoDetailText, classes.infoDetailValue)} align="right">
                  {formatValueFunc(key, value)}
                </Typography>
              </Grid>
            </Grid>
          );
        })
        }
      </Grid>
    );
  };

  forceExpand = (callback) => {
    this.setState({
      expanded: true,
    }, callback);
  };

  render() {
    const {
      classes, generalInfoItems, extraInfoItems, title, showTitle, showExpand, children,
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
              <Divider light className={classes.dividerRoot} />
            </Grid>
          </Grid>
        )
        }
        {this.renderInfoBlock(generalInfoItems)}
        <Divider light className={classnames(classes.dividerRoot, classes.infoItemsBlocksDivider)} />
        {(expanded && extraInfoItems.length > 0) && this.renderInfoBlock(extraInfoItems)}
        {expanded && (
          <React.Fragment>
            {children}
          </React.Fragment>
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
        )
        }
      </Grid>
    );
  }
}

EnergyMeterBillingInfoDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  generalInfoItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ).isRequired,
  extraInfoItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ),
  openedOnInit: PropTypes.bool,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  showExpand: PropTypes.bool,
  formatValueFunc: PropTypes.func,
  children: PropTypes.node,
};

EnergyMeterBillingInfoDetails.defaultProps = {
  title: 'Meter information',
  extraInfoItems: [],
  openedOnInit: false,
  showTitle: true,
  showExpand: true,
  formatValueFunc: (key, value) => (!isNil(value) ? capitalize(value) : 'N/A'),
  children: null,
};

export default withStyles(styles)(EnergyMeterBillingInfoDetails);
