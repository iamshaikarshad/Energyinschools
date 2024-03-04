import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

import ContentCopyIcon from '@material-ui/icons/FilterNone';

import LessonCard from './LessonCard';

import lessonArts from '../../images/lesson_arts/lessonArts';

import listItemImage from '../../images/list_item_blue.svg';

const styles = theme => ({
  button: {
    fontSize: 12,
    backgroundColor: 'rgb(0, 188, 212)',
    color: 'rgb(255, 255, 255)',
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 0.7)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
      padding: '4px 8px',
    },
  },
  copyIcon: {
    fontSize: 16,
    marginLeft: theme.spacing(1),
    color: 'rgba(0, 188, 212, 0.7)',
    verticalAlign: 'sub',
    cursor: 'pointer',
  },
  selectIcon: {
    position: 'absolute',
    top: '50%',
    left: '-25px',
    transform: 'translateY(-50%)',
    height: 37,
    width: 45,
    overflow: 'visible',
    [theme.breakpoints.down('xs')]: {
      left: '-12px',
      height: 25,
      width: 32,
    },
  },
  headerDividerRoot: {
    marginTop: 8,
  },
  propsContentContainer: {
    padding: 24,
    [theme.breakpoints.down('md')]: {
      paddingBottom: 0,
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: 8,
    },
  },
  propRow: {
    width: '100%',
    marginTop: 16,
  },
  propName: {
    fontSize: 16,
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  block: {
    display: 'block',
    wordWrap: 'break-word',
  },
  propValue: {
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
    '& p': {
      margin: 0,
    },
  },
  propValueWithTab: {
    marginLeft: 16,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 8,
    },
  },
  rightContentContainer: {
    minHeight: 300,
    justifyContent: 'center',
    paddingTop: 16,
    [theme.breakpoints.down('md')]: {
      marginTop: 32,
      paddingTop: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
      minHeight: 0,
    },
  },
  rightContentContainerDecreasedMargin: {
    [theme.breakpoints.down('md')]: {
      marginTop: 16,
      paddingTop: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 24,
      minHeight: 0,
    },
  },
  avatarContainer: {
    height: '70%',
    minHeight: 150,
  },
  avatarRoot: {
    height: '100%',
    width: 'auto',
    minWidth: '20%',
    maxWidth: '80%',
    borderRadius: 0,
  },
  avatarImage: {
    objectFit: 'contain', // don't use 'fill' as it is not working in MS Edge
  },
  downloadButtonContainer: {
    height: '30%',
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
      marginTop: 24,
      marginBottom: 24,
    },
  },
  listsContainer: {
    padding: '0px 24px',
    margin: '16px 0px',
    [theme.breakpoints.down('xs')]: {
      padding: '0px 12px',
      margin: '8px 0px',
    },
  },
  listItemHeader: {
    width: '100%',
    backgroundColor: 'rgb(244, 143, 48)',
    borderRight: '1px solid rgba(255, 255, 255, 0.5)',
    height: 40,
    lineHeight: '40px',
    color: 'rgb(255, 255, 255)',
    fontWeight: 500,
    fontSize: 16,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  listItemAvatarRoot: {
    minWidth: 8,
    marginRight: 8,
  },
  listItemAvatar: {
    width: 16,
    height: 16,
    [theme.breakpoints.down('xs')]: {
      width: 14,
      height: 14,
    },
  },
  listItemTextPrimary: {
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  htmlContentContainer: {
    padding: '8px 32px',
  },
  content: {
    fontSize: 16,
    lineHeight: 1.5,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
    },
  },
  clickable: {
    cursor: 'pointer',
  },
});

const createMarkup = templateString => ({ __html: templateString });

const getLessonDefaultImage = (imgsArr, lessonListIndex) => {
  const imgsCount = Array.isArray(imgsArr) ? imgsArr.length : null;
  if (!imgsCount || isNil(lessonListIndex)) return '';
  const rest = Math.max(0, lessonListIndex % imgsCount);
  return imgsArr[rest];
};

const INFO_ITEM_DISPLAY_VARIANT = Object.freeze({
  inline: 'inline',
  block: 'block',
});

const HEADER_PRIMARY_INFO_ITEMS = [
  {
    dataProp: 'title',
    displayName: 'Name',
    displayVariant: INFO_ITEM_DISPLAY_VARIANT.inline,
  },
  {
    dataProp: 'duration',
    displayName: 'Time',
    displayVariant: INFO_ITEM_DISPLAY_VARIANT.inline,
  },
  {
    dataProp: 'overview',
    displayName: 'Overview',
    displayVariant: INFO_ITEM_DISPLAY_VARIANT.block,
  },
  {
    dataProp: 'key_information',
    displayName: 'Key Information',
    displayVariant: INFO_ITEM_DISPLAY_VARIANT.block,
  },
  {
    dataProp: 'lesson_topics',
    displayName: 'Lesson Topics',
    displayVariant: INFO_ITEM_DISPLAY_VARIANT.block,
  },
];

const HEADER_LISTS = [
  {
    dataProp: 'lesson_objectives',
    displayName: 'Lesson Objectives',
  },
  {
    dataProp: 'success_criteria',
    displayName: 'Success Criteria',
  },
];

const EXPAND_BUTTON_LABEL = Object.freeze({
  true: 'Hide details',
  false: 'Show details',
});

// the next constants need for temporary workaround as we don't have needed props from server response

const DATA_PROP_WITH_VARIABLE_DISPLAY_NAME = Object.freeze({
  lesson_objectives: 'lesson_objectives',
  lesson_topics: 'lesson_topics',
});

const DATA_PROPS_WITH_VARIABLE_DISPLAY_NAME = Object.values(DATA_PROP_WITH_VARIABLE_DISPLAY_NAME);

const ITEM_VARIABLE_PROP_NAME_MAP = Object.freeze({
  [DATA_PROP_WITH_VARIABLE_DISPLAY_NAME.lesson_objectives]: {
    activity: 'Activity Objectives',
  },
  [DATA_PROP_WITH_VARIABLE_DISPLAY_NAME.lesson_topics]: {
    activity: 'Activity Topics',
  },
});

const getItemPropDisplayName = (item, lessonLabel) => {
  const { dataProp, displayName } = item;
  if (!DATA_PROPS_WITH_VARIABLE_DISPLAY_NAME.includes(dataProp)) return displayName;
  switch (dataProp) {
    case DATA_PROP_WITH_VARIABLE_DISPLAY_NAME.lesson_objectives:
    case DATA_PROP_WITH_VARIABLE_DISPLAY_NAME.lesson_topics:
      if (lessonLabel && lessonLabel.toLowerCase().includes('activity')) return ITEM_VARIABLE_PROP_NAME_MAP[dataProp].activity || displayName;
      return displayName;
    default:
      return displayName;
  }
};

function Lesson(props) {
  const [expanded, setExpanded] = React.useState(false);
  const {
    classes, lessonData, listIndex, copyLink, downloadData, showMessageSnackbar,
  } = props;

  const showHeaderListsContainer = HEADER_LISTS
    .map((list) => {
      const listData = lessonData[list.dataProp];
      return Array.isArray(listData) ? listData.length : 0;
    })
    .some(item => item > 0);

  const showDownloadButton = Boolean(lessonData.plan_material);

  // the next constants need for temporary workaround as we don't have needed props from server response

  const useShortView = (!lessonData.key_information && !lessonData.lesson_topics && !lessonData.overview && !lessonData.duration);

  const toggleExpandHandler = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const onPrimaryButtonClick = useShortView ? downloadData : toggleExpandHandler;

  const primaryButtonLabel = useShortView ? 'Download' : EXPAND_BUTTON_LABEL[expanded];

  const onLessonCardClick = useShortView ? undefined : toggleExpandHandler;

  const { lesson_label: lessonLabel } = lessonData;

  return (
    <LessonCard
      classes={{
        root: classNames({ [classes.clickable]: !useShortView }),
      }}
      subTitle={
        (
          <div>
            {lessonLabel}
            <ContentCopyIcon className={classes.copyIcon} onClick={copyLink} />
          </div>
        )
      }
      title={lessonData.title}
      overview={lessonData.description}
      primaryButtonLabel={primaryButtonLabel}
      onPrimaryButtonClick={onPrimaryButtonClick}
      onCardClick={onLessonCardClick}
    >
      {expanded && (
        <React.Fragment>
          <Divider component="li" classes={{ root: classes.headerDividerRoot }} />
          <Grid item container xs={12} className={classes.propsContentContainer}>
            <Grid item container xs={12}>
              <Grid item container xs={12} lg={6}>
                {HEADER_PRIMARY_INFO_ITEMS.map((item) => {
                  const isBlock = item.displayVariant === INFO_ITEM_DISPLAY_VARIANT.block;
                  return (
                    <Typography key={item.dataProp} className={classes.propRow}>
                      <span className={classNames(classes.propName, { [classes.block]: isBlock })}>{getItemPropDisplayName(item, lessonLabel)}: &nbsp;</span>
                      <span
                        className={classNames(classes.propValue, { [classes.block]: isBlock, [classes.propValueWithTab]: isBlock })}
                        dangerouslySetInnerHTML={createMarkup(lessonData[item.dataProp])} // eslint-disable-line react/no-danger
                      />
                    </Typography>
                  );
                })
                }
              </Grid>
              <Grid
                item
                container
                xs={12}
                lg={6}
                direction="column"
                wrap="nowrap"
                className={classNames(classes.rightContentContainer, { [classes.rightContentContainerDecreasedMargin]: !showDownloadButton })}
              >
                <Hidden xsDown>
                  <Grid item container justify="center" alignItems="center" className={classes.avatarContainer}>
                    <Avatar
                      src={lessonData.lesson_avatar || getLessonDefaultImage(lessonArts, listIndex)}
                      alt="Lesson avatar"
                      classes={{ root: classes.avatarRoot, img: classes.avatarImage }}
                      imgProps={{
                        onError: (e) => {
                          e.target.src = getLessonDefaultImage(lessonArts, listIndex);
                          showMessageSnackbar(`Lesson ${lessonData.title} avatar is broken! Changed it to default avatar`, 5000);
                        },
                      }}
                    />
                  </Grid>
                </Hidden>
                {showDownloadButton && (
                  <Grid item container justify="center" alignItems="center" className={classes.downloadButtonContainer}>
                    <Button variant="contained" className={classes.button} onClick={downloadData}>
                      Download materials
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
          {showHeaderListsContainer && (
            <Grid item container xs={12} className={classes.listsContainer}>
              {
                HEADER_LISTS.map((list) => {
                  const listItems = lessonData[list.dataProp] || [];
                  if (!listItems.length) return null;
                  return (
                    <Grid key={list.dataProp} item container xs={12} lg alignContent="flex-start">
                      <Typography component="div" className={classes.listItemHeader}>
                        {getItemPropDisplayName(list, lessonLabel)}
                      </Typography>
                      <List>
                        {listItems.map((listItem, index) => (
                          <ListItem key={listItem + index}> {/* eslint-disable-line react/no-array-index-key */}
                            <ListItemAvatar classes={{ root: classes.listItemAvatarRoot }}>
                              <Avatar src={listItemImage} alt="list item image" className={classes.listItemAvatar} />
                            </ListItemAvatar>
                            <ListItemText primary={listItem} classes={{ primary: classes.listItemTextPrimary }} />
                          </ListItem>
                        ))
                        }
                      </List>
                    </Grid>
                  );
                })
              }
            </Grid>
          )}
          {lessonData.content && (
            <Grid item container className={classes.htmlContentContainer}>
              <Grid item container xs={12}>
                <Typography component="div" className={classes.content} dangerouslySetInnerHTML={createMarkup(lessonData.content)} />
              </Grid>
            </Grid>
          )}
        </React.Fragment>
      )
      }
    </LessonCard>
  );
}

Lesson.propTypes = {
  classes: PropTypes.object.isRequired,
  lessonData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    lesson_label: PropTypes.string,
    session_number: PropTypes.number.isRequired,
    content: PropTypes.string,
    plan_material: PropTypes.string,
    duration: PropTypes.string,
    overview: PropTypes.string,
    key_information: PropTypes.string,
    lesson_topics: PropTypes.string,
    lesson_objectives: PropTypes.arrayOf(PropTypes.string),
    success_criteria: PropTypes.arrayOf(PropTypes.string),
    lesson_group: PropTypes.number,
    lesson_avatar: PropTypes.string,
  }).isRequired,
  listIndex: PropTypes.number.isRequired,
  downloadData: PropTypes.func.isRequired,
  copyLink: PropTypes.func.isRequired,
  showMessageSnackbar: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(Lesson);
