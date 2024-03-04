import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { ValidatorForm } from 'react-material-ui-form-validator';
import { extraValidators } from '../../utils/extraFormValidators';

import YesNoRadioGroup from '../dialogs/formControls/YesNoRadioGroup';

import {
  MAX_SIGNED_LOA_FILE_SIZE_BYTES,
  QUESTIONNAIRE_INTEREST,
  SIGNED_LOA,
} from './constants';

import { FILE_TYPE } from '../../constants/config';

const styles = theme => ({
  root: {
    padding: '0px 50px 25px',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  titleBlock: {
    paddingTop: theme.spacing(3),
  },
  titlePrimaryText: {
    fontSize: 21,
    fontWeight: 500,
  },
  titleSecondaryText: {
    fontSize: 16,
    fontWeight: 500,
  },
  interestsListRoot: {
    listStyleType: 'decimal',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  interestsListItem: {
    display: 'list-item',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(0.5),
      paddingRight: 0,
    },
  },
  signActionsContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 2),
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  signActionsButton: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  navigationContainer: {
    marginTop: theme.spacing(5),
    justifyContent: 'flex-end',
    paddingRight: 16,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(3),
    },
  },
  uploadFileContainer: {
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  submitButton: {
    fontSize: 16,
  },
  signInstructionsContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 2),
  },
  signInstructionsText: {
    fontSize: 16,
  },
});

const QUESTIONNAIRE_INTERESTS = [
  {
    label: (
      <span>
        Has your school undertaken an “energy audit”? <i>(a benchmarking of energy consumption and recommendations about how your school can expect to make substantial savings on energy bills)</i>
      </span>
    ),
    stateProp: 'takenEnergyAudit',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.had_energy_audit,
  },
  {
    label: (
      <span>
        Would the school be willing to have a high quality audit done on your school? <i>(At not cost to the school)</i>
      </span>
    ),
    stateProp: 'willingAudit',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.want_energy_audit,
  },
  {
    label: (
      <span>
        Would your school be willing, in principle, to deliver lessons/class projects at KS2/3 level based on the materials generated as part of this project?
      </span>
    ),
    stateProp: 'willingDeliverLessons',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.want_use_lessons_materials,
  },
  {
    label: (
      <span>
        Would the school be willing to allow energy monitoring equipment to be installed at your school?
      </span>
    ),
    stateProp: 'willingEnergyEquipmentInstallation',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.want_install_energy_monitoring,
  },
  {
    label: (
      <span>Would your school be willing to allow teachers, pupils and administrative staff including site managers to
        participate in short workshops and interviews covering energy management issues, the use of the EiS lesson
        plans and the use of the Energy in Schools platform tools?
      </span>
    ),
    stateProp: 'willingParticipateWorkshops',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.want_participate_energy_management_interview,
  },
  {
    label: (
      <span>
        Would you be willing to allow a third part authority access to the Smart DCC Data?
      </span>
    ),
    stateProp: 'willingAccessToSmartData',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.allow_smart_dcc_data_access_to_third_party,
  },
  {
    label: (
      <span>
        Are you happy to use an artificial bench mark for your first year?
      </span>
    ),
    stateProp: 'happyToUseBenchmark',
    initValue: null,
    regProp: QUESTIONNAIRE_INTEREST.use_artificial_benchmark_for_first_year,
  },
  {
    label: (
      <span>Would you be prepared to sign a Letter of Authority (LOA) enabling Energy in Schools to request information and
        prices from suppliers on your behalf. This does not enable Energy in Schools to contract on your behalf.
      </span>
    ),
    stateProp: 'preparedSignAuthority',
    initValue: null,
    regProp: null,
  },
];

const INITIAL_STATE = {
  ...QUESTIONNAIRE_INTERESTS.reduce((res, item) => {
    res[item.stateProp] = item.initValue;
    return res;
  }, {}),
  uploadedLOA: null,
};

const ALLOWED_FILE_TYPES = [FILE_TYPE.pdf];

class QuestionnairePage extends React.Component {
  state = INITIAL_STATE;

  registrationForm = null;

  uploadFileInputRef = React.createRef();

  componentDidMount() {
    ValidatorForm.addValidationRule(
      'fileSizeMax',
      value => extraValidators.fileSizeMax(value, MAX_SIGNED_LOA_FILE_SIZE_BYTES),
    );
    ValidatorForm.addValidationRule(
      'allowedFileTypes',
      value => extraValidators.allowedFileTypes(value, ALLOWED_FILE_TYPES.map(type => type.type)),
    );
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { uploadedLOA } = this.state;
    const regData = {
      ...QUESTIONNAIRE_INTERESTS.reduce((res, item) => {
        if (!isNil(item.regProp)) {
          res[item.regProp] = this.state[item.stateProp]; // eslint-disable-line react/destructuring-assignment
        }
        return res;
      }, {}),
      [SIGNED_LOA]: uploadedLOA,
    };
    onSubmit(regData);
  };

  onSubmitClick = () => {
    this.registrationForm.submit();
  };

  handleChange = propName => (value) => {
    this.setState({ [propName]: value });
  };

  showUploadFileDialog = () => {
    const fileInput = this.uploadFileInputRef.current.querySelector('[type="file"]');
    if (fileInput) {
      fileInput.click();
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.titleBlock}>
          <Typography className={classes.titlePrimaryText}>
            We need some additional School details:
          </Typography>
          <Typography className={classes.titleSecondaryText}>
            (note there is no financial cost to the school for participation; as well as receiving free, high quality,
            monitoring and teaching equipment, schools can expect to make substantial savings on their energy bills)
          </Typography>
        </div>
        <ValidatorForm
          ref={(el) => { this.registrationForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <List component="ol" className={classes.interestsListRoot} dense disablePadding>
            {
              QUESTIONNAIRE_INTERESTS.map((interest) => {
                const { label, stateProp } = interest;
                return (
                  <ListItem key={stateProp} className={classes.interestsListItem}>
                    <YesNoRadioGroup
                      value={this.state[stateProp]} // eslint-disable-line react/destructuring-assignment
                      groupLabel={label}
                      labelStyle={
                        {
                          color: 'rgb(0, 0, 0, 0.87)',
                        }
                      }
                      name={stateProp}
                      fullWidth
                      onSubmit={this.handleChange(stateProp)}
                      validators={['required']}
                      errorMessages={['This field is required']}
                    />
                  </ListItem>
                );
              })
            }
          </List>
        </ValidatorForm>
        <Grid container className={classes.navigationContainer}>
          <Button onClick={this.onSubmitClick} color="primary" className={classes.submitButton}>
            Submit
          </Button>
        </Grid>
      </div>
    );
  }
}

QuestionnairePage.propTypes = {
  classes: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...{},
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(QuestionnairePage);
