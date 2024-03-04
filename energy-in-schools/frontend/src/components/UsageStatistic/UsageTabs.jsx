import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import UsageCard from './UsageCard';

import { USAGE_CARD_TYPES, RESOURCE_CHILD_TYPE, UNIT } from '../../constants/config';

const styles = theme => ({
  tabsRoot: {
    padding: theme.spacing(2, 12),
    background: 'linear-gradient(180deg, #e0e0e0 50%, #ffffff 50%);',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  tabRoot: {
    padding: 0,
  },
  selected: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  scrollable: {
    overflowX: 'hidden',
  },
});

const getMeterName = (meterData) => {
  try {
    const { child_type: childType } = meterData;
    switch (childType) {
      case RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR: {
        const { device } = meterData;
        return device.label || device.name; // device.label should be first!!!
      }
      case RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER: {
        const { smart_things_sensor: { device } } = meterData;
        return device.label || device.name; // device.label should be first!!!
      }
      default:
        return meterData.name;
    }
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    return meterData.name;
  }
};

const UsageTabs = ({
  classes, type, unit, metersUsage, selectedMeterIdx, onMeterChange, placesAfterDot, summaryLabel, summaryUsage,
}) => (
  <Tabs
    value={selectedMeterIdx}
    onChange={onMeterChange}
    variant="scrollable"
    scrollButtons="on"
    indicatorColor="primary"
    textColor="primary"
    TabIndicatorProps={{ style: { display: 'none' } }}
    className={classes.tabsRoot}
    classes={{ scrollable: classes.scrollable }}
  >
    <Tab
      label={(
        <UsageCard
          unit={unit}
          type={USAGE_CARD_TYPES.SUMMARY}
          extraType={type}
          summaryLabel={summaryLabel}
          selected={selectedMeterIdx === 0}
          value={summaryUsage}
          placesAfterDot={placesAfterDot}
        />
    )}
      classes={{ root: classes.tabRoot }}
      style={{ color: 'rgba(0, 0, 0, 0.54)' }}
      TouchRippleProps={{ style: { borderRadius: 47 } }}
    />
    {
        metersUsage.filter(meter => !meter.hh_values_meter).map((meter, idx) => {
          let value = meter.total;
          if (meter.live_values_meter && unit === UNIT.kilowatt) {
            const liveMeter = metersUsage.find(m => m.id === meter.live_values_meter);
            if (liveMeter) {
              value = liveMeter.total;
            }
          }
          return (
            <Tab
              key={meter.id}
              label={(
                <UsageCard
                  type={meter.type ? meter.type : type}
                  unit={unit}
                  selected={selectedMeterIdx === idx + 1}
                  meterName={getMeterName(meter)}
                  location={meter.locationName}
                  value={value}
                  placesAfterDot={placesAfterDot}
                />
              )}
              classes={{ root: classes.tabRoot }}
              style={{ color: 'rgba(0, 0, 0, 0.54)' }}
              TouchRippleProps={{ style: { borderRadius: 47 } }}
            />
          );
        })
      }
  </Tabs>
);

UsageTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired,
  metersUsage: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    usage: PropTypes.number,
  })).isRequired,
  type: PropTypes.string.isRequired,
  selectedMeterIdx: PropTypes.number.isRequired,
  summaryUsage: PropTypes.number,
  placesAfterDot: PropTypes.number,
  summaryLabel: PropTypes.string,

  onMeterChange: PropTypes.func.isRequired,
};

UsageTabs.defaultProps = {
  summaryUsage: null,
  placesAfterDot: 2,
  summaryLabel: 'TOTAL CONSUMPTION',
};

export default withStyles(styles)(UsageTabs);
