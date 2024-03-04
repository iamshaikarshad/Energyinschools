import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import defaultLessonCategoryCardAvatar from '../../images/lesson_arts/codeHere.jpg';
import LessonPart from './LessonPart';

const styles = theme => ({
  card: {
    width: '100%',
    borderRadius: 16,
    margin: '20px 0',
    boxShadow: 'none',
  },
  cardMedia: {
    height: 340,
    '&::after': {
      display: 'block',
      position: 'relative',
      backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0, #fff 100%)',
      marginTop: '-150px',
      height: 150,
      width: '100%',
      content: '',
    },
  },
  mediaTextOverlay: {
    position: 'absolute',
    bottom: 0,
    paddingTop: 20,
    paddingBottom: 40,
    color: 'white',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(10, 10, 10, 1) 100%)',
    [theme.breakpoints.down('xs')]: {
      paddingBottom: 30,
    },
  },
  lessonNumber: {
    margin: 0,
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 12,
  },
  lessonTitle: {
    margin: '0 20px 20px 20px',
    textAlign: 'center',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    [theme.breakpoints.down('xs')]: {
      fontSize: 26,
    },
  },
  lessonDescription: {
    margin: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'SamsungOne',
    fontSize: 15,
    [theme.breakpoints.down('xs')]: {
      fontSize: 13,
    },
  },
  content: {
    padding: '40px 45px',
    [theme.breakpoints.down('xs')]: {
      padding: 16,
    },
  },
});

class LearningResource extends React.PureComponent {
  render() {
    const {
      classes, index, downloadMaterials, showMessageSnackbar, energyChampionsResource, lesson: {
        title, overview, lesson_plans: lessonPlans, group_avatar: avatar, materials,
      },
    } = this.props;

    return (
      <Card className={classes.card}>
        {!energyChampionsResource && (
          <Grid container style={{ position: 'relative' }}>
            <CardMedia
              component="img"
              alt="Lesson"
              className={classes.cardMedia}
              src={avatar || defaultLessonCategoryCardAvatar}
              title="lesson"
              onError={(e) => {
                e.target.src = defaultLessonCategoryCardAvatar;
                showMessageSnackbar('Lesson avatar is broken! Changed it to default avatar!', 5000);
              }}
            />
            <Grid
              container
              direction="column"
              alignItems="center"
              className={classes.mediaTextOverlay}
            >
              <p className={classes.lessonNumber}>Lesson {index + 1}</p>
              <h1 className={classes.lessonTitle}>{title}</h1>
              <Grid item xs={10} sm={8} md={6} lg={5}>
                <h3 className={classes.lessonDescription}>{overview}</h3>
              </Grid>
            </Grid>
          </Grid>
        )}
        <CardContent className={classes.content}>
          <Grid container alignItems="center" justify="space-between">
            <LessonPart
              energyChampionsResource={energyChampionsResource}
              headerRow
              materials={materials}
              downloadMaterials={downloadMaterials}
              title={title}
              showMessageSnackbar={showMessageSnackbar}
            />
            <Grid container direction="column">
              {lessonPlans && lessonPlans.map(lessonPlan => (
                <LessonPart
                  key={`lesson-${index}-${lessonPlan.id}`}
                  energyChampionsResource={energyChampionsResource}
                  title={lessonPlan.title}
                  description={lessonPlan.description}
                  materials={lessonPlan.plan_material}
                  downloadMaterials={downloadMaterials}
                />
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

LearningResource.propTypes = {
  classes: PropTypes.object.isRequired,
  energyChampionsResource: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  lesson: PropTypes.object.isRequired,
  downloadMaterials: PropTypes.func.isRequired,
  showMessageSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(LearningResource);
