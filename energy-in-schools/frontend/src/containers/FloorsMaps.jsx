import React, { PureComponent } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Papa from 'papaparse';

import { Rnd } from 'react-rnd';

import {
  Tooltip,
  RootRef,
  Grid,
  MenuItem,
  Button,
  IconButton,
  TextField,
  FormControl,
  Select,
  Typography,
  Avatar,
  withStyles,
} from '@material-ui/core';

import { Edit as EditIcon, Done as DoneIcon } from '@material-ui/icons';
import CloudDownloadRounded from '@material-ui/icons/CloudDownloadRounded';
import CloudUploadRounded from '@material-ui/icons/CloudUploadRounded';
import MapIcon from '@material-ui/icons/Map';
import UnfoldMoreOutlinedIcon from '@material-ui/icons/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@material-ui/icons/UnfoldLessOutlined';

import * as dialogActions from '../actions/dialogActions';
import CsvParser from '../components/FloorsMaps/CsvParser';
import CsvParserDialog from '../components/dialogs/CsvParserDialog';
import LocationMap from '../components/FloorsMaps/LocationMap';
import FloorPlanMeter from '../components/FloorsMaps/FloorPlanMeter';
import MapHistorySlider from '../components/FloorsMaps/MapHistorySlider';
import NewFloorDialog from '../components/dialogs/NewFloorDialog';
import NewAreaDialog from '../components/dialogs/NewAreaDialog';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import EditSensorGroupDialog from '../components/dialogs/EditSensorGroupDialog';
import MultipleSelect from '../components/FloorsMaps/MultipleSelect';
import SensorsChart from '../components/FloorsMaps/SensorsChart';
import {
  DRAGGING_Z_INDEX,
  FLOORS_MAPS_BG_DARK_COLOR,
  FLOORS_MAPS_TEXT_COLOR,
  SELECTED_BUTTON_COLOR,
  FLOORS_MAPS_HISTORY_SLIDER_BG_COLOR,
  METER_UNITS,
  FLOORS_MAPS_BG_COLOR,
  SCROLL_TICK,
  SCROLL_ANIMATION_DURATION,
  SCROLL_ANIMATION_TYPE,
  PANZOOM_IDS,
  HISTORY_STEPS_COUNT,
  DISABLE_RESIZING,
} from '../components/FloorsMaps/constants';

import { SENSOR_TYPE_LABEL } from '../constants/config';

import arrowLeft from '../images/arrow_left.svg';
import arrowRight from '../images/arrow_right.svg';
import floorsIcon from '../images/floors.svg';
import newFloorIcon from '../images/new_floor.svg';
import deleteFloorIcon from '../images/delete_floor.svg';
import editSensorIcon from '../images/edit_sensor.svg';

import { getBuildingFromBase64, getFloorName } from '../components/FloorsMaps/utils';

import microbitRed from '../images/microbit-drawing-red.png';
import microbitBlue from '../images/microbit-drawing-blue.png';
import microbitGreen from '../images/microbit-drawing-green.png';
import microbitYellow from '../images/microbit-drawing-yellow.png';

import DragAndDrop from '../components/FloorsMaps/DragAndDrop';

import isMobileBrowser from '../utils/detectMobileBrowser';
import { WINDOW_RESIZE_DELAY } from '../components/Lessons/constants';


const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
    height: 'auto',
    overflow: 'hidden',
  },
  createButtonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  importButton: {
    width: 'auto',
    borderRadius: 40,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      borderRadius: 0,
    },
  },
  createButton: {
    width: 'auto',
    borderRadius: 40,
    backgroundColor: SELECTED_BUTTON_COLOR,
    padding: '8px 20px 8px 10px',
    height: 42,
    lineHeight: 'normal',
    '&:not(:last-child)': {
      marginRight: 16,
    },
    '&:hover': {
      backgroundColor: SELECTED_BUTTON_COLOR,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      borderRadius: 0,
      '&:not(:last-child)': {
        marginRight: 0,
      },
    },
  },
  createLabel: {
    color: FLOORS_MAPS_TEXT_COLOR,
    fontSize: 12,
    lineHeight: 'normal',
  },
  selectsContainer: {
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    padding: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '4px 0 0 0',
    },
  },
  floorSelectContainer: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: 16,
    },
  },
  selectRoot: {
    fontSize: 14,
    borderRadius: 35,
    padding: '4px 12px 4px 18px',
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    '&::before': {
      borderBottomWidth: 0,
    },
    '&:hover::before': {
      borderBottomWidth: '0 !important',
    },
    '&::after': {
      borderBottomWidth: '0 !important',
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  choiceAvatar: {
    height: 28,
    width: 28,
    fontSize: 18,
  },
  selectFloors: {
    padding: '10px 12px 8px 18px',
    borderRadius: 25,
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  selectAreas: {
    top: 10,
    padding: '10px 12px 8px 18px',
    borderRadius: 25,
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  select: {
    color: FLOORS_MAPS_TEXT_COLOR,
    paddingBottom: 3,
  },
  selectIcon: {
    color: FLOORS_MAPS_TEXT_COLOR,
    right: 12,
  },
  selectMenu: {
    '& .floorsAvatar': {
      display: 'inline-block !important',
    },
    '& .areaAvatar': {
      display: 'inline-block !important',
      borderRadius: 0,
    },
  },
  pageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 2,
  },
  formControlMarginDense: {
    marginBottom: 0,
    marginTop: 0,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 4,
    },
  },
  floorEditIcon: {
    marginRight: 10,
    height: 18,
    width: 25,
  },
  noFloor: {
    color: '#2b2b2b',
    height: '80vh',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  textNoFloor: {
    textAlign: 'center',
  },
  metersContainer: {
    flexWrap: 'nowrap',
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    padding: '27px 16px 8px 16px',
    height: 'auto',
  },
  noResourceContainer: {
    padding: '0px 32px',
  },
  unplacedFolderedMeterWrapper: {
    margin: '2px 5px 0px',
    height: METER_UNITS.height,
    width: METER_UNITS.width,
    position: 'relative',
    flex: `0 0 ${METER_UNITS.width}px`,
  },
  leftArrow: {
    fontSize: 32,
    backgroundColor: FLOORS_MAPS_BG_COLOR,
    fontWeight: 700,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 120,
    position: 'absolute',
    left: 0,
    zIndex: 100,
  },
  rightArrow: {
    fontSize: 32,
    backgroundColor: FLOORS_MAPS_BG_COLOR,
    fontWeight: 900,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 120,
    position: 'absolute',
    right: 0,
    zIndex: 100,
  },
  deleteSensorContainer: {
    width: 11,
    height: 11,
    backgroundColor: '#CD5C5C',
    zIndex: 10,
    margin: '0px 0px 2px 2px',
  },
  deleteSensor: {
    width: 11,
    height: 11,
  },
  editSensorContainer: {
    width: 11,
    height: 11,
    backgroundColor: '#eba117',
    zIndex: 10,
    margin: '0px 0px 2px 2px',
  },
  unfoldSensorContainer: {
    width: 11,
    height: 11,
    backgroundColor: '#93FFD8',
    zIndex: 10,
    margin: '0px 0px 2px 2px',
    transform: 'rotate(90deg)',
  },
  editSensor: {
    width: 11,
    height: 11,
  },
  unplacedFolderLabel: {
    position: 'absolute',
    left: 0,
    top: 0,
    lineHeight: 'normal',
    transform: 'translateY(-100%)',
    color: 'rgb(255, 255, 255)',
    fontWeight: 600,
    fontFamily: 'Roboto-Medium',
    padding: '8px 3px 2px 55px',
    height: 27,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
    borderBottom: '1px groove rgba(255, 255, 255, 0.3)',
  },
  unplacedMetersFolder: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'nowrap',
    flex: '0 0 auto', // need it for IE compatibility
    marginRight: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  noResourceText: {
    color: FLOORS_MAPS_TEXT_COLOR,
    textAlign: 'center',
    padding: '12px 0px',
    fontSize: 24,
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
  historySliderContainer: {
    backgroundColor: FLOORS_MAPS_HISTORY_SLIDER_BG_COLOR,
    padding: '10px 30px 16px 30px',
  },
  manageButton: {
    height: 36,
    padding: '4px 8px 2px',
    margin: 8,
    borderRadius: 10,
    backgroundColor: SELECTED_BUTTON_COLOR,
    color: FLOORS_MAPS_TEXT_COLOR,
    fontSize: 12,
    lineHeight: 'normal',
    '&:hover': {
      backgroundColor: SELECTED_BUTTON_COLOR,
    },
  },
  manageButtonsBlockItem: {
    [theme.breakpoints.up('lg')]: {
      flexWrap: 'nowrap',
    },
  },
  manageButtonsContainer: {
    borderBottom: '1px solid rgba(0, 0, 0, .2)',
    padding: '8px 16px 25px',
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  mapsWrapper: {
    marginRight: 16,
    marginBottom: 20,
  },
  noPhotoContainer: {
    height: '75vh',
  },
  buttonTitleSpan: {
    backgroundColor: SELECTED_BUTTON_COLOR,
    color: 'white',
    borderRadius: 9,
    padding: '3px 6px 3px 6px',
    fontSize: 20,
    fontWeight: 500,
  },
  foldedUnplacedSensors: {
    height: METER_UNITS.height,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rndMeterWrapper: {
    height: METER_UNITS.height,
    width: 180,
    display: 'inline-flex !important',
    flexDirection: 'column',
    alignItems: 'center',
    borderColor: 'rgb(192, 192, 192)',
    padding: '0px 5px',
  },
});

const MIN_DRAG_PIXELS = 3;
const DEFAULT_TOGGLE_OBJECT = { deleteTitle: '', deleteFunction: () => {} };

class FloorsMaps extends PureComponent {
  state = {
    selectedFloor: '',
    selectedBuilding: '',
    floors: [],
    draggedFiles: {},
    selectChartTypesOpen: false,
    selectFilteredGroupOpen: false,
    historyEnabled: false,
    historySelectedTime: null,
    createDialogOpened: false,
    createAreaDialogOpened: false,
    deleteFloorConfirmOpened: false,
    unplacedMetersContainerVisible: true,
    showCsvParserDialog: false,
    showEditSensorGroupDialog: false,
    sensorsToAdd: [],
    newBuildingName: '',
    metersScrollLeft: 0,
    windowResized: false,
    toggle: DEFAULT_TOGGLE_OBJECT,
    selectedTypes: [],
    excludedSensors: [],
    sensorGroupIndex: null,
  };

  metersContainerRef = React.createRef();

  isMobile = isMobileBrowser();

  componentDidMount() {
    if (this.isMobile) {
      this.bindWindowChangeOrientationHandler();
    } else {
      this.bindWindowResizeHandler();
    }
  }

  componentDidUpdate() {
    if (
      this.hasHorizontalScroll(this.metersContainerRef.current)
        && !document.getElementById('arrows-container')
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(prevState => ({ windowResized: !prevState.windowResized }));
    }
  }

  componentWillUnmount() {
    if (this.isMobile) {
      window.removeEventListener('orientationchange', this.windowChangeOrientationHandler);
    } else {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }

  getExistingFloors = () => {
    const { floors } = this.state;
    return floors.map(floor => floor.number);
  };

  setFloorAndBuildings(floorNumber, buildings) {
    const { floors } = this.state;

    floors.push({
      number: floorNumber,
      name: getFloorName(floorNumber),
      unplacedSensors: [],
      buildings,
      historyTimestamps: null,
      lastPlacedSensorId: 0,
    });

    this.setState({
      selectedFloor: floorNumber,
      selectedBuilding: 0,
      floors,
      selectedTypes: [],
      excludedSensors: [],
      newBuildingName: '',
    });
  }

  bindWindowChangeOrientationHandler = () => {
    window.addEventListener('orientationchange', this.windowChangeOrientationHandler);
  };

  bindWindowResizeHandler = () => {
    window.addEventListener('resize', this.windowResizeHandler);
  };

  windowResizeHandler = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.setState(prevState => ({ windowResized: !prevState.windowResized }));
    }, WINDOW_RESIZE_DELAY);
  };

  windowChangeOrientationHandler = () => {
    setTimeout(() => {
      this.setState(prevState => ({ windowResized: !prevState.windowResized }));
    }, WINDOW_RESIZE_DELAY);
  };

  changeFloor = (event) => {
    const targetFloorId = +event.target.value;
    this.setState({
      selectedFloor: targetFloorId,
      selectedTypes: [],
      excludedSensors: [],
      selectedBuilding: 0,
      newBuildingName: '',
    });
  };

  changeBuilding = (event) => {
    const targetBuildingId = +event.target.value;
    this.setState({ selectedBuilding: targetBuildingId });
  }

  deleteFloor = () => {
    const { selectedFloor, floors } = this.state;
    this.toggleConfirmDialog();
    const filteredFloor = floors.filter(floor => floor.number !== selectedFloor);
    this.setState({
      floors: filteredFloor,
      selectedFloor: selectedFloor - 1,
      selectedTypes: [],
      newBuildingName: '',
    });
  };

  floorCreateSubmit = (floor, buildings) => {
    const { floors } = this.state;
    const existedFloors = floors.map(existingFloor => existingFloor.number);
    if (existedFloors.indexOf(Number(floor)) === -1) {
      this.setFloorAndBuildings(floor, buildings);
    }
    this.toggleCreateDialog();
  };

  areaCreateSubmit = (areas) => {
    const { selectedFloor, floors } = this.state;
    let buildingIndexToSet = 0;
    const floorIndex = floors.findIndex(floor => floor.number === selectedFloor);
    if (floors[floorIndex].buildings) {
      floors[floorIndex].buildings.push(...areas);
      buildingIndexToSet = floors[floorIndex].buildings.length - 1;
    } else {
      floors[floorIndex].buildings = areas;
    }
    this.setState({ floors, selectedBuilding: buildingIndexToSet });
    this.toggleCreateAreaDialog();
  }

  showAlert = (alertConfig) => {
    const { actions } = this.props;
    const { header, content } = alertConfig;
    actions.showAlert(header, content);
  }

  showAlertOnPlanFileLoadError = (alertConfig) => {
    this.showAlert(alertConfig);
  }

  toggleCreateDialog = () => {
    this.setState(prevState => ({ createDialogOpened: !prevState.createDialogOpened, draggedFiles: {} }));
  };

  toggleCreateAreaDialog = () => {
    this.setState(prevState => ({ createAreaDialogOpened: !prevState.createAreaDialogOpened }));
  }

  toggleEditSensorGroupDialog = () => {
    this.setState(prevState => ({ showEditSensorGroupDialog: !prevState.showEditSensorGroupDialog }));
  };

  editGroupSensor =(index) => {
    this.setState({ sensorGroupIndex: index });
    this.toggleEditSensorGroupDialog();
  }

  toggleConfirmDialog = (params = null) => {
    if (params === null) {
      this.setState({ deleteFloorConfirmOpened: false, toggle: DEFAULT_TOGGLE_OBJECT });
      return;
    }
    const { deleteTitle, deleteFunction } = params;
    this.setState({
      toggle: { deleteTitle, deleteFunction },
      deleteFloorConfirmOpened: true,
    });
  };


  scrollHorizontal = direction => () => {
    const { metersScrollLeft } = this.state;
    const node = this.metersContainerRef.current;
    let [animationValue, multiplier] = ['0', 0];
    switch (direction) {
      case 'left': animationValue = `-=${SCROLL_TICK}`;
        multiplier = -1;
        break;
      case 'right': animationValue = `+=${SCROLL_TICK}`;
        multiplier = 1;
        break;
      default: return;
    }
    $(node).animate(
      { scrollLeft: animationValue },
      SCROLL_ANIMATION_DURATION * 1.5,
      SCROLL_ANIMATION_TYPE.linear,
      () => {
        this.setState({ metersScrollLeft: metersScrollLeft + (multiplier * SCROLL_TICK) });
      },
    );
  };

  showArrow = (side) => {
    const visible = 'inline-flex';
    const hidden = 'none';
    const node = this.metersContainerRef.current;

    switch (side) {
      case 'left': return node.scrollLeft ? visible : hidden;
      case 'right': return Math.ceil(node.scrollLeft) + node.clientWidth < node.scrollWidth ? visible : hidden;
      default: return hidden;
    }
  };

  importData = (file) => {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      this.setState({ selectedFloor: json[0].number, floors: json, selectedBuilding: 0 });
    };
  }

  downloadFile = async () => {
    const { floors } = this.state;

    const json = JSON.stringify(floors);
    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'school_floors.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleDrop = (files) => {
    const images = [];
    if (files.length === 1 && files[0].type === 'application/json') {
      this.importData(files[0]);
      return;
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.split('/')[0] === 'image') {
        images.push(file);
      }
    }
    if (images.length) {
      this.setState({ createDialogOpened: true, draggedFiles: images });
    }
  }

  handleDropOnFloor = (files) => {
    const { selectedFloor, floors } = this.state;
    const currentFloorIndex = floors.findIndex(floor => floor.number === selectedFloor);
    const base64Results = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.split('/')[0] === 'image') {
        base64Results.push(getBuildingFromBase64(file));
      } else {
        this.showAlertOnPlanFileLoadError();
      }
    }
    Promise
      .all(base64Results)
      .then((result) => {
        const floorsCopy = JSON.parse(JSON.stringify(floors));
        floorsCopy[currentFloorIndex].buildings.push(...result);
        this.setState({ floors: floorsCopy, selectedBuilding: floorsCopy[currentFloorIndex].buildings.length - 1 });
      });
  }

  onDeleteUnplacedSensors = () => {
    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.findIndex(floor => floor.number === selectedFloor);

    if (currentFloor !== -1) {
      floorsCopy[currentFloor].unplacedSensors = floorsCopy[currentFloor].unplacedSensors.filter(sensor => sensor.placedOnMap);
      if (floorsCopy[currentFloor].unplacedSensors.length > 0) {
        floorsCopy[currentFloor].historyTimestamps = this.getHistoryRange(floorsCopy[currentFloor]);
        floorsCopy[currentFloor].chartData = this.getChartData(floorsCopy[currentFloor].unplacedSensors);
      } else {
        floorsCopy[currentFloor].historyTimestamps = null;
        floorsCopy[currentFloor].chartData = null;
      }
      this.setState({
        floors: floorsCopy,
        selectedTypes: [],
        excludedSensors: [],
      });
    }

    this.toggleConfirmDialog();
  }

  unplacedFolderLabel = (folder) => {
    const { classes } = this.props;

    return (
      <Typography
        component="div"
        className={classes.unplacedFolderLabel}
        style={{
          backgroundColor: 'rgba(0, 125, 255, 0.5)',
          paddingRight: 3,
        }}
        noWrap
      >
        {!folder.folded && folder.name}
      </Typography>
    );
  };

  hasHorizontalScroll = node => node && node.scrollWidth > node.clientWidth;

  updateHistoryTimeSelection = (value) => {
    const { selectedFloor, floors } = this.state;
    const currentFloor = floors.find(floor => floor.number === selectedFloor);
    const maxTimestamp = moment(currentFloor.historyTimestamps.max).unix();
    const selectedTime = value !== maxTimestamp ? value : null;

    this.setState({ historySelectedTime: selectedTime });
  };

  toggleUnplacedMetersContainer = () => {
    const { unplacedMetersContainerVisible } = this.state;

    this.setState({ unplacedMetersContainerVisible: !unplacedMetersContainerVisible });
  }

  onDragStop = (sensorIndex, buildingIndex = null) => (e, d) => {
    // check if it is drag, not click
    if (Math.abs(d.lastX) < MIN_DRAG_PIXELS && Math.abs(d.lastY) < MIN_DRAG_PIXELS) {
      if (buildingIndex !== null) {
        const buildingContainer = document.getElementById(`map-${buildingIndex}`);

        if (buildingContainer) {
          buildingContainer.style.overflow = 'hidden';
        }
      }
      return;
    }

    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.findIndex(floor => floor.number === selectedFloor);

    const currentElement = d.node;
    const meter = {
      ...$(currentElement).offset(),
      height: $(currentElement).height() + 13,
      width: $(currentElement).width() + 13,
    };
    const dropPos = {
      y: e.pageY || (e.pageY === 0 ? 0 : e.changedTouches[0].pageY),
      x: e.pageX || (e.pageX === 0 ? 0 : e.changedTouches[0].pageX),
    };
    const isSensorFolded = buildingIndex === null ? (
      floorsCopy[currentFloor].unplacedSensors[sensorIndex].folded
    ) : (
      floorsCopy[currentFloor].buildings[buildingIndex].placedSensors[sensorIndex].folded
    );
    const sensorToPlaceSize = {
      height: isSensorFolded ? meter.height : METER_UNITS.folder_height,
      width: isSensorFolded ? meter.width : METER_UNITS.folder_width,
    };
    const dropDelta = {
      y: ((dropPos.y - meter.top) / meter.height) * sensorToPlaceSize.height,
      x: ((dropPos.x - meter.left) / meter.width) * sensorToPlaceSize.width,
    };

    const numberOfBuildings = floorsCopy[currentFloor].buildings.length;
    const buildingsIds = [...Array(numberOfBuildings).keys()].map(index => `#${PANZOOM_IDS.container}-${index}`);
    const buildingsBoxes = buildingsIds.map(id => ({ ...$(id).offset(), height: $(id).height(), width: $(id).width() }));

    const buildingToPlaceSensorIn = buildingsBoxes.findIndex(box => (
      box.top < dropPos.y && dropPos.y < (box.top + box.height) && box.left < dropPos.x && dropPos.x < (box.left + box.width)
    ));

    if (buildingToPlaceSensorIn === -1) {
      if (buildingIndex !== null) {
        const sensor = floorsCopy[currentFloor].buildings[buildingIndex].placedSensors.splice(sensorIndex, 1)[0];
        const index = floorsCopy[currentFloor].unplacedSensors.findIndex(unplacedSensor => unplacedSensor.placedOnMap === sensor.placedOnMap);

        if (index !== -1) {
          floorsCopy[currentFloor].unplacedSensors[index].placedOnMap = null;
        }

        const buildingContainer = document.getElementById(`map-${buildingIndex}`);

        if (buildingContainer) {
          buildingContainer.style.overflow = 'hidden';
        }
      }
    } else {
      const positionInsideImage = {
        x: `${(dropPos.x - buildingsBoxes[buildingToPlaceSensorIn].left - dropDelta.x) / buildingsBoxes[buildingToPlaceSensorIn].width * 100}%`,
        y: `${(dropPos.y - buildingsBoxes[buildingToPlaceSensorIn].top - dropDelta.y) / buildingsBoxes[buildingToPlaceSensorIn].height * 100}%`,
        distToRightBorder: buildingsBoxes[buildingToPlaceSensorIn].width - (dropPos.x - buildingsBoxes[buildingToPlaceSensorIn].left - dropDelta.x),
      };

      if (buildingIndex !== null) {
        const sensor = floorsCopy[currentFloor].buildings[buildingIndex].placedSensors[sensorIndex];
        floorsCopy[currentFloor].buildings[buildingIndex].placedSensors[sensorIndex] = { ...sensor, ...positionInsideImage };

        const buildingContainer = document.getElementById(`map-${buildingIndex}`);

        if (buildingContainer) {
          buildingContainer.style.overflow = 'hidden';
        }
      } else {
        const sensor = floorsCopy[currentFloor].unplacedSensors[sensorIndex];
        // eslint-disable-next-line no-plusplus
        floorsCopy[currentFloor].lastPlacedSensorId++;
        sensor.placedOnMap = floorsCopy[currentFloor].lastPlacedSensorId;
        floorsCopy[currentFloor].buildings[buildingToPlaceSensorIn].placedSensors.push({
          ...sensor,
          ...positionInsideImage,
        });
        this.setState({ floors: floorsCopy });

        const sensorToUnfold = floorsCopy[currentFloor].buildings[buildingToPlaceSensorIn].placedSensors.find(placedSensor => placedSensor.name === sensor.name);
        this.delayUnfold(currentFloor, buildingToPlaceSensorIn, sensorToUnfold.name);
        return;
      }
    }

    this.setState({ floors: floorsCopy });

    this.metersContainerRef.current.style.overflow = 'hidden';
    currentElement.style.zIndex = 11;
  };

  onDragStart = (buildingIndex = null) => (e, d) => {
    if (buildingIndex !== null) {
      const buildingContainer = document.getElementById(`map-${buildingIndex}`);
      if (buildingContainer) {
        buildingContainer.style.overflow = 'visible';
      }
    } else if (this.metersContainerRef.current) {
      this.metersContainerRef.current.style.overflow = 'visible';
    }
    const currentElement = d.node;

    if (currentElement) {
      currentElement.style.zIndex = DRAGGING_Z_INDEX;
    }
  }

  toggleCsvParserDialog = () => {
    this.setState(prevState => ({
      showCsvParserDialog: !prevState.showCsvParserDialog,
      sensorsToAdd: [],
    }));
  };

  delayUnfold = (currentFloorIndex, buildingIndex, sensorName) => {
    const { floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const sensorToUnfold = floorsCopy[currentFloorIndex].buildings[buildingIndex].placedSensors.find(placedSensor => placedSensor.name === sensorName);
    const unplacedToUnfold = floorsCopy[currentFloorIndex].unplacedSensors.find(unplacedSensor => unplacedSensor.name === sensorName);
    unplacedToUnfold.folded = false;
    sensorToUnfold.folded = false;
    setTimeout(() => this.setState({ floors: floorsCopy }), 1000);
  }

  getType = (name) => {
    if (name.match(/temp/gi)) {
      return SENSOR_TYPE_LABEL.TEMPERATURE;
    }
    if (name.match(/elec/gi)) {
      return SENSOR_TYPE_LABEL.ELECTRICITY;
    }
    if (name.match(/bright/gi)) {
      return SENSOR_TYPE_LABEL.BRIGHTNESS;
    }
    if (name.match(/humi/gi)) {
      return SENSOR_TYPE_LABEL.HUMIDITY;
    }
    return SENSOR_TYPE_LABEL.OTHER;
  };

  csvParserSubmit = (acceptedFiles) => {
    const { floors, selectedFloor } = this.state;
    const currentFloor = floors.find(floor => floor.number === selectedFloor);
    acceptedFiles.forEach((acceptedFile) => {
      Papa.parse(acceptedFile, {
        header: true,
        transformHeader: (header, index) => `${index}-${header}`,
        complete: (results) => {
          if (results.data.length) {
            const [timestampColumn, ...columnNames] = Object.keys(results.data[0]);
            const data = columnNames.map(name => ({
              name: name.split('-').slice(1).join('-'),
              type: this.getType(name.split('-').slice(1).join('-')),
              values: results.data
                .filter(row => row[timestampColumn])
                .map(row => ({
                  timestamp: parseFloat(row[timestampColumn]) || (row[timestampColumn] === '0' ? 0 : row[timestampColumn]),
                  value: parseFloat(row[name]) || (row[name] === '0' ? 0 : row[name]),
                })),
            }));
            const name = acceptedFile.name.split('.')[0];
            const lastTimestamp = data[0].values.slice(-1)[0].timestamp;
            this.setState(prevState => ({
              sensorsToAdd: [
                ...prevState.sensorsToAdd,
                {
                  name,
                  data,
                  folded: true,
                  time: moment().subtract(lastTimestamp, 'seconds').startOf('seconds'),
                  logDuration: lastTimestamp,
                  badTime: false,
                  duplicated: currentFloor.unplacedSensors.some(item => item.name === name) || prevState.sensorsToAdd.filter(item => item.name === name).length > 1,
                },
              ],
            }));
          }
        },
      });
    });
    this.setState({
      showCsvParserDialog: true,
    });
  };

  getMicrobitImage = (color) => {
    switch (color) {
      case 'yellow':
        return microbitYellow;
      case 'green':
        return microbitGreen;
      case 'blue':
        return microbitBlue;
      default:
        return microbitRed;
    }
  }

  handleSensorColorSubmit = (color, index) => {
    const { sensorsToAdd } = this.state;
    const sensorsToAddCopy = JSON.parse(JSON.stringify(sensorsToAdd));
    sensorsToAddCopy[index].color = color;

    this.setState({ sensorsToAdd: sensorsToAddCopy });
  }

  handleSensorsToAddStartTimeChange = (date, index) => {
    const { sensorsToAdd } = this.state;
    const sensorsToAddCopy = JSON.parse(JSON.stringify(sensorsToAdd));
    sensorsToAddCopy[index].time = date;
    sensorsToAddCopy[index].badTime = moment(date).add(sensorsToAdd[index].logDuration).isAfter(moment());
    this.setState({ sensorsToAdd: sensorsToAddCopy });
  };

  deleteSensorToAdd = (index) => {
    const { sensorsToAdd } = this.state;
    const sensorsCopy = JSON.parse(JSON.stringify(sensorsToAdd));
    sensorsCopy.splice(index, 1);
    this.setState({ sensorsToAdd: sensorsCopy });
  };

  handleSensorToAddNameChange = (e, index) => {
    const { floors, selectedFloor, sensorsToAdd } = this.state;
    const currentFloor = floors.find(floor => floor.number === selectedFloor);
    sensorsToAdd[index].name = e.target.value;
    this.setState({
      sensorsToAdd: sensorsToAdd.map((sensor, itemIndex) => {
        const name = itemIndex === index ? e.target.value : sensor.name;
        return {
          ...sensor,
          name,
          duplicated: currentFloor.unplacedSensors.some(item => item.name === name) || sensorsToAdd.filter(item => item.name === name).length > 1,
        };
      }),
    });
  };

  onEditSubmit = (unplacedSensors) => {
    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floors.findIndex(floor => floor.number === selectedFloor);
    floorsCopy[currentFloor].unplacedSensors = unplacedSensors;
    floorsCopy[currentFloor].historyTimestamps = this.getHistoryRange(floorsCopy[currentFloor]);
    floorsCopy[currentFloor].chartData = this.getChartData(floorsCopy[currentFloor].unplacedSensors);
    this.setState({ floors: floorsCopy });
    this.toggleEditSensorGroupDialog();
  };

  onSubmitCsv = (sensors) => {
    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floors.findIndex(floor => floor.number === selectedFloor);
    floorsCopy[currentFloor].unplacedSensors.push(...sensors);
    if (sensors.length > 0) {
      floorsCopy[currentFloor].historyTimestamps = this.getHistoryRange(floorsCopy[currentFloor]);
      floorsCopy[currentFloor].chartData = this.getChartData(floorsCopy[currentFloor].unplacedSensors);
      this.setState({ floors: floorsCopy });
    }
    this.toggleCsvParserDialog();
  };

  deleteSensor = (index) => {
    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.findIndex(floor => floor.number === selectedFloor);
    if (currentFloor !== -1) {
      floorsCopy[currentFloor].unplacedSensors.splice(index, 1);
    }
    if (floorsCopy[currentFloor].unplacedSensors.length > 0) {
      floorsCopy[currentFloor].historyTimestamps = this.getHistoryRange(floorsCopy[currentFloor]);
      floorsCopy[currentFloor].chartData = this.getChartData(floorsCopy[currentFloor].unplacedSensors);
    } else {
      floorsCopy[currentFloor].historyTimestamps = null;
      floorsCopy[currentFloor].chartData = null;
    }
    this.setState({ floors: floorsCopy });
    this.toggleConfirmDialog();
  }

  deleteBuilding = (buildingIndex) => {
    const { selectedFloor, floors } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.findIndex(floor => floor.number === selectedFloor);

    if (currentFloor !== -1) {
      const removedBuilding = floorsCopy[currentFloor].buildings.splice(buildingIndex, 1)[0];

      removedBuilding.placedSensors.forEach((placedSensor) => {
        const indexToRemove = floorsCopy[currentFloor].unplacedSensors.findIndex(sensor => (
          sensor.placedOnMap === placedSensor.placedOnMap
        ));
        floorsCopy[currentFloor].unplacedSensors.splice(indexToRemove, 1);
      });
    }
    this.setState({ floors: floorsCopy });
    this.toggleConfirmDialog();
  }

  enableBuildingNameEdit = (buildingIndex) => {
    const { selectedFloor, floors } = this.state;
    const currentFloor = floors.findIndex(floor => floor.number === selectedFloor);

    this.setState({
      newBuildingName: floors[currentFloor].buildings[buildingIndex].name,
    }, () => {
      const input = document.getElementById(`buildingName-${buildingIndex}`);

      if (input) {
        input.focus();
      }
    });
  }

  submitNewBuildingName = (buildingIndex) => {
    const { selectedFloor, floors, newBuildingName } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.findIndex(floor => floor.number === selectedFloor);

    floorsCopy[currentFloor].buildings[buildingIndex].name = newBuildingName;
    this.setState({ floors: floorsCopy, newBuildingName: '' });
  }

  toggleEnableHistory = () => {
    const { selectedFloor, floors } = this.state;
    const currentFloor = floors.find(floor => floor.number === selectedFloor);
    const minTimestamp = moment(currentFloor.historyTimestamps.min).unix();

    this.setState(prevState => ({
      historyEnabled: !prevState.historyEnabled,
      historySelectedTime: prevState.historyEnabled ? null : minTimestamp,
    }));
  }

  getHistoryRange = (currentFloor) => {
    const timestampsArray = currentFloor.unplacedSensors
      ? currentFloor.unplacedSensors.reduce((acc, sensor) => (
        [...acc, ...sensor.data[0].values.map((row) => {
          const absoluteTime = moment(sensor.time).add(row.timestamp, 'seconds');
          return absoluteTime.format();
        })]
      ), []) : [];
    timestampsArray.sort();
    return { min: timestampsArray[0], max: timestampsArray[timestampsArray.length - 1] };
  }

  rewriteSensorData = (values, group) => (
    values.map(({ timestamp, value }) => ({ timestamp: moment(group.time).add(timestamp, 'seconds').unix(), [group.name]: value }))
  );

  filterChartData = (data, type) => {
    const chartData = data[type].reduce((acc, sensor) => {
      acc[sensor.timestamp] = { ...acc[sensor.timestamp], ...sensor };
      return acc;
    }, {});

    return Object.values(chartData);
  }

  getChartData = groups => (
    groups.reduce((data, group) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      group.data.forEach((sensor) => {
        const sensorType = sensor.type;
        if (!dataCopy[sensorType]) {
          dataCopy[sensorType] = this.rewriteSensorData(sensor.values, group);
        } else {
          dataCopy[sensorType].push(...this.rewriteSensorData(sensor.values, group));
        }
      });
      return dataCopy;
    }, {})
  );

  getChartDataValues = data => Object.entries(data).reduce((acc, [name, value]) => {
    acc.push(...(name !== 'timestamp' ? [value] : []));
    return acc;
  }, [])

  getSensorGroupNames = (chartData) => {
    const groupNames = new Set();
    chartData.forEach(chartItem => Object.keys(chartItem).forEach(key => key !== 'timestamp' && groupNames.add(key)));
    return [...groupNames];
  }

  getFilteredChartDataRange = (filteredData, index) => {
    const initialData = this.getChartDataValues(filteredData[index][0]);
    let minY = Math.min(...initialData),
      maxY = Math.max(...initialData);
    filteredData[index].forEach((currentValue) => {
      const data = this.getChartDataValues(currentValue);
      const min = Math.min(...data);
      const max = Math.max(...data);
      if (min < minY) {
        minY = min;
      }
      if (max > maxY) {
        maxY = max;
      }
    });
    return { minY, maxY };
  }

  getFilteredChartData = () => {
    const { floors, selectedFloor, selectedTypes } = this.state;
    const currentFloor = floors.find(floor => floor.number === selectedFloor) || { chartData: {} };
    const availableSensorTypes = currentFloor.chartData ? Object.keys(currentFloor.chartData) : [];
    const filteredData = selectedTypes.map(sensorType => (currentFloor.chartData ? this.filterChartData(currentFloor.chartData, sensorType, selectedTypes.filter(type => type !== sensorType)) : []));
    const chartDataRange = {
      minX: null,
      maxX: null,
      minY1: null,
      maxY1: null,
      minY2: null,
      maxY2: null,
    };

    const availableGroupNames = filteredData.map(typeData => this.getSensorGroupNames(typeData));
    if (filteredData && filteredData[0] && filteredData[0][0]) {
      chartDataRange.minX = filteredData[0][0].timestamp;
      chartDataRange.maxX = filteredData[0][0].timestamp;
      filteredData.forEach((typeData) => {
        typeData.forEach((item) => {
          if (item.timestamp < chartDataRange.minX) {
            chartDataRange.minX = item.timestamp;
          }
          if (item.timestamp > chartDataRange.maxX) {
            chartDataRange.maxX = item.timestamp;
          }
        });
      });
    }

    if (filteredData[0] && filteredData[0].length) {
      const { minY, maxY } = this.getFilteredChartDataRange(filteredData, 0);
      chartDataRange.minY1 = minY;
      chartDataRange.maxY1 = maxY;
    }
    if (filteredData[1] && filteredData[1].length) {
      const { minY, maxY } = this.getFilteredChartDataRange(filteredData, 1);
      chartDataRange.minY2 = minY;
      chartDataRange.maxY2 = maxY;
    }

    return {
      chartData: filteredData,
      availableSensorTypes,
      chartDataRange,
      availableGroupNames,
    };
  }

  setSelectedTypes = (selectedTypes) => {
    this.setState({ selectedTypes });
  }

  setSelectedGroups = (excludedSensors) => {
    this.setState({ excludedSensors });
  }

  handleSelectChartTypesOpen = () => {
    this.setState({ selectChartTypesOpen: true });
  }

  handleSelectChartTypesClose = () => {
    this.setState({ selectChartTypesOpen: false });
  }

  handleSelectChartGroupOpen = () => {
    this.setState({ selectFilteredGroupOpen: true });
  }

  handleSelectChartGroupClose = () => {
    this.setState({ selectFilteredGroupOpen: false });
  }

  toggleSensorsGroup = (sensorIndex, buildingIndex = null, sensorName = null) => {
    const { floors, selectedFloor } = this.state;
    const floorsCopy = JSON.parse(JSON.stringify(floors));
    const currentFloor = floorsCopy.find(floor => floor.number === selectedFloor);
    if (buildingIndex !== null) {
      const currentSensor = currentFloor.buildings[buildingIndex].placedSensors.find(placedSensor => placedSensor.name === sensorName);
      currentSensor.folded = !currentSensor.folded;
      const unplacedSensor = currentFloor.unplacedSensors.find(sensor => sensor.name === currentSensor.name);
      unplacedSensor.folded = !unplacedSensor.folded;
    } else {
      currentFloor.unplacedSensors[sensorIndex].folded = !currentFloor.unplacedSensors[sensorIndex].folded;
    }
    this.setState({ floors: floorsCopy });
  }

  renderNoResources = () => {
    const { classes } = this.props;
    return (
      <Grid
        container
        className={classNames(classes.metersContainer, classes.noResourceContainer)}
        alignItems="center"
        justify="center"
        style={{ borderTop: `1px solid ${FLOORS_MAPS_BG_DARK_COLOR}` }}
      >
        <Typography className={classes.noResourceText}>
          No resource was found
        </Typography>
      </Grid>
    );
  };

  render() {
    const { classes } = this.props;

    const {
      historyEnabled,
      historySelectedTime,
      selectedFloor,
      selectedBuilding,
      floors,
      createDialogOpened,
      createAreaDialogOpened,
      deleteFloorConfirmOpened,
      unplacedMetersContainerVisible,
      showCsvParserDialog,
      selectedTypes,
      sensorsToAdd,
      draggedFiles,
      newBuildingName,
      toggle,
      showEditSensorGroupDialog,
      sensorGroupIndex,
      selectChartTypesOpen,
      excludedSensors,
      selectFilteredGroupOpen,
    } = this.state;

    const currentFloor = floors.find(floor => floor.number === selectedFloor);
    const filteredUnplacedSensors = currentFloor && currentFloor.unplacedSensors.filter(sensor => !sensor.placedOnMap);
    const currentBuilding = currentFloor && currentFloor.buildings && currentFloor.buildings[selectedBuilding];
    const {
      chartData,
      availableSensorTypes,
      availableGroupNames,
      chartDataRange,
    } = this.getFilteredChartData();

    const groupNames = availableGroupNames.reduce((acc, name) => {
      acc.push(...name);
      return [...new Set(acc)];
    }, []);

    return (
      <Grid className={classes.root} style={{ backgroundColor: FLOORS_MAPS_BG_DARK_COLOR }}>
        <Grid container alignItems="center" justify="center">
          <Grid container justify="space-between" className={classes.selectsContainer}>
            <Grid item container xs={12} md={2} lg={4} className={classes.floorSelectContainer} alignItems="center">
              {floors.length ? (
                <React.Fragment>
                  <Grid item xs={8}>
                    <FormControl margin="dense" classes={{ marginDense: classes.formControlMarginDense }} fullWidth>
                      <Select
                        margin="dense"
                        className={`${classes.selectRoot} ${classes.selectFloors}`}
                        onChange={this.changeFloor}
                        name="floorId"
                        value={selectedFloor}
                        classes={{
                          select: classes.select,
                          icon: classes.selectIcon,
                          selectMenu: classes.selectMenu,
                        }}
                      >
                        {floors.map(floor => (
                          <MenuItem key={floor.number} value={floor.number}>
                            <Avatar
                              className="floorsAvatar"
                              src={floorsIcon}
                              alt="floors"
                              style={{
                                height: 18,
                                width: 18,
                                marginRight: 15,
                                display: 'none',
                                verticalAlign: 'middle',
                              }}
                            />
                            <span
                              style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {floor.name}
                            </span>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#CD5C5C', left: 8 }}
                      classes={{ root: classes.createButton, label: classes.createLabel }}
                      onClick={() => {
                        this.toggleConfirmDialog({ deleteTitle: 'Delete Current Floor?', deleteFunction: this.deleteFloor });
                      }}
                    >
                      <img src={deleteFloorIcon} alt="delete current floor" className={classes.floorEditIcon} />
                      Delete floor
                    </Button>
                  </Grid>
                </React.Fragment>
              ) : null}
              {(currentFloor && currentFloor.buildings && currentFloor.buildings.length) ? (
                <React.Fragment>
                  <Grid item xs={8}>
                    <FormControl margin="dense" classes={{ marginDense: classes.formControlMarginDense }} fullWidth>
                      <Select
                        margin="dense"
                        className={`${classes.selectRoot} ${classes.selectAreas}`}
                        onChange={this.changeBuilding}
                        name="buildingId"
                        value={selectedBuilding}
                        classes={{
                          select: classes.select,
                          icon: classes.selectIcon,
                          selectMenu: classes.selectMenu,
                        }}
                      >
                        {currentFloor.buildings.map((building, buildingIndex) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <MenuItem key={buildingIndex} value={buildingIndex}>
                            <Grid container alignItems="center">
                              <MapIcon />
                              <span
                                style={{
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                  fontSize: 12,
                                  fontWeight: 500,
                                  marginLeft: 12,
                                }}
                              >
                                {building.name}
                              </span>
                            </Grid>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#CD5C5C', top: 8, left: 8 }}
                      classes={{ root: classes.createButton, label: classes.createLabel }}
                      onClick={() => {
                        this.toggleConfirmDialog({
                          deleteTitle: `Would you like delete '${currentBuilding.name}' area?`,
                          deleteFunction: () => {
                            this.deleteBuilding(selectedBuilding);
                          },
                        });
                      }}
                    >
                      <img src={deleteFloorIcon} alt="delete current area" className={classes.floorEditIcon} />
                      Delete area
                    </Button>
                  </Grid>
                </React.Fragment>
              ) : null}
            </Grid>
            <Grid item container xs={12} md={4} lg={4} alignItems="center" justify="center">
              <div style={{ paddingLeft: 10, paddingRight: 10 }}>
                <Typography variant="caption" className={classes.pageLabel} align="center">
                  FLOOR MAPS
                </Typography>
              </div>
            </Grid>
            <Grid item container xs={12} md={6} lg={4} justify="flex-end" alignItems="center">
              <Grid container className={classes.createButtonContainer} wrap="nowrap" height="100%">
                {floors.length ? (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      classes={{ root: classes.createButton, label: classes.createLabel }}
                      onClick={this.downloadFile}
                    >
                      <CloudDownloadRounded className={classes.floorEditIcon} />
                      Export data
                    </Button>
                  </React.Fragment>
                ) : (
                  <label htmlFor="import-button-file" className={classes.importButton}>
                    <Button
                      variant="contained"
                      component="span"
                      classes={{ root: classes.createButton, label: classes.createLabel }}
                    >
                      <CloudUploadRounded className={classes.floorEditIcon} />
                      Import data
                    </Button>
                    <input
                      accept="application/json"
                      className={classes.input}
                      style={{ display: 'none' }}
                      id="import-button-file"
                      type="file"
                      onChange={(e) => { e.persist(); this.importData(e.target.files[0]); }}
                    />
                  </label>
                )}
                {currentFloor ? (
                  <Button
                    variant="contained"
                    classes={{ root: classes.createButton, label: classes.createLabel }}
                    onClick={this.toggleCreateAreaDialog}
                  >
                    <img src={newFloorIcon} alt="Add new Area" className={classes.floorEditIcon} />
                    Add new Area
                  </Button>
                ) : ''}
                <Button
                  variant="contained"
                  classes={{ root: classes.createButton, label: classes.createLabel }}
                  onClick={this.toggleCreateDialog}
                >
                  <img src={newFloorIcon} alt="create new floor" className={classes.floorEditIcon} />
                  Create new Floor
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
            {currentFloor ? (
              <Grid container direction="column">
                <Grid container className={classes.manageButtonsContainer}>
                  <Grid
                    container
                    justify="flex-start"
                    className={classes.manageButtonsBlockItem}
                  >
                    {filteredUnplacedSensors && filteredUnplacedSensors.length > 0 && unplacedMetersContainerVisible ? (
                      <Button
                        variant="contained"
                        className={classes.manageButton}
                        style={{ backgroundColor: '#CD5C5C' }}
                        onClick={() => {
                          this.toggleConfirmDialog({ deleteTitle: 'Delete unplaced sensors?', deleteFunction: this.onDeleteUnplacedSensors });
                        }}
                      >
                        <img src={deleteFloorIcon} alt="delete current floor unplaced sensors" className={classes.floorEditIcon} />
                        Delete Unplaced Sensors
                      </Button>
                    ) : null}
                    {currentFloor && currentFloor.unplacedSensors.length ? (
                      <Button
                        variant="contained"
                        className={classes.manageButton}
                        onClick={this.toggleUnplacedMetersContainer}
                      >
                        {unplacedMetersContainerVisible ? 'HIDE UNPLACED' : 'SHOW UNPLACED'}
                      </Button>
                    ) : ''}
                    {currentFloor.historyTimestamps ? (
                      <Button
                        variant="contained"
                        className={classes.manageButton}
                        classes={{ disabled: classes.buttonDisabled }}
                        onClick={this.toggleEnableHistory}
                        style={{ marginRight: 12 }}
                      >
                        {historyEnabled ? 'HIDE HISTORY' : 'SHOW HISTORY'}
                      </Button>
                    ) : null}
                    <MultipleSelect
                      open={selectChartTypesOpen}
                      handleOpen={this.handleSelectChartTypesOpen}
                      handleClose={this.handleSelectChartTypesClose}
                      maxSelectedItemsCount={2}
                      title="CHANGE SENSOR TYPES"
                      items={availableSensorTypes}
                      selectedItems={selectedTypes}
                      setSelectedToState={this.setSelectedTypes}
                    />
                    {currentFloor.unplacedSensors.length > 0 && (
                      selectedTypes.length > 0 ? (
                        <React.Fragment>
                          <MultipleSelect
                            open={selectFilteredGroupOpen}
                            handleOpen={this.handleSelectChartGroupOpen}
                            handleClose={this.handleSelectChartGroupClose}
                            maxSelectedItemsCount={groupNames.length - 1}
                            title="FILTER SENSORS"
                            items={groupNames}
                            selectedItems={excludedSensors}
                            setSelectedToState={this.setSelectedGroups}
                            reverse
                          />
                          <Button
                            variant="contained"
                            className={classes.manageButton}
                            classes={{ disabled: classes.buttonDisabled }}
                            onClick={() => this.setSelectedTypes([])}
                          >
                            HIDE CHART
                          </Button>
                        </React.Fragment>
                      ) : (
                        <Button
                          variant="contained"
                          id="openSelector"
                          className={classes.manageButton}
                          classes={{ disabled: classes.buttonDisabled }}
                          onClick={this.handleSelectChartTypesOpen}
                        >
                          SHOW CHART
                        </Button>
                      )
                    )}
                  </Grid>
                  {selectedTypes.length ? (
                    <Grid container style={{ marginBottom: 80 }}>
                      <SensorsChart
                        getSensorGroupNames={this.getSensorGroupNames}
                        chartData={chartData}
                        availableGroupNames={availableGroupNames}
                        sensorTypesToDisplay={selectedTypes}
                        chartDataRange={chartDataRange}
                        excludedSensors={excludedSensors}
                      />
                    </Grid>
                  ) : null}
                </Grid>
                {unplacedMetersContainerVisible ? (
                  <React.Fragment>
                    <CsvParser
                      csvParserSubmit={this.csvParserSubmit}
                      toggleCsvParserDialog={this.toggleCsvParserDialog}
                    >
                      <RootRef rootRef={this.metersContainerRef}>
                        {filteredUnplacedSensors && filteredUnplacedSensors.length ? (
                          <Grid
                            container
                            item // important! removed alignItems because it causes incorrect behavior on IE. Current block is vertically centered due to paddings
                            className={classes.metersContainer}
                            style={{
                              overflow: 'hidden',
                              paddingTop: filteredUnplacedSensors.length > 0 ? 10 : 8,
                            }}
                          >
                            {currentFloor.unplacedSensors.map((sensor, sensorIndex) => {
                              currentFloor.unplacedSensors[sensorIndex].color = currentFloor.unplacedSensors[sensorIndex].color ? currentFloor.unplacedSensors[sensorIndex].color : 'red';
                              const folderKey = `${sensorIndex}_folder`;
                              return sensor.placedOnMap ? null : (
                                <div key={folderKey}>
                                  <Tooltip title="delete" placement="top-start">
                                    <IconButton
                                      className={classes.deleteSensorContainer}
                                      onClick={() => this.toggleConfirmDialog({ deleteTitle: `Would you like delete '${sensor.name}' sensor?`, deleteFunction: () => { this.deleteSensor(sensorIndex); } })}
                                    >
                                      <img src={deleteFloorIcon} alt="delete current sensor" className={classes.deleteSensor} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="edit" placement="top-start">
                                    <IconButton
                                      className={classes.editSensorContainer}
                                      onClick={() => this.editGroupSensor(sensorIndex)}
                                    >
                                      <img src={editSensorIcon} alt="edit current sensor" className={classes.editSensor} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="unfold" placement="top-start">
                                    <IconButton
                                      className={classes.unfoldSensorContainer}
                                      onClick={() => this.toggleSensorsGroup(sensorIndex)}
                                    >
                                      {sensor.folded ? <UnfoldMoreOutlinedIcon /> : <UnfoldLessOutlinedIcon />}
                                    </IconButton>
                                  </Tooltip>
                                  <div
                                    className={classes.unplacedMetersFolder}
                                    style={{
                                      backgroundColor: 'rgba(0, 125, 255, 0.5)',
                                    }}
                                  >
                                    {this.unplacedFolderLabel(sensor)}
                                    {sensor.folded ? (
                                      <Rnd
                                        id={sensor.name}
                                        className={classes.rndMeterWrapper}
                                        enableResizing={DISABLE_RESIZING}
                                        minHeight={METER_UNITS.height}
                                        position={{ x: 0, y: 0 }}
                                        onDragStop={this.onDragStop(sensorIndex)}
                                        onDragStart={this.onDragStart()}
                                        style={{ position: 'relative' }}
                                      >
                                        <div className={classes.foldedUnplacedSensors}>
                                          <img
                                            src={this.getMicrobitImage(sensor.color)}
                                            alt="folded sensor"
                                            style={{
                                              height: '100%',
                                              width: '100%',
                                            }}
                                            onDragStart={(event) => { event.preventDefault(); }}
                                          />
                                          <p style={{
                                            position: 'absolute',
                                            top: 20,
                                            fontSize: 15,
                                            padding: '0 35px',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            fontWeight: 'bold',
                                            width: '100%',
                                            textAlign: 'center',
                                          }}
                                          >
                                            {sensor.name}
                                          </p>
                                          <p style={{
                                            position: 'absolute',
                                            top: 45,
                                            fontSize: 15,
                                            fontWeight: 'bold',
                                            width: '100%',
                                            textAlign: 'center',
                                          }}
                                          >
                                            {sensor.data.length} sensors
                                          </p>
                                        </div>
                                      </Rnd>
                                    ) : (
                                      sensor.data.map((column, columnIndex) => {
                                        const columnKey = `${columnIndex}_column_${sensorIndex}`;

                                        return (
                                          <div
                                            key={columnKey}
                                            className={classes.unplacedFolderedMeterWrapper}
                                          >
                                            <FloorPlanMeter
                                              folderName={this.unplacedFolderLabel(sensor)}
                                              meterId={column.name}
                                              name={column.name}
                                              sensorType={column.type}
                                              meterData={column.values}
                                              onDragStop={this.onDragStop(sensorIndex)}
                                              onDragStart={this.onDragStart()}
                                              disableDragging={!currentFloor.buildings.length || !unplacedMetersContainerVisible}
                                              sensorStartTime={moment(sensor.time)}
                                              historyValue={historySelectedTime}
                                              periodDuration={currentFloor.historyTimestamps ? ((moment(currentFloor.historyTimestamps.max).unix() - moment(currentFloor.historyTimestamps.min).unix()) / HISTORY_STEPS_COUNT) : 0}
                                            />
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {this.hasHorizontalScroll(this.metersContainerRef.current) && (
                              <div id="arrows-container">
                                <Button className={classes.leftArrow} onClick={this.scrollHorizontal('left')} style={{ display: this.showArrow('left') }}>
                                  <Avatar src={arrowLeft} alt="arrow left" />
                                </Button>
                                <Button className={classes.rightArrow} onClick={this.scrollHorizontal('right')} style={{ display: this.showArrow('right') }}>
                                  <Avatar src={arrowRight} alt="arrow right" />
                                </Button>
                              </div>
                            )}
                          </Grid>
                        ) : (
                          this.renderNoResources()
                        )}
                      </RootRef>
                    </CsvParser>
                  </React.Fragment>
                ) : null}
                {historyEnabled && currentFloor.historyTimestamps && (
                  <Grid
                    container
                    alignItems="center"
                    justify="center"
                    className={classes.historySliderContainer}
                  >
                    <MapHistorySlider
                      minValue={moment(currentFloor.historyTimestamps.min).unix()}
                      maxValue={moment(currentFloor.historyTimestamps.max).unix()}
                      stepValue={(moment(currentFloor.historyTimestamps.max).unix() - moment(currentFloor.historyTimestamps.min).unix()) / HISTORY_STEPS_COUNT}
                      updateValue={this.updateHistoryTimeSelection}
                    />
                  </Grid>
                )}
                <DragAndDrop handleDrop={this.handleDropOnFloor}>
                  <Grid className={classes.mapsWrapper} container direction="column" alignItems="center">
                    {currentFloor.buildings && currentFloor.buildings.length && currentBuilding ? (
                      <Grid container justify="center" key="locationMap">
                        <Grid
                          container
                          justify="center"
                          alignItems="center"
                          wrap="nowrap"
                          style={{
                            maxWidth: 600,
                            marginLeft: 8,
                          }}
                        >
                          <TextField
                            disabled={!newBuildingName}
                            type="text"
                            value={newBuildingName || currentBuilding.name}
                            inputProps={{
                              id: `buildingName-${selectedBuilding}`,
                              style: {
                                textAlign: 'center',
                                fontWeight: newBuildingName ? 'normal' : 'bold',
                                color: 'rgba(0, 0, 0, .8)',
                              },
                            }}
                            style={{ flex: '1' }}
                            onChange={(event) => {
                              if (event.target.value) {
                                this.setState({ newBuildingName: event.target.value });
                              }
                            }}
                          />
                          {newBuildingName ? (
                            <IconButton
                              variant="contained"
                              className={classes.manageButton}
                              onClick={() => {
                                this.submitNewBuildingName(selectedBuilding);
                              }}
                            >
                              <DoneIcon htmlColor="white" />
                            </IconButton>
                          ) : (
                            <IconButton
                              variant="contained"
                              className={classes.manageButton}
                              onClick={() => {
                                this.enableBuildingNameEdit(selectedBuilding);
                              }}
                            >
                              <EditIcon htmlColor="white" />
                            </IconButton>
                          )}
                        </Grid>
                        <div style={{ width: '100%' }}>
                          <LocationMap
                            floor={currentFloor}
                            map={currentBuilding.image}
                            building={currentBuilding}
                            buildingIndex={selectedBuilding}
                            getMicrobitImage={this.getMicrobitImage}
                            handleUnfoldButtonClick={this.toggleSensorsGroup}
                            handleDrop={this.handleDrop}
                            createFloorMap={this.toggleCreateDialog}
                            historyValue={historySelectedTime}
                            periodDuration={currentFloor.historyTimestamps ? ((moment(currentFloor.historyTimestamps.max).unix() - moment(currentFloor.historyTimestamps.min).unix()) / HISTORY_STEPS_COUNT) : 0}
                            readonly={!unplacedMetersContainerVisible}
                            showAlertOnPlanFileLoadError={this.showAlertOnPlanFileLoadError}
                            onDragSensorStop={this.onDragStop}
                            onDragSensorStart={this.onDragStart}
                          />
                        </div>
                      </Grid>
                    ) : (
                      <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        className={classes.noPhotoContainer}
                      >
                        <h3>There is no plan photo for this floor</h3>
                        <h3>You can add photos by Drag-n-Drop them here</h3>
                      </Grid>
                    )}
                  </Grid>
                </DragAndDrop>
              </Grid>
            ) : (
              <Grid container justify="center">
                <DragAndDrop handleDrop={this.handleDrop}>
                  <Grid container direction="column" justify="center" alignItems="center" className={classes.noFloor}>
                    <h2>There is no floor created</h2>
                    <Grid container justify="space-around" alignItems="center">
                      <Grid item xs={10} sm={5} container direction="column" alignItems="center" className={classes.textNoFloor}>
                        <h3>
                          Click <span className={classes.buttonTitleSpan}>Import Data</span> button at the top to import previously created floors
                          <br /><br />OR<br /><br />
                          drag-n-drop exported JSON file here.
                        </h3>
                      </Grid>
                      <Grid item xs={10} sm={5} container direction="column" alignItems="center" className={classes.textNoFloor}>
                        <h3>
                          Click <span className={classes.buttonTitleSpan}>Create New Floor</span> button at the top to add a new one
                          <br /><br />OR<br /><br />
                          drag-n-drop floor map images here.
                        </h3>
                      </Grid>
                    </Grid>
                  </Grid>
                </DragAndDrop>
              </Grid>
            )}
          </Grid>
        </Grid>
        <CsvParserDialog
          isOpened={showCsvParserDialog}
          onClose={this.toggleCsvParserDialog}
          title="Add new sensors"
          onSubmit={this.onSubmitCsv}
          sensorsToAdd={sensorsToAdd}
          csvParserSubmit={this.csvParserSubmit}
          deleteSensorToAdd={this.deleteSensorToAdd}
          handleColorChange={this.handleSensorColorSubmit}
          handleSensorsToAddStartTimeChange={this.handleSensorsToAddStartTimeChange}
          handleSensorToAddNameChange={this.handleSensorToAddNameChange}
        />
        <NewAreaDialog
          title="Add new area to the floor"
          isOpened={createAreaDialogOpened}
          onClose={this.toggleCreateAreaDialog}
          onSubmit={this.areaCreateSubmit}
        />
        <NewFloorDialog
          files={draggedFiles}
          title="Add new floor with map"
          isOpened={createDialogOpened}
          onClose={this.toggleCreateDialog}
          onSubmit={this.floorCreateSubmit}
          existingFloors={this.getExistingFloors()}
        />
        <EditSensorGroupDialog
          title="Edit Sensor Group"
          isOpened={showEditSensorGroupDialog}
          onClose={this.toggleEditSensorGroupDialog}
          sensorGroupIndex={sensorGroupIndex}
          sensors={currentFloor && currentFloor.unplacedSensors}
          onSubmit={this.onEditSubmit}

        />
        <ConfirmDialog
          title={toggle.deleteTitle}
          isOpened={deleteFloorConfirmOpened}
          onSubmit={toggle.deleteFunction}
          onClose={() => { this.toggleConfirmDialog(); }}
        />
      </Grid>
    );
  }
}

FloorsMaps.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
    }, dispatch),
  };
}


export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(FloorsMaps);
