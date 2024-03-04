import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';

import TablePaginationActions from './TablePaginationActions';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 300,
  },
  tableCellHead: {
    padding: '4px 16px',
    fontWeight: 700,
  },
  tableCellRoot: {
    padding: '4px 16px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  emptyTableRow: {
    height: 48,
  },
  emptyRowCellRoot: {},
  paginationRoot: {},
  paginationToolbar: {},
  paginationSpacer: {},
});

const ROWS_PER_PAGE_INITIAL_VALUE = 5;

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

class TablePaginationComponent extends React.Component {
  state = {
    page: 0,
    rowsPerPage: ROWS_PER_PAGE_INITIAL_VALUE,
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: Number(event.target.value) });
  };

  render() {
    const {
      classes, rows, showTableHead, paginationColSpan,
    } = this.props;
    const { rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            {(showTableHead && rows.length > 0) && (
              <TableHead>
                <TableRow>
                  {
                    Object.keys(rows[0]).map(columnName => (
                      <TableCell key={`head_${columnName}`} classes={{ root: classes.tableCellHead }}>
                        {columnName}
                      </TableCell>
                    ))
                  }
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={`row_${index}`}>{/* eslint-disable-line react/no-array-index-key */}
                  {
                    Object.keys(row).map(columnName => (
                      <TableCell key={`column_${columnName}`} classes={{ root: classes.tableCellRoot }}>
                        {row[columnName]}
                      </TableCell>
                    ))
                  }
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow classes={{ root: classes.emptyTableRow }}>
                  <TableCell colSpan={6} classes={{ root: classes.emptyRowCellRoot }} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              {rows.length > ROWS_PER_PAGE_OPTIONS[0] && (
                <TableRow>
                  <TablePagination
                    classes={{
                      root: classes.paginationRoot,
                      toolbar: classes.paginationToolbar,
                      spacer: classes.paginationSpacer,
                    }}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    colSpan={paginationColSpan}
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      native: true,
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              )}
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

TablePaginationComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
  showTableHead: PropTypes.bool,
  paginationColSpan: PropTypes.number,
};

TablePaginationComponent.defaultProps = {
  showTableHead: false,
  paginationColSpan: 3,
};

export default withStyles(styles)(TablePaginationComponent);
