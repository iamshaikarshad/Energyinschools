import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import CardHeader from '@material-ui/core/CardHeader';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import SchoolRegistrationInfo from './SchoolRegistrationInfo';

import schoolAvatar from '../images/school.svg';
import flagIcon from '../images/flag_map.svg';
import refuseReasonAvatar from '../images/refuse_reason.svg';

import getAddressDisplayValue from '../utils/getAddressDisplayValue';

import { ADDRESS_FIELD } from './SchoolRegistration/constants';

import { GOOGLE_MAPS_API_LINK } from '../constants/config';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(3),
    borderRadius: '5px',
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
    },
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    borderRadius: 0,
  },
  button: {
    margin: theme.spacing(1),
  },
  subheader: {
    fontSize: '14px',
    color: '#b5b5b5',
  },
  title: {
    color: theme.palette.primary.main,
  },
  contentContainer: {
    paddingLeft: 56,
    paddingRight: 56,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  buttonsContainer: {
    marginLeft: 'auto',
    marginRight: 56,
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
  },
  activateMapsButton: {
    color: theme.palette.text.disabled,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
  },
  rejectReason: {
    margin: '16px 0px',
    fontSize: 16,
    textAlign: 'center',
  },
});

const LOCATION_SEARCH_ADDRESS_FIELDS = [ADDRESS_FIELD.line_1, ADDRESS_FIELD.line_2, ADDRESS_FIELD.city, ADDRESS_FIELD.post_code];

class SchoolRequest extends React.Component {
  state = { expanded: false };

  getDateTimeDisplayValue = value => moment(value).format('D MMM, YYYY h:mm A');

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  handleMapLinkClick = address => () => {
    window.open(encodeURI(`${GOOGLE_MAPS_API_LINK}${address}`), '_blank');
  };

  render() {
    const {
      classes, registrationRequest, rejectReason, showApproveButtons, showEndTrainingPeriodButton, onApproveClick, onRefuseClick, onEndTrainingPeriodClick, rejectedAt,
    } = this.props;

    const { expanded } = this.state;

    const isRejected = rejectReason !== '';

    const address = getAddressDisplayValue(registrationRequest.address, LOCATION_SEARCH_ADDRESS_FIELDS);

    return (
      <div>
        <Card className={classes.root}>
          <CardHeader
            avatar={
              <Avatar alt="School" src={schoolAvatar} classes={{ root: classes.avatar }} />
            }
            action={(
              <IconButton
                className={classnames(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={this.handleExpandClick}
                disableRipple
              >
                <ExpandMore />
              </IconButton>
            )}
            title={registrationRequest.school_name}
            subheader={this.getDateTimeDisplayValue(registrationRequest.created_at)}
            classes={{ subheader: classes.subheader }}
          />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent>
              <Grid container style={{ height: '100%' }} direction="column" justify="space-between">
                <Grid container className={classes.contentContainer}>
                  <Grid item xs={12}>
                    <SchoolRegistrationInfo registrationRequest={registrationRequest} />
                  </Grid>
                  <Grid item xs={12} container justify="center">
                    <Button
                      className={classes.activateMapsButton}
                      onClick={this.handleMapLinkClick(address)}
                      style={{ color: '#00bcd4', paddingLeft: 0, textTransform: 'none' }}
                    >
                      <img
                        src={flagIcon}
                        alt="See on map"
                        style={{ width: 15 }}
                        className={classes.flagIcon}
                      />
                      See on map
                    </Button>
                  </Grid>
                  {isRejected && (
                    <Grid item xs={12}>
                      <CardHeader
                        style={{ padding: 0 }}
                        avatar={
                          <Avatar alt="Reason" src={refuseReasonAvatar} classes={{ root: classes.avatar }} />
                        }
                        title="Refuse reason"
                        subheader={rejectedAt ? `${rejectedAt.format('D MMM, YYYY h:mm A')}` : ''}
                        classes={{ subheader: classes.subheader, title: classes.title }}
                      />
                      <Typography className={classes.rejectReason}>
                        {rejectReason}
                      </Typography>
                    </Grid>
                  )
                }
                </Grid>
                {showApproveButtons && (
                  <Grid item className={classes.buttonsContainer}>
                    <Button className={classes.button} variant="contained" color="primary" onClick={onApproveClick}>
                      Approve
                    </Button>
                    <Button className={classes.button} variant="outlined" color="secondary" onClick={onRefuseClick} style={{ marginRight: 0 }}>
                      Refuse
                    </Button>
                  </Grid>
                )
                }
                {showEndTrainingPeriodButton && (
                  <Grid item className={classes.buttonsContainer}>
                    <Button className={classes.button} variant="contained" color="primary" onClick={onEndTrainingPeriodClick}>
                      End Training Period
                    </Button>
                  </Grid>
                )
                }
              </Grid>
            </CardContent>
          </Collapse>
        </Card>
      </div>
    );
  }
}

SchoolRequest.propTypes = {
  classes: PropTypes.object.isRequired,
  registrationRequest: PropTypes.object.isRequired,
  rejectReason: PropTypes.string,
  rejectedAt: PropTypes.object,
  showApproveButtons: PropTypes.bool,
  showEndTrainingPeriodButton: PropTypes.bool,
  onApproveClick: PropTypes.func,
  onRefuseClick: PropTypes.func,
  onEndTrainingPeriodClick: PropTypes.func,
};

SchoolRequest.defaultProps = {
  showApproveButtons: false,
  showEndTrainingPeriodButton: false,
  rejectReason: '',
  rejectedAt: null,
  onApproveClick: () => {},
  onRefuseClick: () => {},
  onEndTrainingPeriodClick: () => {},
};

export default compose(
  withRouter,
  withStyles(styles),
)(SchoolRequest);
