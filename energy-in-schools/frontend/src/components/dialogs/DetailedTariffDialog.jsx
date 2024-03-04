import React from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';

import Grid from '@material-ui/core/Grid';

import RootDialog from './RootDialog';
import TimeOfUseTariffDetailedTable from '../TariffComparison/TimeOfUseTariffDetailedTable';
import UnitRatesInfo from '../TariffComparison/UnitRatesInfo';
import { TIME_OF_USE_TARIFF_DATA_MOCK } from '../TariffComparison/constants';

const styles = theme => ({
  container: {},
  dialogRootPaper: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      marginLeft: 0,
      marginRight: 0,
    },
  },
  blockWrapper: {
    '&:not(:last-child)': {
      marginBottom: 16,
    },
  },
});

function DetailedTariffDialog(props) {
  const {
    isOpened, classes, onClose, title, tariffInfo, ...rest
  } = props;

  const tariffInfoIsAvailable = !isNil(tariffInfo);

  return (
    <RootDialog
      isOpened={isOpened && tariffInfoIsAvailable}
      onClose={onClose}
      title={title}
      closeLabel="Close"
      classes={{ rootPaper: classes.dialogRootPaper }}
      {...rest}
    >
      {tariffInfoIsAvailable && (
        <Grid container className={classes.container}>
          <Grid container className={classes.blockWrapper}>
            <UnitRatesInfo data={(tariffInfo.tariff_rate_infos || [])} id={tariffInfo.result_id} />
          </Grid>
          {tariffInfo.is_hh && (
            <Grid container className={classes.blockWrapper}>
              <TimeOfUseTariffDetailedTable data={TIME_OF_USE_TARIFF_DATA_MOCK} />
            </Grid>
          )}
        </Grid>
      )}
    </RootDialog>
  );
}

DetailedTariffDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  tariffInfo: PropTypes.object, // TODO: make it required
};

DetailedTariffDialog.defaultProps = {
  title: 'Detailed tariff info',
  tariffInfo: null,
};

export default withStyles(styles)(DetailedTariffDialog);
