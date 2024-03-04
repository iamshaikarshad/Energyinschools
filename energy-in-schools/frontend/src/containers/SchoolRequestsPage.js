import React from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SvgIcon from '@material-ui/core/SvgIcon';
import Flag from '@material-ui/icons/Flag';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';

import TokenManager from '../utils/tokenManager';
import SchoolRequest from '../components/SchoolRequest';
import ApproveSchoolDialog from '../components/dialogs/ApproveSchoolDialog';
import RefuseSchoolDialog from '../components/dialogs/RefuseSchoolDialog';

import * as schoolsActions from '../actions/schoolsActions';

import { REGISTRATION_REQUEST_STATUS } from '../components/SchoolRegistration/constants';

const ApproveIcon = props => (
  <SvgIcon {...props}>
    <path d="m12,1.19862l-9.64652,3.92738l0,5.89179a12.72005,12.34382 0 0 0 9.64652,11.78358a12.72005,12.34382 0 0 0 9.64652,-11.78358l0,-5.89179l-9.64652,-3.92738zm-2.14301,15.71097l-4.28751,-3.92738l1.51079,-1.38546l2.77671,2.53472l7.06274,-6.47075l1.51079,1.3941l-8.57353,7.85476z" />
  </SvgIcon>
);

const RefuseIcon = props => (
  <SvgIcon {...props}>
    <path d="m12,2.00813a9.99187,9.99187 0 1 0 9.99187,9.99187a9.99187,9.99187 0 0 0 -9.99187,-9.99187zm4.99594,10.99106l-9.99187,0l0,-1.99837l9.99187,0l0,1.99837z" />
  </SvgIcon>
);

export const REQUEST_STATUS_FILTER_BUTTON_LABEL = Object.freeze({
  [REGISTRATION_REQUEST_STATUS.trial_pending]:
    {
      text: 'Trial pending',
      icon: props => (<Flag {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.training_period]:
    {
      text: 'Training period',
      icon: props => (<ApproveIcon {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.trial_accepted]:
    {
      text: 'Trial accepted',
      icon: props => (<ApproveIcon {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.trial_rejected]:
    {
      text: 'Trial rejected',
      icon: props => (<RefuseIcon {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.activation_pending]:
    {
      text: 'Activation pending',
      icon: props => (<Flag {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.activation_accepted]:
    {
      text: 'Activation accepted',
      icon: props => (<ApproveIcon {...props} />),
    },
  [REGISTRATION_REQUEST_STATUS.activation_rejected]:
    {
      text: 'Activation rejected',
      icon: props => (<RefuseIcon {...props} />),
    },
});

const SCHOOL_REQUEST_COMPONENT_OPTIONS = Object.freeze({
  [REGISTRATION_REQUEST_STATUS.trial_pending]:
    {
      showApproveButtons: true,
      showEndTrainingPeriodButton: false,
      rejectReason: {
        show: false,
      },
    },
  [REGISTRATION_REQUEST_STATUS.training_period]:
    {
      showEndTrainingPeriodButton: true,
      showApproveButtons: false,
      rejectReason: {
        show: false,
      },
    },
  [REGISTRATION_REQUEST_STATUS.trial_accepted]:
    {
      showEndTrainingPeriodButton: false,
      showApproveButtons: false,
      rejectReason: {
        show: false,
      },
    },
  [REGISTRATION_REQUEST_STATUS.trial_rejected]:
    {
      showApproveButtons: false,
      showEndTrainingPeriodButton: false,
      rejectReason: {
        show: true,
        key: 'registration_reject_reason',
      },
    },
  [REGISTRATION_REQUEST_STATUS.activation_pending]:
    {
      showApproveButtons: true,
      showEndTrainingPeriodButton: false,
      rejectReason: {
        show: false,
      },
    },
  [REGISTRATION_REQUEST_STATUS.activation_accepted]:
    {
      showApproveButtons: false,
      showEndTrainingPeriodButton: false,
      rejectReason: {
        show: false,
      },
    },
  [REGISTRATION_REQUEST_STATUS.activation_rejected]:
    {
      showApproveButtons: false,
      showEndTrainingPeriodButton: false,
      rejectReason: {
        show: true,
        key: 'activation_reject_reason',
      },
    },
});

const SORT_VALUE = Object.freeze({
  date_asc: 'date_asc',
  date_desc: 'date_desc',
});

const SORT_TYPES = [
  {
    value: SORT_VALUE.date_asc,
    label: 'Date asc',
  },
  {
    value: SORT_VALUE.date_desc,
    label: 'Date desc',
  },
];

const SORT_CALLBACK = Object.freeze({
  [SORT_VALUE.date_asc]: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
  [SORT_VALUE.date_desc]: (a, b) => moment(b.created_at).unix() - moment(a.created_at).unix(),
});

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      paddingTop: 0,
    },
  },
  tabsFlexContainer: {
    [theme.breakpoints.up('xl')]: {
      justifyContent: 'space-around',
    },
  },
  tabRoot: {
    width: 260,
    flexShrink: 0,
    paddingtop: 0,
  },
  tabIcon: {
    position: 'relative',
    top: theme.spacing(1),
  },
  contentContainer: {
    padding: '30px 100px',
    [theme.breakpoints.down('sm')]: {
      padding: '0px 25px',
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  formControl: {
    marginTop: theme.spacing(1),
    minWidth: 120,
  },
  filterContainer: {
    textAlign: 'right',
  },
});

class SchoolRequestsPage extends React.Component {
  state = {
    selectedTab: 0,
    approveDialogOpened: false,
    refuseDialogOpened: false,
    dialogData: {
      schoolId: 0,
      schoolName: '',
    },
    selectedSortType: SORT_TYPES[0].value,
  };

  componentDidMount() {
    const { actions } = this.props;
    const userID = TokenManager.getUserId();
    if (userID && userID !== '') {
      actions.getSchoolRegistrationRequests();
    }
  }

  getSortedSchools = (schools, sortType) => {
    const sortCallback = SORT_CALLBACK[sortType];
    if (!sortCallback) return schools;
    return [...schools].sort(sortCallback);
  };

  handleChangeSortType = (e) => {
    this.setState({ selectedSortType: e.target.value });
  };

  handleTabChange = (event, selectedTab) => {
    this.setState({ selectedTab });
  };

  toggleDialog = (dialogStateKey) => {
    this.setState(prevState => ({ [dialogStateKey]: !prevState[dialogStateKey] }));
  };

  openApproveDialog = (schoolId, schoolName) => {
    this.toggleDialog('approveDialogOpened');
    this.setState({
      dialogData: {
        schoolId,
        schoolName,
      },
    });
  };

  approveDialogSubmit = (schoolId, status) => {
    const { actions } = this.props;
    actions.approveSchoolRequest(schoolId, status)
      .then(() => {
        actions.getSchoolRegistrationRequests();
        this.toggleDialog('approveDialogOpened');
      });
  };

  openRefuseDialog = (schoolId, schoolName) => {
    this.toggleDialog('refuseDialogOpened');
    this.setState({
      dialogData: {
        schoolId,
        schoolName,
      },
    });
  };

  refuseDialogSubmit = status => (schoolId, reason) => {
    const { actions } = this.props;
    actions.refuseSchoolRequest(schoolId, reason, status)
      .then(() => {
        actions.getSchoolRegistrationRequests();
        this.toggleDialog('refuseDialogOpened');
      });
  };

  render() {
    const { classes, schools } = this.props;
    const {
      selectedTab, approveDialogOpened, refuseDialogOpened, dialogData, selectedSortType,
    } = this.state;
    const registrationRequestStatuses = Object.values(REGISTRATION_REQUEST_STATUS);

    const currentStatus = registrationRequestStatuses[selectedTab];

    const sortedSchools = this.getSortedSchools(schools[currentStatus], selectedSortType);

    return (
      <div style={{ width: '100%' }}>
        <Paper className={classes.root} elevation={2}>
          <Tabs
            classes={{ flexContainer: classes.tabsFlexContainer }}
            value={selectedTab}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            {
              registrationRequestStatuses.map(status => (
                <Tab
                  key={status}
                  classes={{ root: classes.tabRoot }}
                  label={(
                    <span>
                      {REQUEST_STATUS_FILTER_BUTTON_LABEL[status].icon({ className: classes.tabIcon })}
                      {REQUEST_STATUS_FILTER_BUTTON_LABEL[status].text}
                      {schools[status].length ? ` (${schools[status].length})` : ''}
                    </span>
                  )}
                />
              ))
            }
          </Tabs>
        </Paper>
        <div className={classes.contentContainer}>
          {sortedSchools.length > 0 && (
            <div className={classes.filterContainer}>
              <FormControl className={classes.formControl}>
                <InputLabel shrink htmlFor="sort-label-placeholder">
                  Sort by
                </InputLabel>
                <Select
                  value={selectedSortType}
                  onChange={this.handleChangeSortType}
                  input={<Input name="Sort by" id="sort-label-placeholder" />}
                  name="Sort by"
                  className={classes.selectEmpty}
                > {
                  SORT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))
                }
                </Select>
              </FormControl>
            </div>
          )}
          {
            sortedSchools.map((school) => {
              const showApproveButtons = SCHOOL_REQUEST_COMPONENT_OPTIONS[currentStatus].showApproveButtons;
              const showEndTrainingPeriodButton = SCHOOL_REQUEST_COMPONENT_OPTIONS[currentStatus].showEndTrainingPeriodButton;
              const rejectReasonOpt = SCHOOL_REQUEST_COMPONENT_OPTIONS[currentStatus].rejectReason;
              return (
                <SchoolRequest
                  key={`${school.id}`}
                  registrationRequest={school}
                  showApproveButtons={showApproveButtons}
                  showEndTrainingPeriodButton={showEndTrainingPeriodButton}
                  onApproveClick={() => this.openApproveDialog(school.id, school.school_name)}
                  onEndTrainingPeriodClick={() => this.openApproveDialog(school.id, school.school_name)}
                  onRefuseClick={() => this.openRefuseDialog(school.id, school.school_name)}
                  rejectReason={rejectReasonOpt.show ? school[rejectReasonOpt.key] : ''}
                  rejectedAt={rejectReasonOpt.show ? moment(school.updated_at) : null}
                />
              );
            })
          }
        </div>

        <ApproveSchoolDialog
          isOpened={approveDialogOpened}
          schoolName={dialogData.schoolName}
          onSubmit={() => this.approveDialogSubmit(dialogData.schoolId, currentStatus)}
          onClose={() => this.toggleDialog('approveDialogOpened')}
        />

        <RefuseSchoolDialog
          isOpened={refuseDialogOpened}
          schoolId={dialogData.schoolId}
          schoolName={dialogData.schoolName}
          onSubmit={this.refuseDialogSubmit(currentStatus)}
          onClose={() => this.toggleDialog('refuseDialogOpened')}
        />
      </div>
    );
  }
}

SchoolRequestsPage.propTypes = {
  schools: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(schoolsActions, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    schools: state.schools.requests,
  };
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(SchoolRequestsPage);
