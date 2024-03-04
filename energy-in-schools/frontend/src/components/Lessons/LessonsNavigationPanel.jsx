import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';

import { NAVIGATION_PANEL_DEFAULT_STATE } from './constants';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    borderRadius: '0px 0px 5px 5px',
    backgroundColor: 'rgb(255, 255, 255)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
    [theme.breakpoints.down('sm')]: {
      paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
    },
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgb(0, 188, 212)',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 21,
    fontWeight: 500,
    color: 'rgb(74, 74, 74)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  navigationButton: {
    minHeight: 32,
    minWidth: 32,
    padding: 8,
    marginRight: 15,
    marginTop: 2,
    marginBottom: 2,
    border: '1px solid rgba(0, 188, 212, 0.4)',
    fontSize: 12,
    lineHeight: 'normal',
    [theme.breakpoints.down('sm')]: {
      marginRight: 10,
    },
  },
  navigationButtonsContainer: {
    padding: theme.spacing(1),
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    marginTop: 0,
    height: 36,
    width: 36,
    padding: 0, // for proper centering in IE
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class LessonsNavigationPanel extends React.Component {
  state = {
    selectedButtonIndex: 0,
    expanded: NAVIGATION_PANEL_DEFAULT_STATE,
  };

  onClick = index => () => {
    const { numerationData, onNavigate } = this.props;
    this.setState({ selectedButtonIndex: index });
    onNavigate(numerationData[index].dataId);
  };

  getButtonColor = (index) => {
    const { selectedButtonIndex } = this.state;
    const isActive = index === selectedButtonIndex;
    return {
      color: isActive ? 'rgb(250, 250, 250)' : 'rgb(0, 188, 212)',
      backgroundColor: isActive ? 'rgb(0, 188, 212)' : 'rgb(250, 250, 250)',
    };
  };

  handleExpandClick = () => {
    const { onNavigationPanelExpandChange } = this.props;
    this.setState(prevState => ({ expanded: !prevState.expanded }), () => {
      onNavigationPanelExpandChange();
    });
  };

  render() {
    const { classes, numerationData } = this.props;
    const { expanded } = this.state;
    const buttons = numerationData.map((item, index) => {
      const { label } = item;
      return label ? (
        <Button
          key={item.label}
          className={classes.navigationButton}
          style={this.getButtonColor(index)}
          onClick={this.onClick(index)}
        >
          {item.label}
        </Button>
      ) : null;
    });
    return (
      <div className={classes.root} style={{ paddingTop: expanded ? 8 : 4, paddingBottom: expanded ? 8 : 4 }}>
        <Grid container alignItems="center" justify="center">
          <Grid
            item
            container
            xs={9}
            sm={expanded ? 4 : 11}
            lg={expanded ? 3 : 11}
            direction="column"
          >
            {expanded ? (
              <Grid item>
                <Typography className={classes.subtitle}>
                  Select item
                </Typography>
              </Grid>
            ) : (
              <Grid item>
                <Typography className={classes.title}>
                  Quick navigation
                </Typography>
              </Grid>
            )}
          </Grid>
          <Hidden xsDown>
            {expanded && (
              <Grid item container className={classes.navigationButtonsContainer} xs={12} sm={7} lg={8}>
                {buttons}
              </Grid>
            )}
          </Hidden>
          <Grid item container className={classes.expandButtonContainer} xs={3} sm={1}>
            <IconButton
              className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={this.handleExpandClick}
            >
              <ExpandMore />
            </IconButton>
          </Grid>
          <Hidden smUp>
            {expanded && (
              <Grid item container className={classes.navigationButtonsContainer} xs={12} sm={7} lg={8}>
                {buttons}
              </Grid>
            )}
          </Hidden>
        </Grid>
      </div>
    );
  }
}

LessonsNavigationPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  numerationData: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      dataId: PropTypes.number.isRequired,
    }),
  ),
  onNavigate: PropTypes.func.isRequired,
  onNavigationPanelExpandChange: PropTypes.func.isRequired,
};

LessonsNavigationPanel.defaultProps = {
  numerationData: [],
};

export default compose(withStyles(styles))(LessonsNavigationPanel);
