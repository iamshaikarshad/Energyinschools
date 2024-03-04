import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { compose } from 'redux';

import { Resizable } from 're-resizable';

import { Rnd } from 'react-rnd';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import { withStyles } from '@material-ui/core/styles';
import SwapVert from '@material-ui/icons/SwapVert';

import thermometer from '../../images/thermometer.svg';
import foldIn from '../../images/foldIn.png';
import microbitLogoYellow from '../../images/microbit-logo-yellow.png';
import microbitLogoBlue from '../../images/microbit-logo-blue.png';
import microbitLogoGreen from '../../images/microbit-logo-green.png';
import microbitLogoRed from '../../images/microbit-logo-red.png';

import FloorPlanMeter from './FloorPlanMeter';

import isMobileBrowser from '../../utils/detectMobileBrowser';
import truncateText from '../../utils/truncateText';

import {
  DISABLE_RESIZING,
  ENABLE_RESIZING,
  FLOORS_MAPS_BG_COLOR,
  FLOORS_MAPS_BG_DARK_COLOR,
  FLOORS_MAPS_BG_LIGHT_COLOR,
  FLOORS_MAPS_TEXT_COLOR,
  MAP_CONTAINER_WRAPPER_ID,
  METER_UNITS,
  PANZOOM_IDS,
  SELECTED_BUTTON_COLOR,
  SELECTED_BUTTON_COLOR_DISABLED,
} from './constants';
import { getAvgValuePerPeriod } from './utils';
import { SENSOR_TYPE_LABEL } from '../../constants/config';
import DragAndDrop from './DragAndDrop';

const styles = theme => ({
  mapContainerWrapper: {
    textAlign: 'center',
    position: 'relative',
    paddingLeft: 0,
    paddingRight: 0,
  },
  mapContainer: {
    margin: '0 auto',
    height: '100%',
    position: 'relative',
  },
  mapWrapper: {
    height: '100%',
    width: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
  },
  metersContainer: {
    flexWrap: 'nowrap',
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    padding: '27px 16px 8px 16px',
    height: 'auto',
  },
  manageButtonsContainer: {
    padding: '8px 16px',
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 8,
      paddingRight: 8,
    },
  },
  manageButtonsBlockItem: {
    [theme.breakpoints.up('lg')]: {
      flexWrap: 'nowrap',
    },
  },
  manageButton: {
    height: 36,
    padding: '4px 8px 2px',
    marginRight: theme.spacing(1.5),
    borderRadius: 10,
    backgroundColor: SELECTED_BUTTON_COLOR,
    color: FLOORS_MAPS_TEXT_COLOR,
    fontSize: 12,
    lineHeight: 'normal',
    '&:hover': {
      backgroundColor: SELECTED_BUTTON_COLOR,
    },
    [theme.breakpoints.down('md')]: {
      marginRight: 10,
      marginBottom: 15,
    },
  },
  buttonDisabled: {
    backgroundColor: `${SELECTED_BUTTON_COLOR_DISABLED} !important`,
    color: 'rgba(255, 255, 255, 0.4) !important',
  },
  zoomButtonsContainer: {
    position: 'absolute',
    zIndex: 12,
    top: 5,
    left: '50%',
    display: 'inline-block',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
    transform: 'translateX(-50%)',
  },
  zoomButton: {
    height: 36,
    width: 36,
    minWidth: 0,
    padding: 0,
    fontSize: 24,
    backgroundColor: 'transparent',
    color: 'rgb(255, 255, 255)',
  },
  noMapText: {
    fontSize: 36,
    color: 'rgb(57, 57, 57)',
    paddingRight: 40,
    [theme.breakpoints.down('md')]: {
      fontSize: 28,
    },
    [theme.breakpoints.down('xs')]: {
      paddingRight: 20,
      fontSize: 24,
    },
  },
  noMapAddIconRoot: {
    position: 'absolute',
    top: 25,
    right: 9,
    width: 48,
    height: 48,
    [theme.breakpoints.down('sm')]: {
      top: 15,
      right: 15,
      width: 40,
      height: 40,
    },
    [theme.breakpoints.down('xs')]: {
      top: 15,
      right: 15,
    },
  },
  noMapAvatar: {
    overflow: 'visible',
    width: '40%',
    height: 'auto',
  },
  smallMeterValue: {
    fontSize: 8,
    lineHeight: '8px',
    display: 'inline-flex',
    justifyContent: 'center',
    userSelect: 'none',
  },
  addNewMeterButton: {
    width: 120,
    height: 120,
    borderRadius: 10,
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    flex: '0 0 120px',
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
  lockedIcon: {
    height: 28,
    width: 28,
  },
  lockWrapper: {
    position: 'absolute',
    right: 5,
    top: 5,
    height: 40,
    width: 40,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '50%',
    zIndex: 100,
  },
  leftIcon: {
    marginRight: theme.spacing(0.5),
  },
  iconSmall: {
    fontSize: 16,
  },
  historySliderContainer: {
    backgroundColor: FLOORS_MAPS_BG_LIGHT_COLOR,
  },
  noResourceContainer: {
    padding: '0px 32px',
  },
  noResourceText: {
    color: FLOORS_MAPS_TEXT_COLOR,
    padding: '12px 0px',
    fontSize: 24,
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
  placedMetersFolder: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    position: 'absolute',
    borderRadius: 10,
    zIndex: 10,
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
  unplacedFolderedMeterWrapper: {
    margin: '2px 5px 0px',
    height: METER_UNITS.height,
    width: METER_UNITS.width,
    position: 'relative',
    flex: `0 0 ${METER_UNITS.width}px`,
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
    padding: '6px 3px 2px',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
    borderBottom: '1px groove rgba(255, 255, 255, 0.3)',
  },
  resizeHandleBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'rgba(255, 255, 255, 1)',
    borderRadius: 5,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  resizeIcon: {
    transform: 'rotate(-90deg)',
    fontSize: 36,
  },
  warningIcon: {
    overflow: 'visible',
    width: 24,
    height: 24,
  },
  warningTooltip: {
    backgroundColor: 'rgb(255, 0, 0)',
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    borderRadius: 10,
  },
  warningIconWrapper: {
    display: 'inline-block',
    position: 'absolute',
    top: 0,
    right: -1,
    zIndex: 100,
    height: 24,
    width: 24,
  },
  folderTitle: {
    top: -35,
    position: 'absolute',
    fontSize: 13,
    width: 150,
    justifyContent: 'center',
    textAlign: 'left',
    zIndex: 11,
  },
  folderTitleSpan: {
    backgroundColor: '#2699fb',
    color: 'white',
    borderRadius: 5,
    border: '1px solid rgb(192, 192, 192)',
    padding: '10px 2px 2px',
    maxWidth: '100px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  meterExtendedInfo: {
    padding: 2,
    borderRadius: 10,
  },
  tooltipPopper: {
    opacity: 1,
  },
  heatArea: {
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 0,
  },
  thermometerWrapper: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 250,
    width: 200,
  },
  thermometerIcon: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
  },
  thermometerButton: {
    position: 'absolute',
    width: 20,
    borderRadius: 10,
    fontWeight: 'bold',
    top: 25,
    right: 5,
  },
  unfoldBtn: {
    position: 'absolute',
    color: 'white',
    top: 10,
    right: 10,
  },
  foldBtn: {
    borderRadius: 20,
    padding: 2,
    marginLeft: 4,
    border: '2px solid white',
    backgroundColor: '#2699fb',
    minWidth: 10,
    width: 25,
    height: 25,
  },
  microbitLogo: {
    maxWidth: 20,
    position: 'absolute',
    left: 50,
    top: 4,
  },
  foldBtnIcon: {
    width: 20,
    height: 20,
  },
});

const WINDOW_RESIZE_DELAY = 250; // ms
class LocationMap extends React.Component {
  state = {
    windowResized: false,
    ratio: true,
    size: null,
    isThermometerShown: false,
  };

  resizable = null;

  isMobile = isMobileBrowser();

  componentDidMount() {
    const { map } = this.props;

    this.normalizeMap(map);
    if (this.isMobile) {
      window.addEventListener('orientationchange', this.windowChangeOrientationHandler);
    } else {
      window.addEventListener('resize', this.windowResizeHandler);
    }
    this.fixResizableBase();
  }

  componentDidUpdate(prevProps, prevState) {
    const { map, floor } = this.props;
    const { windowResized, size } = this.state;
    if (windowResized || prevProps.map !== map) {
      this.normalizeMap(map);
    }
    if (floor && prevProps.floor && prevProps.floor.number !== floor.number) {
      if (this.isMapZoomed()) {
        this.resetZooming(false);
      }
    }
    if (prevState.size === null && size !== null) {
      this.initPanZoom();
    }
  }

  componentWillUnmount() {
    if (this.isMobile) {
      window.removeEventListener('orientationchange', this.windowChangeOrientationHandler);
    } else {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }

  fixResizableBase = () => {
    const { buildingIndex } = this.props;
    const resizableBaseClass = '__resizable_base__';
    const resizableBase = $(`#${MAP_CONTAINER_WRAPPER_ID}-${buildingIndex} > .${resizableBaseClass}`);
    resizableBase.css({ height: '0px' });
  }

  update = () => {
    this.setState(prevState => prevState); // safe analog of forceUpdate
  };

  getBgImage = (map, defaultBg = '') => {
    if (map) {
      return `linear-gradient(
        ${FLOORS_MAPS_BG_COLOR}, 
        ${FLOORS_MAPS_BG_COLOR}
      ), url(${map})`;
    }
    return defaultBg;
  };

  toggleThermometer = () => {
    this.setState(prevState => ({ isThermometerShown: !prevState.isThermometerShown }));
  }

  isMapZoomed = () => {
    const { buildingIndex } = this.props;
    const selectorMapId = `#${PANZOOM_IDS.container}-${buildingIndex}`;

    if (selectorMapId) {
      const zoomMatrix = $(selectorMapId).panzoom('getMatrix');
      return zoomMatrix && Number(zoomMatrix[0]) !== 1;
    }
    return false;
  };

  hasHorizontalScroll = node => node && node.scrollWidth > node.clientWidth;

  initPanZoom = () => {
    if (this.isMobile) return;

    const { buildingIndex } = this.props;
    const selectorMapId = `#${PANZOOM_IDS.container}-${buildingIndex}`;
    const selectorZoomInId = `#${PANZOOM_IDS.zoomInButoon}-${buildingIndex}`;
    const selectorZoomOutId = `#${PANZOOM_IDS.zoomOutButton}-${buildingIndex}`;
    $(selectorMapId).panzoom({
      $zoomIn: $(selectorZoomInId),
      $zoomOut: $(selectorZoomOutId),
      contain: 'invert',
      minScale: 1,
      maxScale: 3,
      panOnlyWhenZoomed: true,
    });
  };

  normalizeMap = (map) => {
    const i = new Image();

    i.onload = () => {
      this.setState({
        size: { width: '100%', height: `${i.height / i.width * window.innerWidth}px` },
        ratio: i.width / i.height,
      });
    };
    i.src = map;
  };

  resetZooming = (withDialog = true) => {
    if (withDialog) {
      this.toggleResetZoomDialog();
    }

    const { buildingIndex } = this.props;
    const selectorMapId = `#${PANZOOM_IDS.container}-${buildingIndex}`;

    if (selectorMapId) {
      $(selectorMapId).panzoom('reset', false);
    }
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

  getHue = T => Math.min(Math.max((22 - T) * 30, 0), 240);

  getDistanceFromRange = (T, minVal = 14, maxVal = 22) => {
    let distance = 0;
    if (minVal < T && T < maxVal) {
      return distance;
    }
    if (T <= minVal) {
      distance = minVal - T;
    }
    if (maxVal <= T) {
      distance = T - maxVal;
    }
    return distance;
  }

  getLitness = T => ((5 - Math.min(Math.max(this.getDistanceFromRange(T), 0), 4)) * 10);

  getTempetatureColor = T => `hsl(${this.getHue(T)}, 100%, ${Math.abs(this.getLitness(T))}%, 0.57)`;

  getMicrobitLogo = (color) => {
    switch (color) {
      case 'yellow':
        return microbitLogoYellow;
      case 'green':
        return microbitLogoGreen;
      case 'blue':
        return microbitLogoBlue;
      default:
        return microbitLogoRed;
    }
  }

  renderCanvas = () => {
    const {
      classes,
      map,
      building,
      buildingIndex,
      readonly,
      handleDrop,
      onDragSensorStop,
      onDragSensorStart,
      historyValue,
      periodDuration,
      getMicrobitImage,
      handleUnfoldButtonClick,
    } = this.props;

    return (
      <DragAndDrop handleDrop={handleDrop}>
        {building.placedSensors.map((folder, index) => {
          const childrenMargin = 1;
          const sensorSize = {
            width: METER_UNITS.folder_width + 2 * childrenMargin,
            height: METER_UNITS.folder_height + 2 * childrenMargin,
          };
          const temperatureSensor = folder.data.find(column => column.type === SENSOR_TYPE_LABEL.TEMPERATURE);
          const valueToDisplay = temperatureSensor && (historyValue === null ? (
            Math.round(temperatureSensor.values.slice(-1)[0].value * 100) / 100
          ) : (
            getAvgValuePerPeriod(temperatureSensor.values, moment(folder.time), historyValue, periodDuration)
          ));
          const heatColor = temperatureSensor && this.getTempetatureColor(valueToDisplay);
          const columnsCount = Math.min(Math.ceil(Math.sqrt(folder.data.length)), Math.floor(folder.distToRightBorder / sensorSize.width));
          const count = {
            columns: columnsCount,
            rows: Math.ceil(folder.data.length / columnsCount),
          };
          const groupSize = {
            width: count.columns * sensorSize.width,
            height: count.rows * sensorSize.height,
          };
          const heatDiscPos = {
            left: groupSize.width / 2,
            top: groupSize.height / 2,
          };

          const heatDiskPadding = 100;
          const heatDiscSize = Math.sqrt(groupSize.width ** 2 + groupSize.height ** 2) + heatDiskPadding;

          let headerLeft;
          switch (folder.data.length) {
            case 1:
              headerLeft = -36;
              break;
            case 2:
              headerLeft = -15;
              break;
            default:
              headerLeft = 0;
              break;
          }

          return (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`placedMetersFolder_${index}`}>
              {heatColor && !folder.folded && (
                <div
                  className={classes.heatArea}
                  style={{
                    backgroundColor: heatColor,
                    height: heatDiscSize,
                    width: heatDiscSize,
                    left: `calc(${folder.x} - ${heatDiscSize / 2}px + ${heatDiscPos.left}px)`,
                    top: `calc(${folder.y} - ${heatDiscSize / 2}px + ${heatDiscPos.top}px)`,
                  }}
                />
              )}
              <div
                className={classes.placedMetersFolder}
                style={{
                  left: folder.x,
                  top: folder.y,
                  maxWidth: folder.folded ? 180 : groupSize.width,
                }}
              >
                {folder.folded ? (
                  <Rnd
                    id={folder.name}
                    className={classes.rndMeterWrapper}
                    enableResizing={DISABLE_RESIZING}
                    minHeight={METER_UNITS.height}
                    position={{ x: 0, y: 0 }}
                    onDragStop={onDragSensorStop(index, buildingIndex)}
                    onDragStart={onDragSensorStart(buildingIndex)}
                    style={{ position: 'relative' }}
                  >
                    <div className={classes.foldedUnplacedSensors}>
                      <Button
                        onClick={() => handleUnfoldButtonClick(index, buildingIndex, folder.name)}
                        className={classes.unfoldBtn}
                      >
                        <ZoomOutMapIcon />
                      </Button>
                      <img
                        src={getMicrobitImage(folder.color)}
                        alt="folded sensor"
                        style={{
                          height: '100%',
                          width: '100%',
                        }}
                        onDragStart={(event) => { event.preventDefault(); }}
                      />
                      <p style={{
                        position: 'absolute',
                        top: 30,
                        fontSize: 15,
                        fontWeight: 'bold',
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        padding: '0 35px',
                        lineHeight: '15px',
                      }}
                      >
                        {folder.name}
                      </p>
                      <p style={{
                        position: 'absolute',
                        top: 65,
                        fontSize: 15,
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                      }}
                      >
                        {folder.data.length} sensors
                      </p>
                    </div>
                  </Rnd>
                ) : (
                  folder.data.map((column, columnIndex) => {
                    const key = `${columnIndex}-placedFolder`;
                    return (
                      <div
                        key={key}
                        style={{
                          height: METER_UNITS.folder_height,
                          width: METER_UNITS.folder_width,
                          margin: childrenMargin,
                          position: 'relative',
                          flex: `0 0 ${METER_UNITS.folder_width}px`,
                          backgroundColor: 'rgba(0, 125, 255, 0.3)',
                          borderRadius: 10,
                        }}
                      >
                        {!columnIndex && (
                          <Grid
                            container
                            alignItems="center"
                            justify="center"
                            className={classes.folderTitle}
                            style={{ left: headerLeft }}
                          >
                            <img src={this.getMicrobitLogo(folder.color)} alt="microbit logo" className={classes.microbitLogo} />
                            <br />
                            <span
                              className={classes.folderTitleSpan}
                            >
                              {truncateText(folder.name, 9)}
                            </span>
                            <Button
                              onClick={() => handleUnfoldButtonClick(index, buildingIndex, folder.name)}
                              className={classes.foldBtn}
                            >
                              <img src={foldIn} alt="fold" className={classes.foldBtnIcon} />
                            </Button>
                          </Grid>
                        )}
                        <FloorPlanMeter
                          inFolder
                          name={column.name}
                          folderName={folder.name}
                          meterData={column.values}
                          sensorType={column.type}
                          size={{
                            width: METER_UNITS.folder_width,
                            height: METER_UNITS.folder_height,
                          }}
                          onDragStop={onDragSensorStop(index, buildingIndex)}
                          onDragStart={onDragSensorStart(buildingIndex)}
                          disableDragging={!map || readonly}
                          sensorStartTime={moment(folder.time)}
                          historyValue={historyValue}
                          periodDuration={periodDuration}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </React.Fragment>
          );
        })}
      </DragAndDrop>
    );
  };

  render() {
    const {
      classes,
      map,
      buildingIndex,
    } = this.props;

    const { size, ratio, isThermometerShown } = this.state;

    return (
      <div>
        <Grid container alignItems="center" justifyContent="center" style={{ position: 'relative' }}>
          <Grid
            container
            id={`${MAP_CONTAINER_WRAPPER_ID}-${buildingIndex}`}
            item
            xs={12}
            className={classes.mapContainerWrapper}
          >
            {size ? (
              <Resizable
                ref={(node) => { this.resizable = node; }}
                enable={(this.isMobile || !map) ? DISABLE_RESIZING : ENABLE_RESIZING}
                lockAspectRatio={ratio}
                handleComponent={{ left: () => (<SwapVert className={classes.resizeIcon} />) }}
                handleClasses={{
                  left: classes.resizeHandleBlock,
                }}
                handleStyles={{
                  topLeft: {
                    display: 'none',
                  },
                  left: {
                    display: (this.isMobile || !map) ? 'none' : 'block',
                    top: 5,
                    left: 5,
                    width: 36,
                    height: 36,
                    userSelect: 'auto',
                    cursor: 'col-resize',
                  },
                }}
                defaultSize={{ width: size.width, height: size.height }}
                minWidth={600}
                maxWidth="100%"
                minHeight={450}
                style={{ margin: 'auto' }}
                onResizeStop={() => {
                  this.update();
                }}
              >
                <div id={`map-${buildingIndex}`} className={classes.mapContainer}>
                  <div
                    id={`${PANZOOM_IDS.container}-${buildingIndex}`}
                    className={classes.mapWrapper}
                    style={{
                      backgroundImage: this.getBgImage(map),
                    }}
                  >
                    {this.renderCanvas()}
                  </div>
                  {!this.isMobile && (
                    <div style={{ visibility: map ? 'visible' : 'hidden' }} className={classes.zoomButtonsContainer}>
                      <Button id={`${PANZOOM_IDS.zoomOutButton}-${buildingIndex}`} className={classes.zoomButton}>
                        &ndash;
                      </Button>
                      <Button id={`${PANZOOM_IDS.zoomInButoon}-${buildingIndex}`} className={classes.zoomButton}>
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </Resizable>
            ) : null}
          </Grid>
          {isThermometerShown ? (
            <div className={classes.thermometerWrapper}>
              <img src={thermometer} alt="thermometer icon" className={classes.thermometerIcon} />
              <Button onClick={this.toggleThermometer} className={classes.thermometerButton}>HIDE</Button>
            </div>
          ) : (
            <Button
              onClick={this.toggleThermometer}
              className={classes.thermometerButton}
              style={{
                backgroundColor: '#00BCD4',
                color: 'white',
                padding: '0 35px',
                boxShadow: '0px 1px 5px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 3px 1px -2px rgb(0 0 0 / 12%)',
              }}
            >
              Show temp. colour scheme
            </Button>
          )}
        </Grid>
      </div>
    );
  }
}

LocationMap.propTypes = {
  classes: PropTypes.object.isRequired,
  floor: PropTypes.object.isRequired,
  building: PropTypes.object.isRequired,
  buildingIndex: PropTypes.number.isRequired,
  getMicrobitImage: PropTypes.func.isRequired,
  handleUnfoldButtonClick: PropTypes.func.isRequired,
  map: PropTypes.string.isRequired,
  handleDrop: PropTypes.func,
  historyValue: PropTypes.number,
  periodDuration: PropTypes.number,
  readonly: PropTypes.bool.isRequired,
  onDragSensorStop: PropTypes.func,
  onDragSensorStart: PropTypes.func,
};

LocationMap.defaultProps = {
  historyValue: null,
  periodDuration: null,
  handleDrop: () => {},
  onDragSensorStop: () => {},
  onDragSensorStart: () => {},
};

export default compose(
  withStyles(styles),
)(LocationMap);
