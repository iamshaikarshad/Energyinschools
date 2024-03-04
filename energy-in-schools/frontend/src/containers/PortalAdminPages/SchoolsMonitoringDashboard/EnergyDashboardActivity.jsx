import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import classnames from 'classnames';

import { isEmpty, isNil } from 'lodash';

import { bindActionCreators, compose } from 'redux';

import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { withStyles } from '@material-ui/core/styles';

import ContentCopy from '@material-ui/icons/FilterNone';

import TablePaginationComponent from '../../../components/TablePagination/TablePaginationComponent';

import { showMessageSnackbar } from '../../../actions/dialogActions';


import { NOT_AVAILABLE_LABEL } from './constants';

import {
  ENERGY_DASHBOARD_VERSIONS, ENERGY_DASHBOARD_VERSION_CONFIG, ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL,
} from '../../../components/EnergyScreenDashboard/constants';

import copyClick from '../../../utils/copyClick';

const styles = theme => ({
  root: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  title: {
    width: '100%',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: 21,
    textAlign: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  activityStatisticsContainer: {
    marginTop: 16,
    padding: '0px 16px',
  },
  linkWrapper: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 'normal',
    textAlign: 'center',
    position: 'relative',
    width: '100%',
  },
  link: {
    display: 'inline-block',
    padding: 4,
    color: 'rgb(13, 180, 225)',
    fontSize: 16,
  },
  copyButton: {
    padding: 4,
    marginTop: '-9px',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: '-8px',
    },
  },
  copyIcon: {
    color: 'rgb(13, 170, 225)',
    width: 20,
    height: 20,
    [theme.breakpoints.down('xs')]: {
      height: 18,
      width: 18,
    },
  },
  tableWrapper: {
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  tableRoot: {
    minWidth: 420,
    backgroundColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    marginTop: 0,
    marginBottom: 0,
  },
  tableCellRoot: {
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
    padding: '6px 16px 4px',
  },
  tableCellHead: {
    borderBottom: '1px solid rgba(224, 224, 224, 0.6)',
    fontSize: 14,
  },
  emptyTableRow: {
    height: 'auto',
  },
  tableEmptyRowCellRoot: {
    borderBottom: 'none',
    padding: 0,
  },
  tablePaginationToolbar: {
    minHeight: 24,
    height: 'auto',
    paddingLeft: 16,
  },
  tablePaginationSpacer: {
    [theme.breakpoints.down('sm')]: {
      flexBasis: 0,
      flexGrow: 0,
    },
  },
  cellLinkWrapper: {
    width: 'auto',
    display: 'inline-block',
  },
  cellLink: {
    fontSize: 14,
    paddingLeft: 0,
  },
  extraInfoContainer: {
    padding: '8px 16px',
  },
  extraInfoItemText: {
    fontSize: 12,
    padding: '4px 8px',
  },
});

class EnergyDashboardActivity extends PureComponent {
  onCopyLinkClick = link => (e) => {
    const { actions } = this.props;
    e.stopPropagation();
    copyClick(link, 'Copied link to clipboard', actions.showMessageSnackbar);
  }

  getExternalUrl = (link) => {
    const { schoolUid } = this.props;
    const { origin } = window.location;
    return `${origin}${link}/${schoolUid}/`;
  };

  getActivityStatisticsRowsData = (activityStatisticsData = []) => {
    const { classes } = this.props;
    const data = ENERGY_DASHBOARD_VERSIONS.reduce((result, version) => {
      const config = ENERGY_DASHBOARD_VERSION_CONFIG[version];
      if (config) {
        const dataItem = {};
        const { path, label } = config;
        const versionActivityData = activityStatisticsData.find(activityItemData => activityItemData.type === version);
        const lastPingDate = (!isEmpty(versionActivityData) && !isNil(versionActivityData.last_ping))
          ? moment(versionActivityData.last_ping).format('DD-MM-YYYY HH:mm')
          : NOT_AVAILABLE_LABEL.nullable;
        const externalUrl = this.getExternalUrl(path);
        dataItem['Dashboard version'] = (
          <Typography className={classnames(classes.linkWrapper, classes.cellLinkWrapper)}>
            <a
              className={classnames(classes.link, classes.cellLink)}
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
            <IconButton className={classes.copyButton} onClick={this.onCopyLinkClick(externalUrl)}>
              <ContentCopy className={classes.copyIcon} />
            </IconButton>
          </Typography>
        );
        dataItem['Last activity*'] = lastPingDate;
        result.push(dataItem);
      }
      return result;
    }, []);
    return data;
  }

  render() {
    const { classes, activityStatisticsData } = this.props;

    return (
      <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
        <Grid item xs={12} container justify="center">
          <Typography className={classes.title}>
            Energy Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} container className={classes.activityStatisticsContainer}>
          <Grid item xs={12} container className={classes.tableWrapper}>
            <TablePaginationComponent
              classes={{
                root: classes.tableRoot,
                tableCellHead: classes.tableCellHead,
                tableCellRoot: classes.tableCellRoot,
                emptyTableRow: classes.emptyTableRow,
                emptyRowCellRoot: classes.tableEmptyRowCellRoot,
                paginationToolbar: classes.tablePaginationToolbar,
                paginationSpacer: classes.tablePaginationSpacer,
              }}
              rows={this.getActivityStatisticsRowsData(activityStatisticsData)}
              showTableHead
              paginationColSpan={2}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} container className={classes.extraInfoContainer}>
          <Typography className={classes.extraInfoItemText}>
            *Last Activity date is accurate to {moment.duration(ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL, 'milliseconds').asMinutes()} mins
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

EnergyDashboardActivity.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  schoolUid: PropTypes.string.isRequired,
  activityStatisticsData: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    last_ping: PropTypes.string,
  })),
};

EnergyDashboardActivity.defaultProps = {
  activityStatisticsData: [],
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      showMessageSnackbar,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(EnergyDashboardActivity);
