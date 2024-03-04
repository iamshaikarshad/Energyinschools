import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

import { isEmpty } from 'lodash';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import { getSuppliers, getAllSwitches } from '../../actions/MUGActions';
import SwitchItem from '../../components/TariffComparison/SwitchItem';
import NoItems from '../../components/NoItems';

const styles = {
  root: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    fontFamily: 'Roboto-Medium',
  },
  container: {
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: 20,
  },
};

class Switches extends React.Component {
  async componentDidMount() {
    const { actions, suppliers, schoolId } = this.props;

    if (isEmpty(suppliers.data)) {
      await actions.getSuppliers();
    }
    actions.getAllSwitches(schoolId);
  }

  getSupplierById = (supplierId) => {
    const { suppliers } = this.props;

    return suppliers.data.find(supplier => (supplier.id === supplierId));
  };

  render() {
    const { switches, classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container className={classes.container} justify="center">
          {switches.data.length > 0
            ? (switches.data.map(switchData => (
              <Grid item xs={10} key={switchData.quote_id}>
                <SwitchItem
                  switchData={switchData}
                  fromSupplierInfo={this.getSupplierById(switchData.from_supplier_id)}
                  toSupplierInfo={this.getSupplierById(switchData.to_supplier_id)}
                />
              </Grid>
            ))) : (<NoItems />)}
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    suppliers: state.suppliers,
    switches: state.switches,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getSuppliers,
      getAllSwitches,
    }, dispatch),
  };
}

Switches.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  suppliers: PropTypes.object.isRequired,
  switches: PropTypes.object.isRequired,
  schoolId: PropTypes.number,
};

Switches.defaultProps = {
  schoolId: null,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Switches);
