import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import DeleteOutlined from '@material-ui/icons/DeleteOutlined';

import RootDialog from './RootDialog';

import { getBuildingFromBase64 } from '../FloorsMaps/utils';

const styles = theme => ({
  rootPaper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 24,
      marginRight: 24,
    },
  },
  dialogContent: {
    width: 500,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 300,
      padding: 10,
    },
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '28px auto',
    textAlign: 'center',
  },
  uploadButtonContainer: {
    marginTop: 12,
  },
  uploadButton: {
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0px 1px 0px 1px rgba(0,0,0,0.2), 0px 1px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)',
    borderRadius: 2,
    padding: '0px 8px',
    textTransform: 'none',
    fontWeight: 400,
    fontSize: 16,
    border: '1px outset rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(224, 224, 224, 0.7)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  uploadErrorText: {
    fontSize: 12,
  },
  helperTextRoot: {
    color: 'rgb(255, 129, 42)',
  },
  hint: {
    fontSize: 14,
    padding: 8,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
      paddingLeft: 0,
    },
  },
  removeButton: {
    alignSelf: 'end',
    justify: 'flex-end',
  },
});

class NewAreaDialog extends React.Component {
  state = {
    buildings: [],
  };

  createAreaForm = null;

  componentDidMount() {
    ValidatorForm.addValidationRule('minStringLength', value => value >= 3);
    ValidatorForm.addValidationRule('maxStringLength', value => value <= 20);
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { buildings } = this.state;

    onSubmit(buildings);
    this.setState({ buildings: [] });
  };

  onClose = () => {
    const { onClose } = this.props;
    this.setState({ buildings: [] });
    onClose();
  }

  removeBuilding = (index) => {
    const { buildings } = this.state;
    buildings.splice(index, 1);
    this.setState({ buildings });
  }

  clearEventFiles = (event) => {
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'text';
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'file';
  }

  uploadFiles = (event) => {
    const { buildings } = this.state;
    const base64Results = [];
    const uploadedFiles = event.target.files;

    this.clearEventFiles(event);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      base64Results.push(getBuildingFromBase64(file));
    }
    Promise
      .all(base64Results)
      .then((result) => {
        this.setState({ buildings: [...buildings, ...result] });
      });
  }

  render() {
    const {
      classes,
      isOpened,
      title,
      actionButtonName,
    } = this.props;
    const { buildings } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={this.onClose}
        title={title}
        onSubmit={() => this.createAreaForm.submit()}
        submitLabel={actionButtonName}
        onEntered={this.onEntered}
      >
        <ValidatorForm
          ref={(el) => { this.createAreaForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          {buildings.length ? buildings.map((building, index) => (
            <Grid container direction="row" key={`building_container_${building.name}`}>
              <Grid item xs={10}>
                <TextValidator
                  type="text"
                  fullWidth
                  onChange={(event) => {
                    buildings[index].name = event.target.value;
                    this.setState(prevState => ({
                      ...prevState,
                      buildings,
                    }));
                  }}
                  label="Building name"
                  margin="dense"
                  name="building"
                  value={building.name}
                />
              </Grid>
              <Grid item xs={2} className={classes.removeButton}>
                <Button onClick={() => this.removeBuilding(index)}>
                  <DeleteOutlined />
                </Button>
              </Grid>
            </Grid>
          )) : null}
          <Grid container>
            <label htmlFor="upload-plans-button">
              <Button variant="contained" component="span" className={classes.uploadButton}>
                Upload Plans
              </Button>
              <input
                accept="image/*"
                className={classes.input}
                style={{ display: 'none' }}
                id="upload-plans-button"
                multiple
                type="file"
                onChange={this.uploadFiles}
              />
            </label>
            <Typography className={classes.hint}>
              All image formats are allowed.
            </Typography>
          </Grid>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewAreaDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.string,
  actionButtonName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

NewAreaDialog.defaultProps = {
  title: '',
  actionButtonName: 'Create',
};

export default compose(withStyles(styles))(NewAreaDialog);
