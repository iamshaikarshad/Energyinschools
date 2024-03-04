import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles/index';
import RootDialog from './RootDialog';

import {
  MAX_TEXT_LENGTH,
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
    width: 500,
  },
  ...FEEDBACK_DIALOG_STYLE,
});

class NewEditCommentDialog extends React.Component {
  state = {
    text: '',
  };

  editCommentForm = null;

  componentWillReceiveProps(nextProps) {
    if (nextProps.editedComment && this.props !== nextProps) {
      this.setState({
        text: nextProps.editedComment.content,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { text } = this.state;

    onSubmit(text);
  }

  setFocusOnElem = (elem) => {
    if (elem) {
      setTimeout(() => { elem.focus(); }, 100);
    }
  }

  clearCommentText = () => {
    this.setState({ text: '' }, () => {
      this.setFocusOnElem(this.commentsInput);
    });
  }

  render() {
    const {
      classes, isOpened, onClose, title, textBoxLabel,
    } = this.props;
    const { text } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.editCommentForm.submit()}
        submitLabel="Save"
      >
        <ValidatorForm
          ref={(el) => { this.editCommentForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            inputRef={(input) => {
              this.commentsInput = input;
            }}
            multiline
            rows={FEEDBACK_TEXT_BOX.rowsMax}
            rowsMax={FEEDBACK_TEXT_BOX.rowsMax}
            fullWidth
            label={textBoxLabel}
            margin="dense"
            onChange={e => this.setState({ text: e.target.value })}
            name="text"
            value={text}
            validators={['required', `maxStringLength:${MAX_TEXT_LENGTH}`]}
            helperText={`Maximum number of symbols: ${MAX_TEXT_LENGTH}`}
            errorMessages={['Text is required', 'Max number of symbols has been exceeded']}
            InputLabelProps={{ classes: { root: classes.textInputLabel } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelper } }}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewEditCommentDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editedComment: PropTypes.object,
  title: PropTypes.string,
  textBoxLabel: PropTypes.string,
};

NewEditCommentDialog.defaultProps = {
  editedComment: null,
  title: 'Create comment',
  textBoxLabel: 'Leave a comment',
};

export default compose(withStyles(styles))(NewEditCommentDialog);
