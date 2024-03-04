import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import RootDialog from './RootDialog';
import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

import createNewProject from '../../images/EditorHelpInstructions/create_new_project.png';
import openExistingProject from '../../images/EditorHelpInstructions/open_existing_project.png';
import advancedList from '../../images/EditorHelpInstructions/advanced_list.png';
import extensionsList from '../../images/EditorHelpInstructions/extensions_list.png';

const styles = {
  title: {
    color: NEW_PRIMARY_COLOR,
  },
  button: {
    textTransform: 'lowercase',
    marginLeft: 3,
    padding: '5px 2px 6px 3px',
    color: NEW_PRIMARY_COLOR,
  },
  projectImage: {
    width: 160,
    maxWidth: '100%',
  },
  advancedListImage: {
    width: 100,
    maxWidth: '100%',
  },
  extensionsListImage: {
    width: 350,
    maxWidth: '100%',
  },
  justify: {
    textAlign: 'justify',
  },
  center: {
    textAlign: 'center',
  },
  list: {
    paddingLeft: 20,
  },
};

const EditorHelpDialog = (props) => {
  const {
    classes, onClose, isOpened, goToPage,
  } = props;

  return (
    <RootDialog
      title="Coding editor help"
      onClose={onClose}
      isOpened={isOpened}
      closeLabel="Close"
    >
      <div className={classes.justify}>
        <h3 className={classes.title}>
          You need several extensions to be installed to use Energy in Schools blocks in your project
        </h3>
        <p className={classes.center}>
          To start a New Project with the Energy in Schools blocks
          <Button
            className={classes.button}
            onClick={() => {
              goToPage('/editor/blocks/');
              onClose();
            }}
          >
            Click here
          </Button>
        </p>
        <p className={classes.center}>or</p>
        <p className={classes.center}>You can install the extensions <strong>manually</strong> using tutorial below:</p>
        <ol className={classes.list}>
          <li>
            Firstly, you need to create a new project or open existing one:
            <ul className={classes.list}>
              <li>
                <Grid container direction="column">
                  To create new project, click the &quot;New Project&quot; button on the editor page:
                  <img src={createNewProject} alt="createNewProject" className={classes.projectImage} />
                </Grid>
              </li>
              <li>
                <Grid container direction="column">
                  If you already have created projects, you can open one of them by clicking button with its name:
                  <img src={openExistingProject} alt="openExistingProject" className={classes.projectImage} />
                </Grid>
              </li>
            </ul>
          </li>
          <li>
            Check to see whether the Energy in schools blocks are there.
            These are the School Energy, Weather, Energy Metering and Carbon blocks.
          </li>
          <li>
            <Grid container direction="column">
              If the blocks aren&apos;t there then open the &quot;Advanced&quot; list of blocks,
              and then click the &quot;Extentions&quot; button:
              <img src={advancedList} alt="advancedList" className={classes.advancedListImage} />
            </Grid>
          </li>
          <li>
            <Grid container direction="column">
              Here you should see list of extensions you can install, with search field:
              <img src={extensionsList} alt="extensionsList" className={classes.extensionsListImage} />
              You need to install following extensions:
              <ul className={classes.list}>
                <li><strong>finneyj/energy-in-schools</strong></li>
                <li><strong>neopixel</strong></li>
              </ul>
            </Grid>
          </li>
          <li>
            To install the particular extension you can copy&paste extension name into search field and then click the extension button
          </li>
        </ol>
      </div>
    </RootDialog>
  );
};

EditorHelpDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(EditorHelpDialog);
