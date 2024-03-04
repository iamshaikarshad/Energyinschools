import React from 'react';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import CheckIcon from '@material-ui/icons/Check';

import { getEnergyMetersBillingInfoList, postEnergyMetersBillingInfoResources } from '../../actions/schoolsActions';
import { getEnergyResourcesList } from '../../actions/energyResourcesActions';
import { ENERGY_METERS_BI_RESOURCES_KEY, ENERGY_METERS_BI_RESOURCES_KEY_LABEL } from './constants';

const CHECK_ICON_SIZE = 24;

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    fontFamily: 'Roboto-Medium',
  },
  tableContainer: {
    marginTop: 30,
    overflowX: 'auto',
    overflowY: 'hidden',
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    borderRadius: 13,
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  table: {},
  tableHeadCell: {
    fontSize: 16,
    fontWeight: 700,
    paddingRight: 0,
  },
  row: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  saveButton: {
    margin: '15px 10px 10px',
    fontSize: 20,
  },
  errorSelect: {
    border: 'solid red 1px',
    borderRadius: 3,
    padding: 3,
  },
  errorMessage: {
    color: 'red',
    marginLeft: 25,
    marginTop: 10,
    fontSize: 12,
  },
  resourceSelectWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  select: {
    minWidth: 70,
  },
  selectMenuItem: {
    '& .energyMeterBillingInfoResourceLinkedIcon': {
      display: 'block',
    },
  },
  heading: {
    marginTop: 20,
    padding: '0px 15px',
    fontFamily: 'Roboto, Helvetica',
    fontSize: 20,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
  checkIcon: {
    fontSize: CHECK_ICON_SIZE,
    display: 'none',
    verticalAlign: 'middle',
    color: 'rgba(0, 0, 0, 0.57)',
  },
  noDataRoot: {},
  noDataItemBlock: {
    padding: 50,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 25,
      paddingRight: 25,
    },
  },
  noDataText: {
    color: 'rgba(255, 50, 50, 0.87)',
    fontSize: 42,
    textShadow: '2px 2px 2px #71b7e6',
    [theme.breakpoints.down('xs')]: {
      fontSize: 32,
    },
  },
});

class EnergyMetersBillingInfoResourceLinking extends React.Component {
  state = {
    loading: true,
    energyMeterBillingInfoResourceMap: {},
  };

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const {
      actions, locationData: { id: locationId, uid: locationUid },
    } = this.props;
    Promise.all(
      [
        actions.getEnergyResourcesList({ location_uid: locationUid }),
        actions.getEnergyMetersBillingInfoList(locationId)
          .then((energyMetersBillingData) => {
            this.setState({
              energyMeterBillingInfoResourceMap: energyMetersBillingData.data.reduce((res, meter) => {
                res[meter.id] = meter.resource_id;
                return res;
              }, {}),
            });
          }),
      ],
    )
      .catch(() => {})
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  getResourcesSelectOptions = (energyMeterBillingInfoResourceMapValues = []) => {
    const { classes, energyResources } = this.props;
    return energyResources.data.map((resource) => {
      const { id: resourceId, name: resourceName } = resource;
      const resourceIsLinked = energyMeterBillingInfoResourceMapValues.includes(resourceId);
      return (
        <MenuItem
          key={resourceId}
          value={resourceId}
          className={classes.selectMenuItem}
        >
          {resourceIsLinked && (
            <CheckIcon className={`${classes.checkIcon} energyMeterBillingInfoResourceLinkedIcon`} />
          )}
          <span style={{ marginLeft: resourceIsLinked ? 5 : CHECK_ICON_SIZE + 5 }}>{resourceName}</span>
        </MenuItem>
      );
    });
  }

  onChangeResource = (meterId, newValue) => {
    const { energyMeterBillingInfoResourceMap } = this.state;

    this.setState({
      energyMeterBillingInfoResourceMap: { ...energyMeterBillingInfoResourceMap, [meterId]: newValue },
    });
  };

  submitData = () => {
    const { actions, onUpdated } = this.props;
    const { energyMeterBillingInfoResourceMap } = this.state;

    const data = Object.keys(energyMeterBillingInfoResourceMap).map(meterId => ({
      [ENERGY_METERS_BI_RESOURCES_KEY.energy_meter_billing_info]: Number(meterId),
      [ENERGY_METERS_BI_RESOURCES_KEY.resource]: energyMeterBillingInfoResourceMap[meterId],
    }));

    actions.postEnergyMetersBillingInfoResources(data)
      .then(() => {
        onUpdated();
      })
      .catch(() => {});
  };

  findDuplicates = arr => arr.filter((item, index) => item && arr.indexOf(item) !== index);

  renderNoData = (billingInfoIsAvailable) => {
    const { classes } = this.props;
    const message = billingInfoIsAvailable
      ? 'No energy resource'
      : 'No energy meters billing info!';
    return (
      <Grid container justify="center" alignItems="center" direction="column" className={classes.noDataRoot}>
        <Grid item className={classes.noDataItemBlock}>
          <Typography align="center" className={classes.noDataText}>
            {message}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { loading, energyMeterBillingInfoResourceMap } = this.state;
    if (loading) return null;

    const {
      classes, energyMetersBillingData, energyResources,
    } = this.props;

    const billingInfoIsAvailable = energyMetersBillingData.data.length > 0;

    const resourcesAvailable = energyResources.data.length > 0;

    const energyMeterBillingInfoResourceMapValues = Object.values(energyMeterBillingInfoResourceMap);

    const duplicates = this.findDuplicates(energyMeterBillingInfoResourceMapValues);

    const { length: duplicatesLength } = duplicates;

    const resourcesSelectOptions = this.getResourcesSelectOptions(energyMeterBillingInfoResourceMapValues);

    return (
      <div className={classes.root}>
        {(billingInfoIsAvailable && resourcesAvailable) ? (
          <Grid container justify="center">
            <Typography className={classes.heading}>Link energy meters billing info with resources</Typography>
            <Grid item container xs={12} md={10} className={classes.tableContainer}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    {Object.values(ENERGY_METERS_BI_RESOURCES_KEY_LABEL).map(label => (
                      <TableCell key={label} classes={{ root: classes.tableHeadCell }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {energyMetersBillingData.data.map((meter) => {
                    const { id: meterId } = meter;
                    const linkedResourceId = energyMeterBillingInfoResourceMap[meterId];
                    return (
                      <TableRow className={classes.row} key={`meter_${meterId}`}>
                        <TableCell>{meter.meter_id}</TableCell>
                        <TableCell>
                          <Typography component="div" className={classes.resourceSelectWrapper}>
                            <Select
                              className={duplicates.includes(linkedResourceId) ? classes.errorSelect : ''}
                              classes={{ select: classes.select }}
                              label="Resource"
                              margin="dense"
                              name={`resource_select_${meterId}`}
                              onChange={(e) => { this.onChangeResource(meterId, e.target.value); }}
                              value={linkedResourceId || ''}
                            >
                              {resourcesSelectOptions.map(option => option)}
                            </Select>
                            {linkedResourceId ? (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => { this.onChangeResource(meterId, null); }}
                                key={`unbind_resource_${meterId}`}
                                style={{ marginLeft: 15 }}
                              >
                                unbind
                              </Button>
                            ) : null
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Grid>
            <Grid item container>
              <Grid item container justify="center">
                {(duplicatesLength > 0) && (
                  <Typography className={classes.errorMessage}>{'There shoudn\'t be any duplications'}</Typography>
                )}
              </Grid>
              <Grid item container justify="center">
                <Button
                  className={classes.saveButton}
                  key="save_button"
                  color="primary"
                  onClick={this.submitData}
                  disabled={duplicatesLength > 0}
                >
                  save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          this.renderNoData(billingInfoIsAvailable)
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    energyMetersBillingData: state.energyMetersBillingData,
    energyResources: state.energyResources,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getEnergyResourcesList,
      getEnergyMetersBillingInfoList,
      postEnergyMetersBillingInfoResources,
    }, dispatch),
  };
}

EnergyMetersBillingInfoResourceLinking.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  energyMetersBillingData: PropTypes.object.isRequired,
  energyResources: PropTypes.object.isRequired,
  locationData: PropTypes.shape({
    id: PropTypes.number,
    uid: PropTypes.string,
  }),
  onUpdated: PropTypes.func,
};

EnergyMetersBillingInfoResourceLinking.defaultProps = {
  locationData: {},
  onUpdated: () => {},
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(EnergyMetersBillingInfoResourceLinking);
