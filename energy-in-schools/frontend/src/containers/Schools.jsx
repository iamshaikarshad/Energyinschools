import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import * as dialogActions from '../actions/dialogActions';
import * as schoolsActions from '../actions/schoolsActions';

import School from '../components/School';
import SLEAdminHeader from '../components/SLEAdminHeader';
import NoItems from '../components/NoItems';

import getAddressDisplayValue from '../utils/getAddressDisplayValue';

import { ADDRESS_FIELD } from '../components/SchoolRegistration/constants';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  rootContentWrapper: {
    padding: 30,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  adminHeaderWrapper: {
    [theme.breakpoints.down('xs')]: {
      padding: '0 !important',
    },
  },
  sortSelectContainer: {
    padding: 0,
    paddingRight: 12,
    [theme.breakpoints.down('xs')]: {
      marginTop: 5,
    },
  },
  schoolsCardsContainer: {
    paddingTop: '0px !important',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
    },
  },
});

const LOCATION_SORTING_RULES = Object.freeze({
  by_name: {
    label: 'name',
    sortingKey: location => location.name.toLowerCase(),
    order: 'asc',
  },
  by_cashback: {
    label: 'off-peaky points value',
    sortingKey: 'cashback',
    order: 'desc',
  },
  by_always_on: {
    label: 'always-on value',
    sortingKey: 'always_on',
    order: 'asc',
  },
});

const ADDRESS_FIELDS_TO_DISPLAY = [ADDRESS_FIELD.line_1, ADDRESS_FIELD.line_2, ADDRESS_FIELD.city, ADDRESS_FIELD.post_code];

class Schools extends React.Component {
  state = {
    sortingOrderRule: 'by_name',
  };

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    this.getSchoolsData();
  }

  getSchoolsData = () => {
    const { actions } = this.props;
    actions.getAllSchools().then(() => {
      actions.getSchoolsCashback();
      actions.getSchoolsAlwaysOn();
    });
  };

  getSortedLocations = () => {
    const { sortingOrderRule } = this.state;
    const { allLocations, schoolsAlwaysOn, schoolsCashback } = this.props;
    const locationsCopy = JSON.parse(JSON.stringify(allLocations.data));
    const extendedLocations = locationsCopy.map((location) => {
      /* eslint-disable no-param-reassign */
      const locationCashback = schoolsCashback.find(value => value.location_uid === location.uid);
      const locationAlwaysOn = schoolsAlwaysOn.find(value => value.location_uid === location.uid);
      location.cashback = locationCashback ? locationCashback.cashback.current : undefined;
      location.always_on = locationAlwaysOn ? locationAlwaysOn.always_on_energy.value / 1000 : undefined;
      return location;
    });
    return orderBy(
      extendedLocations,
      [LOCATION_SORTING_RULES[sortingOrderRule].sortingKey],
      [LOCATION_SORTING_RULES[sortingOrderRule].order],
    );
  };

  render() {
    const {
      classes, actions, mainSchool,
    } = this.props;

    const { sortingOrderRule } = this.state;
    const sortedLocations = this.getSortedLocations();

    return (
      <div className={classes.root}>
        <Grid container className={classes.rootContentWrapper} alignItems="center" justify="center">
          <Grid item container xs={12} md={10} spacing={3}>
            <Grid item xs={12} sm={10} className={classes.adminHeaderWrapper}>
              {mainSchool.name && (
                <SLEAdminHeader
                  title={mainSchool.name}
                  schoolID={mainSchool.uid}
                  onRefreshClick={this.getSchoolsData}
                />
              )}
            </Grid>
            <Grid item container justify="flex-end" xs={12} className={classes.sortSelectContainer}>
              <FormControl className={classes.formControl}>
                <InputLabel>Sort locations by</InputLabel>
                <Select
                  style={{ width: 150 }}
                  value={sortingOrderRule}
                  onChange={event => this.setState({ sortingOrderRule: event.target.value })}
                >
                  {Object.keys(LOCATION_SORTING_RULES).map(rule => (
                    <MenuItem key={rule} value={rule}>
                      {LOCATION_SORTING_RULES[rule].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} className={classes.schoolsCardsContainer}>
              {
                sortedLocations.length > 0 ? (
                  sortedLocations.map((school) => {
                    if (school.is_sub_location) return null;
                    return (
                      <div key={school.id}>
                        <School
                          name={school.name}
                          id={school.uid}
                          description={school.description || ''}
                          address={getAddressDisplayValue(school.address, ADDRESS_FIELDS_TO_DISPLAY)}
                          alwaysOnValue={school.always_on}
                          cashbackValue={school.cashback}
                          createdAt={moment(school.created_at)}
                          showMessageBar={actions.showMessageSnackbar}
                        />
                      </div>
                    );
                  })
                ) : (
                  <NoItems />
                )
              }
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Schools.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  allLocations: PropTypes.object.isRequired,
  mainSchool: PropTypes.object.isRequired,
  schoolsCashback: PropTypes.array.isRequired,
  schoolsAlwaysOn: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...schoolsActions,
      ...dialogActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    user: state.users.currentUser,
    mainSchool: state.schools.activeSchool,
    allLocations: state.schools.allLocations,
    schoolsCashback: state.schools.schoolsCashback,
    schoolsAlwaysOn: state.schools.schoolsAlwaysOn,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Schools);
