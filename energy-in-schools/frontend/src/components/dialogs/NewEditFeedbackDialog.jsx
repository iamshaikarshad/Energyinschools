import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import { withStyles } from '@material-ui/core/styles/index';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

import RootDialog from './RootDialog';
import CheckBoxGroupValidator from './formControls/CheckBoxGroupValidator';

import {
  FEEDBACK_TAGS,
  FEEDBACK_TYPES,
  FEEDBACK_DIALOG_STYLE,
  FEEDBACK_TEXT_BOX,
} from '../Feedback/constants';

const styles = theme => ({
  rootPaper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 24,
      marginRight: 24,
    },
  },
  dialogContent: {
    maxWidth: 500,
    paddingTop: 20,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 15,
    },
  },
  radioInputLabelRoot: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  radioInputLabel: {
    fontSize: 12,
    color: '#555555',
  },
  ...FEEDBACK_DIALOG_STYLE,
});

const DEFAULT_MARGIN = 16;

const getCheckedTags = (checkedTags, allTags) => allTags.map(tag => ({
  label: tag.label,
  value: tag.name,
  checked: checkedTags.includes(tag.name),
}));

const getInitTagsState = tags => tags.map(tag => ({
  label: tag.label,
  value: tag.name,
  checked: false,
}));

const MAX_TEXT_LENGTH = 450;

class NewEditFeedbackDialog extends React.Component {
  state = {
    type: FEEDBACK_TYPES[0].type,
    text: '',
    tags: getInitTagsState(FEEDBACK_TAGS),
  };

  createFeedbackForm = null;

  componentDidMount() {
    ValidatorForm.addValidationRule('atLeastOneChecked', values => values.some(value => value.checked));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editedFeedback && this.props !== nextProps) {
      this.setState({
        text: nextProps.editedFeedback.content,
        type: nextProps.editedFeedback.type,
        tags: getCheckedTags(nextProps.editedFeedback.tags, FEEDBACK_TAGS),
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { type, text, tags } = this.state;

    const resultTags = tags.filter(tag => tag.checked).map(tag => tag.value);
    onSubmit(type, text, resultTags);
  }

  onTagsChange = (changedTag) => {
    const { tags } = this.state;
    const copy = JSON.parse(JSON.stringify(tags));
    const newValue = copy.map((tag) => {
      if (tag.value === changedTag.value) {
        // eslint-disable-next-line no-param-reassign
        tag.checked = !tag.checked;
      }
      return tag;
    });
    this.setState({ tags: newValue });
  }

  getFeedbackTypes = () => {
    const { classes } = this.props;
    return FEEDBACK_TYPES.map(typeData => (
      <FormControlLabel
        key={typeData.type}
        value={typeData.type}
        control={<Radio color="primary" />}
        label={typeData.label}
        classes={{ label: classes.radioInputLabel }}
      />
    ));
  }

  render() {
    const {
      classes,
      isOpened,
      onClose,
      width,
      title,
      textBoxLabel,
      submitButtonName,
    } = this.props;

    const { type, text, tags } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.createFeedbackForm.submit()}
        submitLabel={submitButtonName}
      >
        <ValidatorForm
          ref={(el) => { this.createFeedbackForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <FormLabel classes={{ root: classes.radioInputLabelRoot }}>
            Select item type
          </FormLabel>
          <RadioGroup
            row={isWidthUp('sm', width)}
            aria-label="type"
            name="type"
            value={type}
            onChange={e => this.setState({ type: e.target.value })}
            style={{ justifyContent: 'space-around' }}
          >
            {this.getFeedbackTypes()}
          </RadioGroup>
          <TextValidator
            multiline
            rows={FEEDBACK_TEXT_BOX.rows}
            rowsMax={FEEDBACK_TEXT_BOX.rowsMax}
            fullWidth
            label={textBoxLabel}
            margin="dense"
            onChange={e => this.setState({ text: e.target.value })}
            name="text"
            value={text}
            validators={['required', `maxStringLength:${MAX_TEXT_LENGTH}`]}
            helperText={`Maximum number of symbols: ${MAX_TEXT_LENGTH}`}
            errorMessages={['This field is required', 'Max number of symbols has been exceeded']}
            InputLabelProps={{ classes: { root: classes.textInputLabel } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelper } }}
          />
          <FormLabel component="legend" classes={{ root: classes.radioInputLabelRoot }}>Select tags</FormLabel>
          <CheckBoxGroupValidator
            validators={['atLeastOneChecked']}
            errorMessages={['At least one tag should be checked']}
            name="tags"
            value={tags}
            onChange={tag => this.onTagsChange(tag)}
            formGroupStyle={{ justifyContent: 'flex-start' }}
            controlLabelStyle={{
              width: isWidthUp('sm', width) ? `calc(50% - ${DEFAULT_MARGIN}px)` : '100%',
              marginRight: DEFAULT_MARGIN,
            }}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewEditFeedbackDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  width: PropTypes.string.isRequired,
  editedFeedback: PropTypes.object,
  textBoxLabel: PropTypes.string,
  title: PropTypes.string,
  submitButtonName: PropTypes.string,
};

NewEditFeedbackDialog.defaultProps = {
  editedFeedback: null,
  title: 'New item',
  textBoxLabel: 'Write your feedback here',
  submitButtonName: 'Create',
};

export default compose(
  withStyles(styles),
  withWidth(),
)(NewEditFeedbackDialog);
