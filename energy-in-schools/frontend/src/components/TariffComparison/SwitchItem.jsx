import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { SUPPLIER_LOGO_PATH } from './constants';
import { FUEL_TYPE } from '../SchoolRegistration/constants';
import listItemImage from '../../images/list_item_blue.svg';
import rightArrow from '../../images/arrow_right2.png';

const styles = {
  container: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    minWidth: 850,
  },
  title: {
    fontWeight: 500,
    fontSize: 19,
    color: 'black',
    fontFamily: 'Roboto, Helvetica',
  },
  supplierLogo: {
    display: 'inline-block',
    height: 65,
    width: 100,
    padding: '5%',
    borderRadius: 10,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
  },
  rightArrow: {
    display: 'inline-block',
    height: 80,
    width: 65,
  },
  rowName: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    color: 'rgba(72, 66, 66, 0.9)',
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    marginTop: 10,
  },
  itemImage: {
    width: 20,
    height: 20,
    marginTop: 10,
    paddingRight: 7,
    position: 'relative',
  },
};

function SwitchItem(props) {
  const {
    switchData, fromSupplierInfo, toSupplierInfo, classes,
  } = props;

  let meterIdLabel = '';
  switch (switchData.energy_meter_billing_info.fuel_type) {
    case FUEL_TYPE.electricity:
      meterIdLabel = 'MPAN';
      break;
    case FUEL_TYPE.gas:
      meterIdLabel = 'MPRN';
      break;
    default:
      meterIdLabel = 'Meter ID';
  }

  return (
    <Grid container className={classes.container}>
      <Grid container item xs={3} justify="center" direction="column" style={{ borderRight: 'solid lightgrey 1px', paddingRight: 10 }}>
        <Grid item>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={5}>
              <Typography className={classes.rowName}>Status: </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.value}>{switchData.status}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={5}>
              <Typography className={classes.rowName}>Requested at: </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.value}>{new Date(switchData.created_at).toDateString()}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={5}>
              <Typography className={classes.rowName}>Contract ID:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.value}>{switchData.contract_id}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={5}>
              <Typography className={classes.rowName}>{meterIdLabel}:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.value}>{switchData.energy_meter_billing_info.meter_id}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container item xs={4} direction="column" style={{ paddingLeft: 20 }}>
        <Grid container item>
          <Grid item xs={10}>
            <img
              src={`${SUPPLIER_LOGO_PATH}/${switchData.from_supplier_id}.png`}
              className={classes.supplierLogo}
              alt={`logo for ${fromSupplierInfo.name}`}
            />
          </Grid>
        </Grid>
        <Grid item>
          <Typography className={classes.rowName}>Supplier name: </Typography>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={11}>
              <Typography className={classes.value}>{fromSupplierInfo.name.toUpperCase()}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container alignItems="center" justify="center" item xs={1}>
        <img
          src={rightArrow}
          className={classes.rightArrow}
          alt="right arrow"
        />
      </Grid>
      <Grid container item xs={4} direction="column" style={{ paddingLeft: 20 }}>
        <Grid container item alignItems="center">
          <Grid item xs={10}>
            <img
              src={`${SUPPLIER_LOGO_PATH}/${switchData.to_supplier_id}.png`}
              className={classes.supplierLogo}
              alt={`logo for ${toSupplierInfo.name}`}
            />
          </Grid>
        </Grid>
        <Grid item>
          <Typography className={classes.rowName}>Supplier name: </Typography>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={11}>
              <Typography className={classes.value}>{toSupplierInfo.name.toUpperCase()}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography className={classes.rowName}>Tariff name: </Typography>
          <Grid container>
            <Grid item xs={1}>
              <img src={listItemImage} alt="list item" className={classes.itemImage} />
            </Grid>
            <Grid item xs={11}>
              <Typography className={classes.value}>{switchData.to_tariff_name}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

SwitchItem.propTypes = {
  switchData: PropTypes.object.isRequired,
  fromSupplierInfo: PropTypes.object.isRequired,
  toSupplierInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SwitchItem);
