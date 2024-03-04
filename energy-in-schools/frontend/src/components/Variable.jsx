import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import ContentCopy from '@material-ui/icons/FilterNone';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';

import variableIcon from '../images/variable.svg';
import keyIcon from '../images/key.svg';
import defaultHubIcon from '../images/hub_grey.svg';
import raspberryHubIcon from '../images/raspberrypiVar.svg';
import browserHubIcon from '../images/browser_hub_grey.svg';
import locationIcon from '../images/location_grey.svg';
import valueIcon from '../images/value.svg';
import downloadIcon from '../images/csv_file.svg';
import chartActiveIcon from '../images/chart_active.svg';
import plusIcon from '../images/plus_blue.svg';
import deleteIcon from '../images/feedback_delete.svg';

import copyClick from '../utils/copyClick';

import { VARIABLE_MODE } from '../containers/SLEAdminPages/Variables';

import { HUB_TYPES } from '../constants/hubConstants';

import * as historicalDataActions from '../actions/historicalDataActions';

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
    borderBottom: '1px solid rgb(223, 223, 223)',
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
      backgroundColor: 'white',
    },
  },
  columnName: {
    display: 'inline-block',
    color: 'rgb(183, 183, 183)',
    [theme.breakpoints.only('md')]: {
      fontSize: 10,
    },
    [theme.breakpoints.only('sm')]: {
      fontSize: 12,
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: 10,
    },
  },
  variableValuesItem: {
    marginTop: 10,
    fontSize: 14,
    [theme.breakpoints.down('sm')]: {
      marginTop: 5,
      fontSize: 14,
    },
    [theme.breakpoints.only('md')]: {
      fontSize: 12,
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: 10,
    },
  },
  variableIcon: {
    width: 30,
    height: 35,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  keyIcon: {
    width: 14,
    height: 14,
    verticalAlign: 'middle',
    marginRight: 5,
  },
  copyIcon: {
    fontSize: 18,
    marginLeft: theme.spacing(1),
    color: theme.palette.text.disabled,
    verticalAlign: 'middle',
  },
  valueTooltipText: {
    fontSize: 14,
    margin: 0,
  },
  hubTooltipText: {
    fontSize: 14,
    marginRight: 10,
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
    padding: 8,
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  hidden: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  downloadText: {
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgb(0, 188, 212)',
    [theme.breakpoints.up('lg')]: {
      textAlign: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      flexBasis: '50%',
    },
  },
  downloadIcon: {
    width: 21,
    height: 23,
    marginRight: 10,
    verticalAlign: 'middle',
    [theme.breakpoints.up('lg')]: {
      marginRight: 0,
    },
  },
  downloadContainer: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'center',
    },
  },
  iconLabel: {
    userSelect: 'none',
    display: 'inline-block',
    verticalAlign: 'middle',
    [theme.breakpoints.up('lg')]: {
      display: 'block',
      marginTop: 10,
    },
  },
  plusIcon: {
    height: 23,
  },
  addValueBlock: {
    marginTop: 10,
    marginBottom: 10,
    [theme.breakpoints.up('lg')]: {
      marginTop: 0,
      marginBottom: 0,
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  downloadDataBlock: {
    [theme.breakpoints.down('xs')]: {
      marginTop: 12,
    },
  },
  buttonsWrapper: {
    paddingLeft: 8,
    paddingRight: 8,
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-around',
    },
    [theme.breakpoints.only('md')]: {
      flexDirection: 'column',
      paddingLeft: 16,
      paddingRight: 16,
      marginLeft: 12,
    },
    [theme.breakpoints.only('sm')]: {
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  },
  smallDeviceEditVariableButton: {
    marginRight: 5,
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      marginBottom: 5,
    },
  },
  variableIconContainer: {
    display: 'flex',
    flex: '0 0 50px',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      flex: '0 0 8px',
    },
  },
});

const DEFAULT_HUB_DISPLAY_DETAILS = Object.freeze({
  icon: defaultHubIcon,
  label: 'Hub',
});

const HUB_TYPE_TO_DISPLAY_DETAILS_MAP = Object.freeze({
  [HUB_TYPES.BROWSER]: {
    icon: browserHubIcon,
    label: 'Web browser',
  },
  [HUB_TYPES.RASPBERRY]: {
    icon: raspberryHubIcon,
    label: 'Raspberry hub',
  },
});

class Variable extends React.Component {
  state = { expanded: false };

  onCopyClick = (textToCopy) => {
    const { showMessageBar } = this.props;
    copyClick(textToCopy, 'Copied key', showMessageBar);
  };

  getHubDispalyDetails = () => {
    const { variable, hubs } = this.props;
    const currentHub = hubs.find(hub => hub.uid === variable.hub_uid) || {};
    return HUB_TYPE_TO_DISPLAY_DETAILS_MAP[currentHub.type] || DEFAULT_HUB_DISPLAY_DETAILS;
  }

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    let variableValue;
    let variableUpdatedAt;

    const {
      classes, variable, mode, actions, onDelete, onNewHistoricalVariable, onEdit, onShowUsageStatistic, onLocationEdit,
    } = this.props;

    const {
      expanded,
    } = this.state;

    const isVariable = mode === VARIABLE_MODE;

    const { icon: hubIcon, label: hubLabel } = this.getHubDispalyDetails();

    if (variable.key) {
      variableValue = variable.value;
      variableUpdatedAt = moment(variable.updated_at).format('D MMM, YYYY h:mm A');
    } else {
      variableValue = variable.latest_item ? variable.latest_item.value : 'No values';
      variableUpdatedAt = variable.latest_item
        ? moment(variable.latest_item.time).format('D MMM, YYYY h:mm A')
        : moment(variable.updated_at).format('D MMM, YYYY h:mm A');
    }

    return (
      <Grid container className={classes.root}>
        <Hidden mdUp>
          <Grid item xs={12} container justify="center" style={{ backgroundColor: 'rgba(0, 188, 212, 0.1)', padding: 8, marginBottom: 16 }}>
            <Typography style={{ color: 'rgb(0, 188, 212)' }}>
              Last changes: {variableUpdatedAt}
            </Typography>
          </Grid>
        </Hidden>
        <Grid item className={classes.variableIconContainer}>
          <img src={variableIcon} alt="variable" className={classes.variableIcon} />
        </Grid>
        <Grid item xs={5} md={2}>
          <img src={keyIcon} alt="key" className={classes.keyIcon} />
          <Typography component="div" className={classes.columnName}>Key</Typography>
          <Typography component="div" className={classes.variableValuesItem} noWrap>
            {variable.key || `${variable.namespace}_${variable.name}`}
            {variable.key
              && <ContentCopy className={classes.copyIcon} onClick={() => this.onCopyClick(variable.key)} />
            }
          </Typography>
        </Grid>
        <Grid item xs={3} sm={2} md style={{ paddingLeft: 10 }}>
          <img src={locationIcon} alt="location id" className={classes.keyIcon} style={{ transform: 'scale(1.2, 1.2)' }} />
          <Typography component="div" className={classes.columnName}>Location ID</Typography>
          <Typography component="div" className={classes.variableValuesItem}>
            { variable.key ? variable.location_id : variable.sub_location_id }
            { !variable.key
              && <Edit className={classes.copyIcon} onClick={onLocationEdit} />
            }
          </Typography>
        </Grid>
        <Hidden mdUp>
          <Grid item xs container justify="flex-end">
            <IconButton
              className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={this.handleExpandClick}
            >
              <ExpandMore />
            </IconButton>
          </Grid>
        </Hidden>
        <Hidden mdUp>
          <Grid item xs={12} className={!expanded ? classes.hidden : ''} style={{ height: 8 }} />
        </Hidden>
        <Hidden mdUp>
          <Grid item className={!expanded ? classes.hidden : classes.variableIconContainer} />
        </Hidden>
        <Tooltip
          title={hubLabel}
          disableFocusListener
          disableTouchListener
          classes={{ tooltip: classes.hubTooltipText }}
          placement="left"
        >
          <Grid item xs={5} md className={!expanded ? classes.hidden : ''}>
            <img src={hubIcon} alt="hub uid" className={classes.keyIcon} style={{ transform: 'scale(1.2, 1.2)' }} />
            <Typography component="div" className={classes.columnName}>Hub UID</Typography>
            <Typography component="div" className={classes.variableValuesItem}>{variable.hub_uid} </Typography>
          </Grid>
        </Tooltip>
        <React.Fragment>
          <Tooltip
            title={variableValue}
            disableFocusListener
            disableTouchListener
            classes={{ tooltip: classes.valueTooltipText }}
            placement="left"
          >
            <Grid
              item
              xs={variable.key ? 2 : 4}
              md
              className={!expanded ? classes.hidden : ''}
              style={{ paddingLeft: 10 }}
            >
              <img src={valueIcon} alt="value" className={classes.keyIcon} />
              <Typography component="div" className={classes.columnName}>{variable.key ? 'Value' : 'Latest value'}</Typography>
              <Typography component="div" className={classes.variableValuesItem} noWrap>
                {variableValue}
              </Typography>
            </Grid>
          </Tooltip>
          {expanded && (
            <Hidden mdUp>
              <Grid item xs container justify="flex-end">
                {isVariable && onEdit !== null && (
                  <Fab
                    size="small"
                    aria-label="Delete"
                    color="primary"
                    className={classes.smallDeviceEditVariableButton}
                    onClick={onEdit}
                  >
                    <Edit />
                  </Fab>
                )}
                { isVariable && onDelete !== null
                  && (
                  <Fab size="small" aria-label="Delete" color="primary" onClick={onDelete} style={{ marginLeft: 4 }}>
                    <Delete />
                  </Fab>
                  )
                }
              </Grid>
            </Hidden>
          )}
          <Hidden smDown>
            <Grid item xs={2} md>
              <Typography component="div" className={classes.columnName}>Last changes</Typography>
              <Typography component="div" className={classes.variableValuesItem}>{variableUpdatedAt} </Typography>
            </Grid>
          </Hidden>
        </React.Fragment>
        { isVariable ? (
          <Hidden smDown>
            <Grid item xs md container justify="center">
              {onEdit !== null && (
              <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                <Fab size="small" aria-label="Edit" color="primary" onClick={onEdit} style={{ marginRight: 10 }}>
                  <Edit />
                </Fab>
                <Fab size="small" aria-label="Delete" color="primary" onClick={onDelete}>
                  <Delete />
                </Fab>
              </Grid>
              )}
            </Grid>
          </Hidden>
        ) : (
          <Grid item xs={12} md={3} container alignItems="center" className={!expanded ? `${classes.hidden} ${classes.downloadContainer}` : ''}>
            <Grid item xs={12} sm={10} md={9} lg={10} container className={classes.buttonsWrapper}>
              <Typography
                component="div"
                className={classes.downloadText}
                onClick={onShowUsageStatistic}
              >
                <img src={chartActiveIcon} alt="chart" className={classes.downloadIcon} />
                <span className={classes.iconLabel}>CHART</span>
              </Typography>
              <Typography component="div" className={classnames(classes.downloadText, classes.addValueBlock)} onClick={onNewHistoricalVariable}>
                <img src={plusIcon} alt="add" className={classnames(classes.downloadIcon, classes.plusIcon)} />
                <span className={classes.iconLabel}>ADD VALUE</span>
              </Typography>
              <Typography component="div" className={classnames(classes.downloadText, classes.downloadDataBlock)} onClick={() => actions.downloadFile(variable.id, variable.key)}>
                <img src={downloadIcon} alt="download" className={classes.downloadIcon} />
                <span className={classes.iconLabel}>DOWNLOAD</span>
              </Typography>
              <Hidden smUp>
                {onDelete !== null && (
                <Typography component="div" className={classes.downloadText} style={{ marginTop: 12 }} onClick={onDelete}>
                  <img src={deleteIcon} alt="delete" className={classes.downloadIcon} />
                  <span className={classes.iconLabel}>DELETE</span>
                </Typography>
                )}
              </Hidden>
            </Grid>
            <Hidden xsDown>
              {onDelete !== null && (
              <Grid item container xs justify="flex-end" alignItems="center">
                <Fab size="small" aria-label="Delete" color="primary" onClick={onDelete}>
                  <Delete />
                </Fab>
              </Grid>
              )}
            </Hidden>
          </Grid>
        )}
      </Grid>
    );
  }
}

Variable.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  variable: PropTypes.object.isRequired,
  showMessageBar: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  hubs: PropTypes.array.isRequired,
  onNewHistoricalVariable: PropTypes.func,
  onShowUsageStatistic: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onLocationEdit: PropTypes.func,
};

Variable.defaultProps = {
  onDelete: null,
  onEdit: null,
  onLocationEdit: null,
  onNewHistoricalVariable: null,
};

function mapStateToProps(state) {
  return {
    hubs: state.hubs.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...historicalDataActions,
    }, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Variable);
