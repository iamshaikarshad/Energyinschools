import React from 'react';
import PropTypes from 'prop-types';
import TextTruncate from 'react-text-truncate';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import defaultCardAvatar from '../../images/lesson_arts/codeHere.jpg';
import microbitLogo from '../../images/microbit_logo.png';
import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

const styles = theme => ({
  card: {
    height: 480,
    margin: '20px 10px',
    minWidth: 340,
    cursor: 'default',
    borderRadius: 20,
    border: 'none',
    backgroundColor: 'rgb(242, 239, 237)',
    boxShadow: 'none',
    '@media (max-width:1400px)': {
      margin: 20,
    },
    [theme.breakpoints.down('xs')]: {
      margin: '10px 0',
      minWidth: 'auto',
    },
  },
  cardContainer: {
    height: '100%',
  },
  mediaImage: {
    height: '50%',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  microbitImage: {
    width: 110,
  },
  cardContent: {
    height: '50%',
    padding: 25,
    [theme.breakpoints.down('xs')]: {
      padding: '10px 15px 15px',
      '&:last-child': {
        paddingBottom: 15,
      },
    },
  },
  cardButtonContainer: {
    marginTop: 10,
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 600,
    [theme.breakpoints.down('xs')]: {
      margin: 0,
    },
  },
  cardButton: {
    width: 160,
    fontSize: 11,
    height: 32,
    boxShadow: 'none',
    alignSelf: 'flex-end',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    borderRadius: 16,
    color: 'rgb(255, 255, 255)',
    letterSpacing: 'normal',
    textTransform: 'none',
    backgroundColor: `${NEW_PRIMARY_COLOR}e6`,
    '&:hover': {
      backgroundColor: NEW_PRIMARY_COLOR,
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  microbitContainer: {
    width: 120,
    [theme.breakpoints.down('xs')]: {
      margin: '10px 0 0',
    },
  },
  title: {
    fontFamily: 'Lexend',
    fontWeight: 600,
    color: NEW_PRIMARY_COLOR,
    letterSpacing: -1,
    [theme.breakpoints.down('xs')]: {
      fontSize: 21,
    },
  },
  description: {
    flex: 1,
    height: 100,
    overflow: 'hidden',
    fontSize: 16,
    color: 'rgb(0, 0, 0)',
    fontFamily: 'Inter',
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
});

const ProjectsAndActivitiesCard = (props) => {
  const {
    classes, avatar, description, title, materials, downloadMaterials, showMessageSnackbar,
  } = props;

  return (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        alt="Avatar"
        className={classes.mediaImage}
        src={avatar || defaultCardAvatar}
        title={title}
        onError={(e) => {
          e.target.src = defaultCardAvatar;
          showMessageSnackbar('Lesson avatar is broken! Changed it to default avatar!', 5000);
        }}
      />
      <CardContent className={classes.cardContent}>
        <Grid container className={classes.cardContainer} direction="column">
          <Typography gutterBottom variant="h5" component="h2" className={classes.title}>
            <TextTruncate line={2} text={title} />
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" component="div" className={classes.description}>
            {description}
          </Typography>
          <Grid container item justify="space-between" className={classes.cardButtonContainer}>
            <Button
              variant="contained"
              className={classes.cardButton}
              onClick={() => { downloadMaterials(materials); }}
            >
              Download materials
            </Button>
            <Grid container item direction="column" className={classes.microbitContainer}>
              Requirements:
              <CardMedia
                component="img"
                alt="microbit"
                className={classes.microbitImage}
                src={microbitLogo}
              />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

ProjectsAndActivitiesCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  description: PropTypes.string.isRequired,
  materials: PropTypes.string.isRequired,
  downloadMaterials: PropTypes.func.isRequired,
  showMessageSnackbar: PropTypes.func.isRequired,
};

ProjectsAndActivitiesCard.defaultProps = {
  avatar: defaultCardAvatar,
};

export default withStyles(styles)(ProjectsAndActivitiesCard);
