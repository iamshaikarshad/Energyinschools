import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import listItemImage from '../../images/list_item_blue.svg';

const styles = {
  root: {
    background: 'rgb(255, 255, 255)',
    padding: '25px 5px',
    maxWidth: '100%',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 900,
    width: '100%',
  },
  subheaderText: {
    fontSize: 20,
    marginBottom: 10,
    paddingLeft: 24,
  },
  articleLists: {
    maxWidth: '100%',
  },
  listSubHeader: {
    color: 'rgb(0, 188, 212)',
    fontSize: 20,
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    background: 'rgb(255, 255, 255)',
    lineHeight: 1.4,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'relative',
  },
  olListRoot: {
    listStyleType: 'lower-alpha',
  },
  listItem: {
    display: 'list-item',
    listStylePosition: 'inside',
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemBlock: {
    alignItems: 'start',
  },
  listItemIconRoot: {
    marginRight: 12,
    minWidth: 0,
  },
  listItemImage: {
    width: 16,
    height: 16,
    position: 'relative',
    top: 7,
  },
  listItemText: {
    textAlign: 'justify',
    overflowWrap: 'break-word',
    fontSize: 15,
  },
};

const SchoolExpectationsAndBenefits = ({ classes }) => (
  <Grid className={classes.root} container justify="center">
    <Grid container className={classes.headerContainer}>
      <Typography className={classes.headerText} align="center">
        Benefits of participation
      </Typography>
    </Grid>
    <Grid container item xs={12}>
      <List className={classes.articleLists}>
        <Typography className={classes.subheaderText}>
          Participating schools will receive a number of benefits.
        </Typography>
        <ListSubheader className={classes.listSubHeader}>Training and software tools:</ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Access to the Energy in Schools platform and the associated suite of energy management tools;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Access to a supported programme of activity for “Energy Champions”
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            A micro:bit energy learning environment consisting of 6 <a href="https://energyinschools.co.uk/lesson-plans">engaging and fun lesson plans</a> designed
            for key stages 2/3 which use energy and IoT sensor data to solve real world problems in alignment with the National
            Curriculum (with focus on STEM subjects).
          </ListItemText>
        </ListItem>
      </List>
    </Grid>
    <Grid container item xs={12}>
      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Equipment:</ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            A dedicated energy screen (Samsung display screen) to be installed in the reception area
            or another common area (only available to limited schools who are supplied by our Energy Supply
            partner Opus Energy or Haven Power). Note that where possible we will use a
            display provided by the school to avoid electronic waste;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The learning environment kit which comprises 20 micro:bit computers and Samsung
            SmartThings kits(only available to limited schools who are supplied by our Energy Supply
            partner Opus Energy or Haven Power);
          </ListItemText>
        </ListItem>
      </List>
    </Grid>
    <Grid container direction="row" className={classes.headerContainer}>
      <Typography className={classes.headerText} align="center">
        Expectations of participant schools
      </Typography>
    </Grid>
    <Grid container item xs={12}>
      <List className={classes.articleLists}>
        <Typography className={classes.subheaderText}>
          There are a number of key requirements for school’s participation. The school should:
        </Typography>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Facilitate installation of the Energy in Schools platform by the school’s IT support contractor.
            We will provide an installation manual and support and installation of the equipment should take one
            person around 0.5 days;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            If the school wishes to have an energy display, the School will be responsible for the
            installation, including and required electrical works;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Use the platform once commissioned. How the school uses the platform is up to you. As a minimum
            the school should use the lesson plans that we provide in some of your classes.
            Ideally you will be able to use all the lesson plans. In some schools where they have the
            platform they have started a project to create an IoT sensor network in the whole school
            using Micro: bits;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Allow the team to deliver a training session to teachers using the learning environment tools;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Allowing the team to deliver training sessions for energy champions – a small number of
            pupils who are keen to take this role will be given training in the champion’s role;
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Consent to a programme of evaluation of the project by both project partners and our government
            appointed Research Evaluation Contractor, IPSOS Mori.
          </ListItemText>
        </ListItem>
        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Evaluation will be in the form of:
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                Ongoing monitoring of the school’s energy use,
              </ListItem>
              <ListItem className={classes.listItem}>
                A short questionnaire on energy issues delivered pre and post EiS platform installation to a sample of pupils and staff,
              </ListItem>
              <ListItem className={classes.listItem}>
                4 short (20 minute) interviews with staff and pupils on energy issues.
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>
      </List>
    </Grid>

  </Grid>
);

SchoolExpectationsAndBenefits.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(SchoolExpectationsAndBenefits);
