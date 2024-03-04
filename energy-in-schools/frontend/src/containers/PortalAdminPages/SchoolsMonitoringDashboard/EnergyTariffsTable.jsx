import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import classnames from 'classnames';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import TablePaginationComponent from '../../../components/TablePagination/TablePaginationComponent';

import {
  TARIFF_PROPS,
  TARIFF_PROP_TO_RESPONSE_PROP_MAP,
  TARIFF_PROP_TO_DISPLAY_CONFIG,
  STATUS_COLOR,
} from './constants';

const styles = theme => ({
  root: {},
  titleContainer: {},
  title: {
    position: 'relative',
  },
  tableRoot: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    marginTop: 8,
    marginBottom: 8,
  },
  tableCellRoot: {
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
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
  expand: {
    position: 'absolute',
    right: 0,
    top: -8,
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    padding: 8,
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  count: {},
  noData: {
    fontSize: 18,
    padding: '4px 8px',
  },
  alertText: {
    color: STATUS_COLOR.alert,
  },
});

class EnergyTariffsTable extends PureComponent {
  getTariffsRowsData = (tariffs) => {
    const data = tariffs.map((tariff) => {
      const dataItem = TARIFF_PROPS.reduce((res, prop) => {
        const propConfig = TARIFF_PROP_TO_DISPLAY_CONFIG[prop];
        if (propConfig) {
          const { name, getValue } = propConfig;
          res[name] = getValue(tariff[TARIFF_PROP_TO_RESPONSE_PROP_MAP[prop]]);
        }
        return res;
      }, {});
      return dataItem;
    });
    return data;
  }

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    const { classes, tariffs } = this.props;
    const tariffsAvailable = Array.isArray(tariffs) && tariffs.length > 0;
    return (
      <Grid item container xs={12} className={classes.root}>
        <Grid item xs={12} container>
          {tariffsAvailable ? (
            <TablePaginationComponent
              classes={{
                root: classes.tableRoot,
                tableCellRoot: classes.tableCellRoot,
                emptyTableRow: classes.emptyTableRow,
                emptyRowCellRoot: classes.tableEmptyRowCellRoot,
                paginationToolbar: classes.tablePaginationToolbar,
                paginationSpacer: classes.tablePaginationSpacer,
              }}
              rows={this.getTariffsRowsData(tariffs)}
              showTableHead
              paginationColSpan={TARIFF_PROPS.length}
            />
          ) : (
            <Grid item container xs={12} justify="center" alignItems="center">
              <Typography className={classnames(classes.noData, classes.alertText)}>
                No tariff!
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  }
}

EnergyTariffsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  tariffs: PropTypes.array,
};

EnergyTariffsTable.defaultProps = {
  tariffs: [],
};

export default compose(withStyles(styles))(EnergyTariffsTable);
