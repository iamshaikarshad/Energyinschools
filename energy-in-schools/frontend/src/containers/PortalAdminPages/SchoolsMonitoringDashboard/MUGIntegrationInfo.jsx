import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';

import { isNil, round } from 'lodash';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { withStyles } from '@material-ui/core/styles';

import MUGIntegrationDetailsTable from './MUGIntegrationDetailsTable';
import ContentWrapperDialog from '../../../components/dialogs/ContentWrapperDialog';

import Switches from '../../SEMAdminPages/Switches';

import EnergyMetersBillingInfoResourceLinking from '../../../components/TariffComparison/EnergyMetersBillingInfoResourceLinking';

import schoolIcon from '../../../images/school.svg';

import {
  MUG_SITE_PROPS,
  MUG_SITE_PROP_DISPLAY_CONFIG,
  MUG_METER_PROPS,
  MUG_METER_PROP_DISPLAY_CONFIG,
  MUG_SWITCHES_STATISTIC_PROPS,
  MUG_SWITCHES_STATISTIC_PROP_LABEL,
  NOT_AVAILABLE_LABEL,
  STATUS_COLOR,
} from './constants';

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
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  detailsContainer: {
    justifyContent: 'center',
  },
  infoDetailBlock: {
    justifyContent: 'center',
    padding: '8px 16px',
    borderRight: '1px solid rgba(0, 0, 0, 0.05)',
    '&:last-child': {
      borderRight: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      borderRight: 'none',
    },
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  rightContentText: {
    padding: '8px 16px',
    fontSize: 16,
    width: '100%',
    textAlign: 'right',
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  rightContentValue: {
    fontWeight: 500,
  },
  infoBlock: {
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    [theme.breakpoints.down('sm')]: {
      borderTop: 'none',
      borderBottom: 'none',
    },
  },
  blockTitle: {
    justifyContent: 'center',
  },
  blockTitleText: {
    width: '100%',
    padding: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      fontSize: 15,
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
  getDevicesButtonContainer: {
    padding: 12,
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8,
    },
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  button: {
    minWidth: 115,
    fontSize: 14,
    textTransform: 'none',
    backgroundColor: 'rgb(0, 188, 212)',
    '&:hover': {
      backgroundColor: 'rgb(0, 188, 212)',
    },
  },
  link: {
    fontSize: 16,
    color: 'rgb(13, 180, 225)',
    textTransform: 'none',
    textDecoration: 'underline',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  },
  detailsDialogTitle: {
    padding: '0px 24px',
    margin: '16px auto',
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      margin: '12px auto',
      padding: '0px 12px',
    },
  },
  noData: {
    fontSize: 18,
    color: STATUS_COLOR.alert,
    padding: 8,
  },
});

const DETAILS_KEY = Object.freeze({
  mug_sites: 'mug_sites',
  mug_meters: 'mug_meters',
  switches: 'switches',
  resourceEnergyBILinking: 'resourceEnergyBILinking',
});

class MUGIntegrationInfo extends PureComponent {
  state = {
    detailsDialogOpened: false,
    detailsKey: null,
  };

  showDetails = (detailsKey) => {
    this.setState(
      {
        detailsKey,
      },
      () => { this.toggleDetailsDataDialog(); },
    );
  }

  toggleDetailsDataDialog = () => {
    this.setState(prevState => ({ detailsDialogOpened: !prevState.detailsDialogOpened }));
  }

  renderDetails = () => {
    const { detailsKey } = this.state;
    if (isNil(detailsKey)) return null;
    const { data, school: { id: schoolId, uid: schoolUid } } = this.props;
    switch (detailsKey) {
      case DETAILS_KEY.mug_sites:
        return (
          <MUGIntegrationDetailsTable
            title="MUG sites"
            data={data.mug_sites}
            dataPropsToDisplayConfig={{
              propsList: MUG_SITE_PROPS,
              propsConfigDict: MUG_SITE_PROP_DISPLAY_CONFIG,
            }}
          />
        );
      case DETAILS_KEY.mug_meters:
        return (
          <MUGIntegrationDetailsTable
            title="MUG meters"
            data={data.mug_meters}
            dataPropsToDisplayConfig={{
              propsList: MUG_METER_PROPS,
              propsConfigDict: MUG_METER_PROP_DISPLAY_CONFIG,
            }}
          />
        );
      case DETAILS_KEY.switches:
        return (
          <Switches schoolId={schoolId} />
        );
      case DETAILS_KEY.resourceEnergyBILinking: {
        const { onUpdated } = this.props;
        return (
          <EnergyMetersBillingInfoResourceLinking
            locationData={{
              id: schoolId,
              uid: schoolUid,
            }}
            onUpdated={() => {
              onUpdated();
              this.toggleDetailsDataDialog();
            }}
          />
        );
      }
      default:
        return null;
    }
  }

  render() {
    const { classes, data, school } = this.props;

    if (isNil(data) || isNil(school)) return null;

    const { name } = school;

    const { detailsDialogOpened } = this.state;

    const mugCustomerId = data.mug_customer_id;

    const dataIsInformative = !isNil(mugCustomerId);

    return (
      <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
        <Grid item xs={12} container justify="center">
          <Typography className={classes.title}>
            MUG Integration Info
          </Typography>
        </Grid>
        <Grid item xs={12} container className={classes.detailsContainer}>
          {dataIsInformative ? (
            <Fragment>
              <Grid item xs={12} container>
                <Typography className={classes.rightContentText}>
                  MUG customer id: <span className={classes.rightContentValue}>{mugCustomerId}</span>
                </Typography>
              </Grid>
              <Grid item xs={12} container className={classes.infoBlock} justify="center">
                <Grid item container xs={6} className={classes.infoDetailBlock} justify="center">
                  <Button
                    className={classes.link}
                    onClick={() => { this.showDetails(DETAILS_KEY.mug_sites); }}
                  >
                    MUG sites
                  </Button>
                </Grid>
                <Grid item container xs={6} className={classes.infoDetailBlock} justify="center">
                  <Button
                    className={classes.link}
                    onClick={() => { this.showDetails(DETAILS_KEY.mug_meters); }}
                  >
                    MUG meters
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12} container className={classes.blockTitle}>
                <Typography className={classes.blockTitleText}>
                  Switches statistics
                </Typography>
              </Grid>
              <Grid item xs={12} container className={classes.infoBlock}>
                {MUG_SWITCHES_STATISTIC_PROPS.map((prop) => {
                  const label = MUG_SWITCHES_STATISTIC_PROP_LABEL[prop];
                  const value = data.switches_per_status[prop];
                  const valueToDisplay = !isNil(value) ? round(value, 1) : NOT_AVAILABLE_LABEL.nA;
                  return (
                    <Grid key={prop} item container md={4} className={classes.infoDetailBlock}>
                      <Grid item container xs={9} alignItems="center">
                        <Typography className={classes.label}>
                          {label}
                        </Typography>
                      </Grid>
                      <Grid item container xs={3} alignItems="center" justify="flex-end">
                        <Typography className={classes.value}>
                          {valueToDisplay}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })}
                <Grid item container md={4} className={classes.infoDetailBlock}>
                  <Button
                    className={classes.link}
                    onClick={() => { this.showDetails(DETAILS_KEY.switches); }}
                  >
                    Switches
                  </Button>
                </Grid>
              </Grid>
              <Grid item container md={12} className={classes.infoDetailBlock}>
                <Button
                  color="primary"
                  className={classes.button}
                  variant="contained"
                  onClick={() => { this.showDetails(DETAILS_KEY.resourceEnergyBILinking); }}
                >
                  Linking resources
                </Button>
              </Grid>
              <ContentWrapperDialog
                titleIcon={schoolIcon}
                title={name}
                isOpened={detailsDialogOpened}
                breakpointDownUseFullScreen="sm"
                classes={{
                  dialogTitle: classes.detailsDialogTitle,
                }}
                onClose={this.toggleDetailsDataDialog}
              >
                {this.renderDetails()}
              </ContentWrapperDialog>
            </Fragment>
          ) : (
            <Grid item container xs={12} justify="center" alignItems="center">
              <Typography className={classes.noData}>
                No MUG customer id!
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  }
}

MUGIntegrationInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.shape({
    mug_customer_id: PropTypes.number,
    mug_sites: PropTypes.arrayOf(PropTypes.shape({
      sub_location_id: PropTypes.number,
      sub_location_name: PropTypes.string,
      mug_site_id: PropTypes.number,
    })).isRequired,
    mug_meters: PropTypes.arrayOf(PropTypes.shape({
      energy_meter_billing_info_id: PropTypes.number,
      mug_meter_id: PropTypes.number,
    })).isRequired,
    switches_per_status: PropTypes.shape({
      sent_to_mug: PropTypes.number,
      supplier_downloaded_contract: PropTypes.number,
      switch_accepted: PropTypes.number,
      live_switch_complete: PropTypes.number,
      failed_contract: PropTypes.number,
    }).isRequired,
    require_resource_linking: PropTypes.bool.isRequired,
  }).isRequired,
  school: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  onUpdated: PropTypes.func.isRequired,
};

export default withStyles(styles)(MUGIntegrationInfo);
