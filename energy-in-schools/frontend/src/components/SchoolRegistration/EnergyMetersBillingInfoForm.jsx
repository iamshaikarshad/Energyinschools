import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import TableChartIcon from '@material-ui/icons/TableChart';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';
import { standardValidators, extraValidators } from '../../utils/extraFormValidators';

import {
  ENERGY_METER_INFO_KEY,
  ENERGY_METER_INFO_KEY_LABEL,
  ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL,
  METER_TYPE_LABEL,
  NOT_AVAILABLE_LABEL,
  MUG_METER_RATE_TYPE,
} from './constants';

import { ELECTRICITY } from '../../constants/config';
import BatterySavingsChart from './BatterySavingsChart';

const styles = theme => ({
  formClass: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  table: {
    maxWidth: 1000,
    width: '100%',
    borderRadius: '7px',
    borderSpacing: '1px 20px',
    margin: '20px',
    '& input': {
      alignText: 'left',
    },
  },
  HeaderCellLeft: {
    borderRadius: '7px 0 0 0',
    backgroundColor: '#0077C8',
  },
  HeaderCellRight: {
    textAlign: 'right',
    borderRadius: '0 7px 0 0',
    backgroundColor: '#0077C8',
  },
  headerCellForChart: {
    textAlign: 'right',
    borderRadius: '7px 7px 0 0',
    backgroundColor: '#0077C8',
  },
  cleanGenChart: {
  },
  chartData: {
  },
  row: {
    height: '30',
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  formHelperTextRoot: {
    fontSize: 10,
  },
  iconButtons: {
    color: 'white',
  },
  mugIcon: {
    maxHeight: 30,
    maxWidth: 24,
  },
  createMugMeterButton: {
    fontSize: 20,
    color: 'white',
  },
  select: {
    maxWidth: 50,
  },
  ratesList: {
    borderBottom: '1px dotted #8c8c8c',
    paddingBottom: 0,
    marginBottom: 4,
  },
  ratesListItem: {
    paddingTop: 0,
    paddingBottom: 7,
  },
});

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: 'rgb(20, 97, 198)',
    color: theme.palette.common.white,
    fontSize: 16,
    fontColor: 'white',
  },
  body: {
    fontSize: 14,
    maxWidth: 300,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
      height: 30,
    },
  },
}))(TableRow);

class EnergyMetersBillingInfoForm extends React.Component {
  state = {
    isMeterChartOpen: false,
    resourcesInUse: [],
  };

  componentDidMount() {
    const { energyResources, meters } = this.props;

    this.setState({
      resourcesInUse: meters.map((meter) => {
        const resourceInUse = energyResources.find(resource => resource.id === meter.resource_id);

        return {
          meter_id: meter.id,
          resource_id: meter.resource_id === 'N/A' ? null : parseInt(meter.resource_id, 10),
          resource_name: resourceInUse && resourceInUse.name,
        };
      }),
    });

    ValidatorForm.addValidationRule(
      'positiveOrN/A',
      value => extraValidators.isEqualToCaseInsensitive(value, NOT_AVAILABLE_LABEL) || standardValidators.isPositive(value),
    );
  }

  componentDidUpdate(prevProps) {
    const { energyResources, meters } = this.props;
    const { meters: prevMeters } = prevProps;

    if (prevMeters.length !== meters.length) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        resourcesInUse: meters.map((meter) => {
          const resourceInUse = energyResources.find(resource => resource.id === meter.resource_id);

          return {
            meter_id: meter.id,
            resource_id: meter.resource_id === 'N/A' ? null : parseInt(meter.resource_id, 10),
            resource_name: resourceInUse && resourceInUse.name,
          };
        }),
      });
    }
  }

  openChart = () => {
    const { isMeterChartOpen } = this.state;
    this.setState({
      isMeterChartOpen: !isMeterChartOpen,
    });
  };

  handleResourceIdChange = (index, value) => {
    const { resourcesInUse } = this.state;
    const { meters, energyResources, onUpdate } = this.props;

    resourcesInUse[index].resource_id = value;
    resourcesInUse[index].resource_name = energyResources.find(resource => resource.id === value).name;

    this.setState(resourcesInUse);

    onUpdate({ ...meters[index], resource_id: value }, meters[index].id);
  }

  render() {
    const {
      classes,
      meters,
      refFunc,
      exportMeter,
      removeMeter,
      showActionsButtons,
      onSubmit,
      suppliers,
      energyResources,
    } = this.props;
    const { resourcesInUse, isMeterChartOpen } = this.state;

    return (
      <React.Fragment>
        {meters.map((meter, index) => {
          const availableResources = energyResources
            .filter(resourceToFilter => resourcesInUse && !resourcesInUse
              .find((resourceInUse, resourceIndex) => resourceInUse.resource_id === resourceToFilter.id && resourceIndex !== index));
          const foundSupplier = suppliers.find(supplier => supplier.id === parseInt(meter[ENERGY_METER_INFO_KEY.supplier_id], 10));

          return (
            <ValidatorForm
              className={classes.formClass}
              ref={refFunc}
              key={`form_${meter.id}`}
              onSubmit={() => { onSubmit(); }}
            >
              <Table className={classes.table} aria-label="customized table" component={Paper}>
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    {!isMeterChartOpen && (
                      <StyledTableCell className={classes.HeaderCellLeft}>
                        Meter #{index + 1}
                      </StyledTableCell>
                    )}
                    <StyledTableCell className={!isMeterChartOpen ? classes.HeaderCellRight : classes.headerCellForChart}>
                      {showActionsButtons && (
                        <div>
                          <IconButton className={classes.iconButtons} onClick={removeMeter(index)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton className={classes.iconButtons} onClick={() => { exportMeter(meter.id); }}>
                            <SaveIcon />
                          </IconButton>
                          {meter[ENERGY_METER_INFO_KEY.fuel_type] === ELECTRICITY && (
                            <IconButton className={classes.iconButtons} onClick={() => this.openChart()}>
                              {!isMeterChartOpen ? <EqualizerIcon /> : <TableChartIcon />}
                            </IconButton>
                          )}
                        </div>
                      )}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                {isMeterChartOpen && meter[ENERGY_METER_INFO_KEY.fuel_type] === ELECTRICITY ? (
                  <TableBody>
                    <TableRow>
                      <TableCell className={classes.cleanGenChart}>
                        <BatterySavingsChart
                          label="Renewable Generation"
                          meterIndex={index}
                          meter={meter}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.resource_id}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <SelectValidator
                          fullWidth
                          openImmediately
                          onChange={e => this.handleResourceIdChange(index, e.target.value)}
                          name={`meter_${index}_resource_id`}
                          defaultValue="No resource"
                          value={(resourcesInUse && resourcesInUse[index]) ? resourcesInUse[index].resource_id : 'No resource'}
                          validators={['required']}
                          errorMessages={['This field is required']}
                        >
                          {availableResources.length ? availableResources.map(resource => (
                            <MenuItem key={`resource_${resource.id}`} value={resource.id}>{resource.name}</MenuItem>
                          )) : <MenuItem value="No resource">No resource available</MenuItem>}
                        </SelectValidator>
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow className={classes.tableRow}>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.supplier_id}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          name={`meter_${index}_supplier_id`}
                          value={foundSupplier ? foundSupplier.name : 'No supplier'}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.fuel_type}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          name={`meter_${index}_fuel_type`}
                          value={meter[ENERGY_METER_INFO_KEY.fuel_type]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.meter_id}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          type="text"
                          margin="dense"
                          name={`meter_${index}_meter_id`}
                          value={meter[ENERGY_METER_INFO_KEY.meter_id]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.meter_type}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          margin="dense"
                          disabled
                          name={`meter_${index}_meter_type`}
                          value={METER_TYPE_LABEL[meter[ENERGY_METER_INFO_KEY.meter_type]]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.contract_starts_on}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          type="date"
                          margin="dense"
                          disabled
                          name={`meter_${index}_contract_starts_on`}
                          value={meter[ENERGY_METER_INFO_KEY.contract_starts_on]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.contract_ends_on}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          type="date"
                          margin="dense"
                          disabled
                          name={`meter_${index}_contract_ends_on`}
                          value={meter[ENERGY_METER_INFO_KEY.contract_ends_on]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.standing_charge}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          type="text"
                          margin="dense"
                          name={`meter_${index}_standing_charge`}
                          value={meter[ENERGY_METER_INFO_KEY.standing_charge]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL.unit_rate}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <List className={classes.ratesList}>
                          {meter[ENERGY_METER_INFO_KEY.consumption_by_rates].map(consumptionByRate => (
                            <ListItem
                              disableGutters
                              disabled
                              key={`${consumptionByRate.id}_unit_rate`}
                              className={classes.ratesListItem}
                            >
                              {meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
                                ? `${consumptionByRate.unit_rate_period.toUpperCase()}: ` : ''}{consumptionByRate.unit_rate}
                            </ListItem>
                          ))}
                        </List>
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL.consumption}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <List className={classes.ratesList}>
                          {meter[ENERGY_METER_INFO_KEY.consumption_by_rates].map(consumptionByRate => (
                            <ListItem
                              disabled
                              disableGutters
                              key={`${consumptionByRate.id}_consumption`}
                              margin="dense"
                              className={classes.ratesListItem}
                            >
                              {meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
                                ? `${consumptionByRate.unit_rate_period.toUpperCase()}: ` : ''}{consumptionByRate.consumption}
                            </ListItem>
                          ))}
                        </List>
                      </StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.school_address}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          type="text"
                          margin="dense"
                          name={`meter_${index}_site_address`}
                          value={meter[ENERGY_METER_INFO_KEY.school_address]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                          validators={['required', 'isPositive', 'maxNumber:9999']}
                          errorMessages={['This field is required', 'only positive numbers are allowed', 'this value should be smaller']}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    {
                      meter[ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly] && (
                        <React.Fragment>
                          <StyledTableRow>
                            <StyledTableCell>
                              {ENERGY_METER_INFO_KEY_LABEL.site_capacity}
                            </StyledTableCell>
                            <StyledTableCell align="left">
                              <TextValidator
                                fullWidth
                                disabled
                                type="text"
                                margin="dense"
                                name={`meter_${index}_site_capacity`}
                                value={meter[ENERGY_METER_INFO_KEY.site_capacity]}
                                FormHelperTextProps={{
                                  classes: {
                                    root: classes.formHelperTextRoot,
                                  },
                                }}
                                validators={['required', 'isPositive', 'maxNumber:9999']}
                                errorMessages={['This field is required', 'only positive numbers are allowed', 'this value should be smaller']}
                              />
                            </StyledTableCell>
                          </StyledTableRow>
                          <StyledTableRow>
                            <StyledTableCell>
                              {ENERGY_METER_INFO_KEY_LABEL.capacity_charge}
                            </StyledTableCell>
                            <StyledTableCell align="left">
                              <TextValidator
                                fullWidth
                                disabled
                                type="text"
                                margin="dense"
                                name={`meter_${index}_capacity_charge`}
                                value={meter[ENERGY_METER_INFO_KEY.capacity_charge]}
                                FormHelperTextProps={{
                                  classes: {
                                    root: classes.formHelperTextRoot,
                                  },
                                }}
                                validators={['required', 'isPositive', 'maxNumber:9999']}
                                errorMessages={['This field is required', 'only positive numbers are allowed', 'this value should be smaller']}
                              />
                            </StyledTableCell>
                          </StyledTableRow>
                        </React.Fragment>
                      )
                    }
                    {meter[ENERGY_METER_INFO_KEY.has_solar] && (
                      <StyledTableRow>
                        <StyledTableCell>
                          {ENERGY_METER_INFO_KEY_LABEL.solar_capacity}
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          <TextValidator
                            fullWidth
                            disabled
                            type="text"
                            margin="dense"
                            name={`meter_${index}_solar_capacity`}
                            value={meter[ENERGY_METER_INFO_KEY.solar_capacity] ? meter[ENERGY_METER_INFO_KEY.solar_capacity] : 'No Solar'}
                            FormHelperTextProps={{
                              classes: {
                                root: classes.formHelperTextRoot,
                              },
                            }}
                            validators={['required', 'isPositive', 'maxStringLength:4']}
                            errorMessages={['This field is required', 'only positive numbers are allowed', 'this value should be less than 4 characters long']}
                          />
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                    <StyledTableRow>
                      <StyledTableCell>
                        {ENERGY_METER_INFO_KEY_LABEL.tpi_name}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        <TextValidator
                          fullWidth
                          disabled
                          type="text"
                          margin="dense"
                          name={`meter_${index}_tpi_name`}
                          value={meter[ENERGY_METER_INFO_KEY.tpi_name]}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                          validators={['maxStringLength:50']}
                          errorMessages={['this value should be smaller']}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                )}
              </Table>
            </ValidatorForm>
          );
        })}
      </React.Fragment>
    );
  }
}

EnergyMetersBillingInfoForm.propTypes = {
  classes: PropTypes.object.isRequired,
  meters: PropTypes.array.isRequired,
  refFunc: PropTypes.func.isRequired,
  suppliers: PropTypes.array.isRequired,
  energyResources: PropTypes.array.isRequired,
  exportMeter: PropTypes.func,
  removeMeter: PropTypes.func,
  showActionsButtons: PropTypes.bool,
  onSubmit: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
};

EnergyMetersBillingInfoForm.defaultProps = {
  showActionsButtons: false,
  exportMeter: () => {},
  removeMeter: () => {},
  onSubmit: () => {},
};

export default withStyles(styles)(EnergyMetersBillingInfoForm);
