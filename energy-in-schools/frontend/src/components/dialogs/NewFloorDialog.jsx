import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { without, isEqual } from 'lodash';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import DeleteOutlined from '@material-ui/icons/DeleteOutlined';

import RootDialog from './RootDialog';

import { getBuildingFromBase64, getFloorName } from '../FloorsMaps/utils';

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

const FLOOR_MIN = -1;
const FLOOR_MAX = 99;
class NewFloorDialog extends React.Component {
  state = {
    floorNumber: 0,
    buildings: [],
  };

  createFloorForm = null;

  floorsPositiveNumbersArr = Array.from({ length: FLOOR_MAX + 1 }, (item, index) => index);

  componentDidMount() {
    ValidatorForm.addValidationRule('min', value => value >= FLOOR_MIN);
    ValidatorForm.addValidationRule('max', value => value <= FLOOR_MAX);
  }

  componentWillReceiveProps(nextProps) {
    const { files } = nextProps;
    const { buildings } = this.state;
    const { existingFloors } = this.props;
    const base64Results = [];

    if (!existingFloors.length && !nextProps.existingFloors.length && !buildings.length) {
      if (files.length) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          base64Results.push(getBuildingFromBase64(file));
        }
        Promise
          .all(base64Results)
          .then((result) => { this.setState({ buildings: [...buildings, ...result] }); });
      } else return;
    }
    const currExistingFloors = existingFloors.slice().sort();
    const nextExistingFloors = nextProps.existingFloors.slice().sort();
    if (!isEqual(currExistingFloors, nextExistingFloors)) {
      this.setStartFloor(nextExistingFloors);
    }
  }

  onFormSubmit = () => {
    const { onSubmit, disableFloorSelect, selectedFloor } = this.props;
    const { floorNumber, buildings } = this.state;
    const floor = disableFloorSelect ? selectedFloor : floorNumber;

    onSubmit(Number(floor), buildings);
    this.setState({ buildings: [] });
  };

  onClose = () => {
    const { onClose } = this.props;
    this.setState({ buildings: [] });
    onClose();
  }

  setStartFloor = (existingFloors) => {
    const availableFloors = without(this.floorsPositiveNumbersArr, ...existingFloors);
    const startFloor = availableFloors.length ? Math.min(...availableFloors) : 0;
    this.setState({ floorNumber: startFloor });
  }

  removeBuilding = (index) => {
    const { buildings } = this.state;
    buildings.splice(index, 1);
    this.setState({ buildings });
  }

  floorExists = (floor) => {
    const { existingFloors } = this.props;
    if (!floor) return false;
    return existingFloors.includes(Number(floor));
  };

  handleInput = (e) => {
    const { floorNumber } = this.state;
    const ALLOWED_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];
    const val = e.target.value + e.key;
    // Need global isNaN for IE compatibility
    if (!ALLOWED_KEYS.includes(e.key) || (Boolean(floorNumber) && isNaN(val))) { // eslint-disable-line no-restricted-globals
      e.preventDefault();
    }
  };

  clearEventFiles = (event) => {
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'text';
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'file';
  }

  uploadFiles = (event) => {
    const { buildings } = this.state;
    const uploadedFiles = event.target.files;
    const base64Results = [];

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
      disableFloorSelect,
      selectedFloor,
      actionButtonName,
    } = this.props;
    const { floorNumber, buildings } = this.state;
    const floorName = getFloorName(floorNumber);

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={this.onClose}
        title={title}
        onSubmit={() => this.createFloorForm.submit()}
        submitLabel={actionButtonName}
        onEntered={this.onEntered}
      >
        <ValidatorForm
          ref={(el) => { this.createFloorForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            autoComplete="off"
            type="number"
            fullWidth
            label="Floor number"
            margin="dense"
            onChange={event => this.setState({ floorNumber: event.target.value })}
            name="floorNumber"
            disabled={disableFloorSelect}
            value={disableFloorSelect ? selectedFloor : floorNumber}
            validators={['required', 'min', 'max']}
            onKeyPress={this.handleInput}
            onPaste={(e) => { e.preventDefault(); }}
            FormHelperTextProps={{ classes: { root: classes.helperTextRoot } }}
            helperText={this.floorExists(floorNumber)
              ? `Selected floor already exists! If you continue then ${floorName.toLowerCase()} plan will be updated!`
              : ''
            }
            errorMessages={[
              'This field is required',
              `Floor number should be greater or equal to ${FLOOR_MIN}`,
              `Floor number should be less or equal to ${FLOOR_MAX}`,
            ]}
          />
          <TextValidator
            type="text"
            fullWidth
            label="Floor name"
            margin="dense"
            name="floorName"
            disabled
            value={floorName}
          />
          {buildings.length ? buildings.map((building, index) => (
            <Grid container direction="row" key={`building_name_${building.name}`}>
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

NewFloorDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  disableFloorSelect: PropTypes.bool,
  selectedFloor: PropTypes.number,
  files: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  title: PropTypes.string,
  actionButtonName: PropTypes.string,
  existingFloors: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

NewFloorDialog.defaultProps = {
  disableFloorSelect: false,
  selectedFloor: 1,
  title: '',
  files: [],
  actionButtonName: 'Create',
  existingFloors: [],
};

export default compose(withStyles(styles))(NewFloorDialog);
