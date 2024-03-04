import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CardHeader from '@material-ui/core/CardHeader';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ContentCopy from '@material-ui/icons/FilterNone';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import schoolAvatar from '../images/school.svg';
import flagIcon from '../images/flag_map.svg';

import copyClick from '../utils/copyClick';
import roundToNPlaces from '../utils/roundToNPlaces';

import { UNIT, UNIT_TO_LABEL_MAP, GOOGLE_MAPS_API_LINK } from '../constants/config';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(2),
    borderRadius: 8,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(1),
    },
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    borderRadius: 0,
    [theme.breakpoints.down('xs')]: {
      width: 32,
      height: 32,
    },
  },
  button: {
    position: 'relative',
    top: 2,
    marginRight: 24,
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    },
  },
  cardHeaderRoot: {
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  cardHeaderContent: {
    paddingRight: 16,
  },
  cardHeaderAction: {
    alignSelf: 'center',
  },
  subheader: {
    fontSize: '13px',
    color: theme.palette.primary.main,
  },
  cardTitle: {
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  title: {
    color: theme.palette.primary.main,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
  },
  cardActionContainer: {
    position: 'relative',
    top: 5,
    alignItems: 'flex-end',
    flexDirection: 'row',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  schoolMeasureContainer: {
    paddingRight: 16,
  },
  schoolsMeasureValue: {
    display: 'flex',
    fontSize: 28,
    fontWeight: 500,
    color: theme.palette.text.disabled,
    lineHeight: 1.26,
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
      lineHeight: 1.2,
    },
  },
  schoolsMeasureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    lineHeight: 2,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
      lineHeight: 1.2,
    },
  },
  schoolsMeasureUnit: {
    position: 'relative',
    left: '3px',
    lineHeight: 2.25,
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
      lineHeight: 1.5,
    },
  },
});

class School extends React.Component {
  state = { expanded: false };

  onCopyClick = (textToCopy) => {
    const { showMessageBar } = this.props;
    copyClick(textToCopy, 'Copied school ID', showMessageBar);
  };

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  handleMapLinkClick = address => () => {
    window.open(encodeURI(`${GOOGLE_MAPS_API_LINK}${address}`), '_blank');
  }

  render() {
    const {
      classes, name, id, address, alwaysOnValue, cashbackValue, displayCashback,
    } = this.props;

    const { expanded } = this.state;
    return (
      <div>
        <Card className={classes.root}>
          <CardHeader
            avatar={
              <Avatar alt="School" src={schoolAvatar} classes={{ root: classes.avatar }} />
              }
            action={(
              <Grid container alignItems="center" className={classes.cardActionContainer}>
                {displayCashback && (
                  <Grid item className={classes.schoolMeasureContainer}>
                    <Typography variant="caption" className={classes.schoolsMeasureLabel}>OFF-PEAKY POINTS</Typography>
                    <Typography variant="h4" className={classes.schoolsMeasureValue}>
                      {roundToNPlaces(cashbackValue, 2)}
                    </Typography>
                  </Grid>
                )
                }
                <Grid item className={classes.schoolMeasureContainer}>
                  <Typography variant="caption" className={classes.schoolsMeasureLabel}>ALWAYS-ON USAGE</Typography>
                  <Typography variant="h4" className={classes.schoolsMeasureValue}>
                    { roundToNPlaces(alwaysOnValue, 2) }
                    <Typography className={classes.schoolsMeasureUnit}>{UNIT_TO_LABEL_MAP[UNIT.kilowatt]}</Typography>
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid container alignItems="center">
                    <Button className={classes.button} onClick={() => { this.onCopyClick(id); }}>
                      <ContentCopy className={classes.leftIcon} />
                      COPY ID
                    </Button>
                    <IconButton
                      className={classnames(classes.expand, {
                        [classes.expandOpen]: expanded,
                      })}
                      onClick={this.handleExpandClick}
                    >
                      <ExpandMore />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            )}
            title={name}
            subheader={`SCHOOL ID: ${id}`}
            classes={{
              root: classes.cardHeaderRoot,
              action: classes.cardHeaderAction,
              subheader: classes.subheader,
              title: classes.cardTitle,
              content: classes.cardHeaderContent,
            }}
          />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent>
              <Grid container style={{ height: '100%' }} direction="column" justify="space-between">
                <Grid container style={{ paddingLeft: 56 }}>
                  <Grid item sm={6}>
                    <Typography variant="body2" style={{ padding: '12px 0px' }}>
                      Number of counters
                    </Typography>
                    <Typography paragraph className={classes.title}>
                      TBD
                    </Typography>
                  </Grid>
                  <Grid item sm={6}>
                    <Typography variant="body2" style={{ padding: '12px 0px' }}>
                      Location (address)
                    </Typography>
                    <Typography paragraph>
                      {address}
                    </Typography>
                    <Button
                      className={classes.button}
                      onClick={this.handleMapLinkClick(address)}
                      style={{ color: '#00bcd4', paddingLeft: 0, textTransform: 'none' }}
                    >
                      <img
                        src={flagIcon}
                        alt="See on map"
                        style={{ width: 15 }}
                        className={classes.leftIcon}
                      />
                      See on map
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Collapse>
        </Card>
      </div>
    );
  }
}

School.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  alwaysOnValue: PropTypes.number,
  cashbackValue: PropTypes.number,
  displayCashback: PropTypes.bool,

  showMessageBar: PropTypes.func.isRequired,
};

School.defaultProps = {
  displayCashback: true,
  alwaysOnValue: null,
  cashbackValue: null,
};

export default compose(withStyles(styles))(School);
