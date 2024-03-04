import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { isNil, isEmpty } from 'lodash';

import MaterialTable, { MTableToolbar } from 'material-table';

import Grid from '@material-ui/core/Grid';

import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import { TABLE_ICONS, theme as MaterialTableTheme } from './MaterialTableStyles';

import { NOT_AVAILABLE_LABEL } from './constants';

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
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  detailsContainer: {
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    [theme.breakpoints.down('sm')]: {
      borderBottom: 'none',
    },
  },
  infoDetailBlock: {
    justifyContent: 'center',
    padding: '8px 16px',
    borderRight: '1px solid rgba(0, 0, 0, 0.05)',
    '&:last-child': {
      borderRight: 'none',
    },
    [theme.breakpoints.down('md')]: {
      '&:nth-child(2n)': {
        borderRight: 'none',
      },
    },
    [theme.breakpoints.down('sm')]: {
      borderRight: 'none',
    },
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  label: {
    fontSize: 16,
    lineHeight: 'normal',
  },
  value: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 'normal',
    textAlign: 'center',
  },
  getHistoryButtonContainer: {
    padding: 16,
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8,
    },
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  button: {
    fontSize: 14,
    textTransform: 'none',
    backgroundColor: 'rgb(0, 188, 212)',
    '&:hover': {
      backgroundColor: 'rgb(0, 188, 212)',
    },
  },
  tableTitleRoot: {
    paddingLeft: 16,
    paddingRight: 0,
  },
  tableTitle: {
    flex: '0 1 auto',
    [theme.breakpoints.only('sm')]: {
      minWidth: '40%',
    },
    '& h6': {
      fontSize: '1.05rem',
      [theme.breakpoints.only('sm')]: {
        fontSize: '1rem',
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.87rem',
      },
    },
  },
});

class MUGIntegrationDetailsTable extends PureComponent {
  getDataTablePropsFromData = (data) => {
    const { dataPropsToDisplayConfig } = this.props;
    if (isEmpty(dataPropsToDisplayConfig)) return null;
    const { propsList, propsConfigDict } = dataPropsToDisplayConfig;
    const tableColumns = propsList.map(prop => ({
      field: prop,
      title: propsConfigDict[prop].label,
      sorting: propsConfigDict[prop].sorting || false,
    }));
    const tableData = data.map(dataItem => ({
      ...propsList.reduce((res, prop) => {
        const propConfig = propsConfigDict[prop];
        if (propConfig) {
          const { transformRule } = propConfig;
          const value = dataItem[prop];
          res[prop] = !isNil(transformRule) // eslint-disable-line no-nested-ternary
            ? transformRule(value)
            : (!isNil(value) ? value : NOT_AVAILABLE_LABEL.nullable);
        }
        return res;
      }, {}),
      originData: dataItem,
    }));
    return {
      columns: tableColumns,
      data: tableData,
    };
  };

  render() {
    const { classes, data, title } = this.props;

    return (
      <MuiThemeProvider theme={MaterialTableTheme}>
        <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
          <Grid item container justify="center">
            <MaterialTable
              {...this.getDataTablePropsFromData(data)}
              title={title}
              icons={TABLE_ICONS}
              components={{
                Toolbar: props => (
                  <MTableToolbar
                    {...props}
                    classes={{
                      root: classes.tableTitleRoot,
                      title: classes.tableTitle,
                    }}
                  />
                ),
              }}
              options={{
                headerStyle: {
                  color: 'rgba(0, 0, 0, 0.54)',
                  fontWeight: 700,
                },
                pageSize: data.length <= 5 ? 5 : 10,
                emptyRowsWhenPaging: false,
              }}
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

MUGIntegrationDetailsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  data: PropTypes.array.isRequired,
  dataPropsToDisplayConfig: PropTypes.shape({
    propsList: PropTypes.arrayOf(PropTypes.string).isRequired,
    propsConfigDict: PropTypes.object.isRequired,
  }).isRequired,
};

MUGIntegrationDetailsTable.defaultProps = {
  title: '',
};

export default withStyles(styles)(MUGIntegrationDetailsTable);
