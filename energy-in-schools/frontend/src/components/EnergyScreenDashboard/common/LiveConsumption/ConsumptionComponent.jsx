import React from 'react';
import PropTypes from 'prop-types';

import ListItem from '@material-ui/core/ListItem';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import { ELECTRICITY, GAS } from '../../../../constants/config';

import electricityMeterAvatar from '../../../../images/electric_white.svg';
import gasMeterAvatar from '../../../../images/gas_white.svg';

const styles = theme => ({
  cardRoot: {
    width: 500,
    height: 550,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    padding: theme.spacing(1, 2),
  },
  cardHeaderFont: {
    color: 'rgb(255, 255, 255)',
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    padding: theme.spacing(1, 2),
  },
  meterValueContainer: {
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    height: 450,
    width: '100%',
    borderRadius: '15px',
  },
  meterValueLabel: {
    fontSize: 20,
    padding: 4,
    color: 'rgb(181, 181, 181)',
  },
  meterValue: {
    display: 'flex',
    fontSize: 70,
  },
  meterValueUnit: {
    position: 'relative',
    top: '4px',
    fontSize: '14px',
  },
});

const ConsumptionComponent = ({
  classes, type, value, unit,
}) => {
  const getCardStyle = (energyType) => {
    switch (energyType) {
      case ELECTRICITY:
        return {
          cardColour: 'rgb(38, 153, 251)',
          avatarImage: electricityMeterAvatar,
        };
      case GAS:
        return {
          cardColour: 'rgb(243, 143, 49)',
          avatarImage: gasMeterAvatar,
        };
      default:
        throw new Error('Received unexpected consumption type');
    }
  };

  const cardStyle = getCardStyle(type);

  return (
    <Card raised classes={{ root: classes.cardRoot }}>
      <CardHeader
        classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderFont, subheader: classes.cardHeaderFont }}
        style={{ backgroundColor: cardStyle.cardColour }}
        avatar={
          <Avatar alt="Logo" src={cardStyle.avatarImage} classes={{ root: classes.avatar }} />
        }
      />
      <CardContent
        classes={{ root: classes.cardContentRoot }}
      >
        <List disablePadding>
          <ListItem className={classes.listItem}>
            <Grid
              container
              direction="column"
              alignItems="center"
              justify="center"
              className={classes.meterValueContainer}
            >
              <Typography className={classes.meterValueLabel}>VALUE ({unit})</Typography>
              <Typography className={classes.meterValue} style={{ color: cardStyle.cardColour }}>{value.toFixed(1)} {
                <Typography
                  className={classes.meterValueUnit}
                  style={{ color: cardStyle.cardColour }}
                >{unit}
                </Typography>
                }
              </Typography>
            </Grid>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

ConsumptionComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
};

export default withStyles(styles)(ConsumptionComponent);
