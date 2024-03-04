import React from 'react';
import PropTypes from 'prop-types';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import {
  Grid, List, ListItem, ListItemText, ListSubheader, Button, Typography, ListItemSecondaryAction, IconButton, Tooltip,
} from '@material-ui/core';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import {
  SUPPLIER_LOGO_PATH,
  TARIFF_FEATURES_TO_DISPLAY,
  TARIFF_FEATURE_TO_DISPLAY_CONFIG,
} from './constants';
import TimeOfUseTable from './TimeOfUseTable';
import NonTimeOfUseTable from './NonTimeOfUseTable';

const styles = theme => ({
  container: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    paddingLeft: 0,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    minWidth: 850,
  },
  supplierInfoContainer: {
    padding: 16,
    borderRight: 'solid lightgrey 1px',
    alignItems: 'center',
  },
  supplierLogo: {
    display: 'inline-block',
    height: 'auto',
    width: '80%',
    maxHeight: 90, // need it for IE
    padding: '5%',
    borderRadius: 25,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      borderRadius: 13,
    },
  },
  supplierName: {
    width: '100%',
    fontSize: 20,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 2,
    wordSpacing: 5,
    color: 'rgba(72, 66, 66, 0.9)',
    marginTop: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
    },
  },
  tariffDetailTextRoot: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  tariffDetailTextLabel: {
    width: '35%',
    fontSize: 14,
  },
  tariffDetailTextValue: {
    width: '65%',
    fontWeight: 500,
    paddingLeft: 16,
    fontSize: 14,
  },
  tariffDetailListItemWithHelp: {
    paddingRight: 16,
  },
  tariffDetailHelpActionRoot: {
    top: '25%',
  },
  tariffDetailHelpButton: {
    color: 'rgb(0, 188, 212)',
    padding: 0,
  },
  tariffDetailHelpIcon: {
    color: 'inherit',
  },
  listSubHeader: {
    fontWeight: 500,
    fontSize: 19,
    color: 'black',
  },
  switchButton: {
    marginTop: 30,
    margin: 10,
    fontSize: 16,
  },
  listItemIconRoot: {
    marginRight: 0,
    minWidth: 36,
  },
  listItemImage: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  timeOfUseTariffLabel: {
    border: 'solid green 3px',
    borderRadius: 8,
    width: 'fit-content',
    padding: 3,
    color: 'green',
    fontSize: 13,
    fontWeight: 600,
    marginRight: 5,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    opacity: 1,
  },
});

const ComparisonResult = ({
  resultData,
  classes,
  onClickDetailedTariffInfo,
  onClickSwitch,
  onClickTariffPrice,
}) => {
  const { result_id: resultId, is_hh: isTimeOfUse } = resultData;

  const TableComponent = isTimeOfUse ? TimeOfUseTable : NonTimeOfUseTable;

  return (
    <Grid container className={classes.container}>
      <Grid container item xs={2} direction="column" className={classes.supplierInfoContainer}>
        <Grid item container justify="center">
          <img
            src={`${SUPPLIER_LOGO_PATH}/${resultData.supplier_id}.png`}
            className={classes.supplierLogo}
            alt={`logo for ${resultData.supplier_name}`}
          />
        </Grid>
        <Grid item container justify="center">
          <Typography className={classes.supplierName}>{resultData.supplier_name}</Typography>
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={6}
        style={{
          borderRight: 'solid lightgrey 1px',
          paddingLeft: 20,
        }}
      >
        <List style={{ width: '100%' }}>
          <ListSubheader disableGutters className={classes.listSubHeader}>
            Tariff Information {isTimeOfUse && <span className={classes.timeOfUseTariffLabel}>Time Of Use Tariff</span>}
          </ListSubheader>
          {TARIFF_FEATURES_TO_DISPLAY.map((tariffFeature) => {
            const featureConfig = TARIFF_FEATURE_TO_DISPLAY_CONFIG[tariffFeature];
            if (!featureConfig) return null;
            const {
              label, getValue, showHelpInfo, getHelpInfo,
            } = featureConfig;
            const valueToDisplay = getValue(resultData);
            if (isNil(valueToDisplay)) return null;
            const helpInfo = showHelpInfo ? getHelpInfo(resultData) : null;
            return (
              <ListItem
                key={`${tariffFeature}_${resultId}`}
                dense
                component="div"
                classes={{ secondaryAction: classes.tariffDetailListItemWithHelp }}
              >
                <ListItemText
                  classes={{ root: classes.tariffDetailTextRoot }}
                  disableTypography
                >
                  <Typography className={classes.tariffDetailTextLabel}>{label}</Typography>
                  <Typography className={classes.tariffDetailTextValue}>{valueToDisplay}</Typography>
                </ListItemText>
                {helpInfo && (
                  <ListItemSecondaryAction classes={{ root: classes.tariffDetailHelpActionRoot }}>
                    <Tooltip
                      classes={{ tooltip: classes.tooltip, popper: classes.tooltipPopper }}
                      title={
                        (
                          <Typography>
                            {helpInfo}
                          </Typography>
                        )
                      }
                      disableTouchListener
                    >
                      <IconButton className={classes.tariffDetailHelpButton} edge="end" aria-label="help">
                        <HelpOutlineIcon className={classes.tariffDetailHelpIcon} />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
          <ListItem>
            <ListItemText>
              <Button onClick={onClickDetailedTariffInfo} variant="outlined">
                Click for details
              </Button>
            </ListItemText>
          </ListItem>
        </List>
      </Grid>
      <Grid container item xs={4} direction="column">
        <Grid item>
          <TableComponent resultData={resultData} onClickTariffPrice={onClickTariffPrice} />
        </Grid>
        <Grid container item justify="flex-end">
          <Button
            variant="contained"
            color="primary"
            className={classes.switchButton}
            onClick={onClickSwitch}
          >
            switch
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

ComparisonResult.propTypes = {
  resultData: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  onClickDetailedTariffInfo: PropTypes.func.isRequired,
  onClickSwitch: PropTypes.func.isRequired,
  onClickTariffPrice: PropTypes.func.isRequired,
};

export default withStyles(styles)(ComparisonResult);
