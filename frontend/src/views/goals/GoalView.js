import React from 'react'
import { Card, CardHeader, CardContent, makeStyles, ListItemText, List, ListItem, ListItemIcon, IconButton, Tooltip } from '@material-ui/core'
import { ArrowRight as ArrowRightIcon, ArrowLeft as ArrowLeftIcon } from '@material-ui/icons'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import { useQuery } from 'react-apollo-hooks'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header"   56px
                   "courses goals" 1fr
                  / 1fr     1fr`,
    '@media screen and (max-width: 1312px)': {
      width: 'calc(100% - 32px)'
    }
  },
  card: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    gridArea: 'header'
  },
  activeCircle: {
    zIndex: 2,
    padding: '4px'
  },
  circle: {
    zIndex: 2
  }
}))


const CourseItem = ({ name, id }) => {
  const classes = useStyles()

  const onToggle = () => {
    // TODO: implement
  }

  return (
    <ListItem divider>
      <ListItemText>{ name }</ListItemText>
      <ListItemIcon>
        <IconButton
          onClick={onToggle}
          className={classes.activeCircle}
        >
          <ArrowRightIcon
            viewBox='7 7 10 10' id={`course-circle-active-${id}`}
            className='course-circle-active' />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const GoalItem = ({ name, id }) => {
  const classes = useStyles()

  const onToggle = () => {
    // TODO: implement
  }

  return (
    <ListItem divider>
      <ListItemIcon>
        <IconButton
          onClick={onToggle}
          className={classes.activeCircle}
          >
          <ArrowLeftIcon
            viewBox='7 7 10 10' id={`goal-circle-active-${id}`}
            className='goal-circle-active' />
        </IconButton>
      </ListItemIcon>
      <ListItemText>{ name }</ListItemText>
    </ListItem>
  )
}


const Goals = ({ goals }) => {
  const classes = useStyles()

  return (
    <Card elevation={0} className={classes.card}>
    <CardHeader title='Goals'/>
    <CardContent>
      <List>
        {/* MOCK Goals */}
        <GoalItem name="Example Goal" id="12345"/>
        <GoalItem name="Goal 2" id="42345"/>
        <GoalItem name="Goal 6" id="22345"/>
      </List>
    </CardContent>
  </Card>
  )
}

const Courses = ({ courses }) => {
  const classes = useStyles() 

  return (
    <Card elevation={0} className={classes.card}>
      <CardHeader title='Courses'/>
      <CardContent>
        <List>
          {/* MOCK Courses */}
          <CourseItem name="Example course" id="12345"/>
          <CourseItem name="Course 2" id="42345"/>
          <CourseItem name="Course 6" id="22345"/>
        </List>
      </CardContent>
    </Card>
  )
}

const GoalView = ({ workspaceId }) => {
  const classes = useStyles()

  const workspaceQuery = useQuery(WORKSPACE_BY_ID, {
    variables: { id: workspaceId }
  })

  return (
    <div className={classes.root}>
      <h1 className={classes.title}> Goal Mapping </h1>
      <Courses courses={workspaceQuery.data.courses}/>
      <Goals />
    </div>
  )
}

export default GoalView