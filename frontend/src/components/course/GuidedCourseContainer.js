import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Course from './Course'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import { useMutation, useApolloClient } from 'react-apollo-hooks'
import { UPDATE_CONCEPT, CREATE_CONCEPT } from '../../graphql/Mutation'

import { COURSE_PREREQUISITES } from '../../graphql/Query'

import ConceptAdditionDialog from '../concept/ConceptAdditionDialog'
import ConceptEditingDialog from '../concept/ConceptEditingDialog'
import CourseEditingDialog from './CourseEditingDialog'

import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'

import Masonry from './Masonry'

import { updateConceptUpdate } from '../../apollo/update'

import { useLoginStateValue } from '../../store'

const styles = theme => ({
  snackbar: {
    margin: theme.spacing(4)
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  infoIcon: {
    marginRight: theme.spacing(1)
  },
  icon: {
    fontSize: 20
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
})

const CONCEPT_ADDING_INSTRUCTION = 'Add concept as a learning objective in the left column.'
const COURSE_ADDING_INSTRUCTION = 'To add prerequisites, open the drawer on the right.'
const CONCEPT_LINKING_INSTRUCTION = 'Switch on a learning objective on the left to start linking prerequisites.'

const GuidedCourseContainer = ({
  classes,
  onClick,
  courseTrayOpen, setCourseTrayOpen,
  activeCourse, updateCourse, courses,
  activeConceptIds,
  addingLink, setAddingLink,
  doRedrawLines,
  workspaceId, courseId
}) => {
  const [courseState, setCourseState] = useState({ open: false, id: '', name: '' })
  const [conceptState, setConceptState] = useState({ open: false, id: '' })
  const [conceptEditState, setConceptEditState] = useState({ open: false, conceptId: '', name: '', description: '', courseId: '' })

  const [conceptInfoState, setConceptInfoState] = useState(false)
  const [courseInfoState, setCourseInfoState] = useState(false)
  const [linkInfoState, setLinkInfoState] = useState(false)

  const { loggedIn } = useLoginStateValue()[0]

  useEffect(() => {
    if (activeCourse.concepts.length === 0) {
      setConceptInfoState(true)
      setCourseInfoState(false)
      setCourseTrayOpen(false)
      setLinkInfoState(false)
    } else if (courses.length === 0) {
      setConceptInfoState(false)
      setLinkInfoState(false)
      setCourseInfoState(true)
    } else if (courses.length > 0) {
      setLinkInfoState(true)
      setConceptInfoState(false)
      setCourseInfoState(false)
    } else {
      setConceptInfoState(false)
      setCourseInfoState(false)
    }
  }, [activeCourse.concepts.length, courses.length, setCourseTrayOpen])

  const client = useApolloClient()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const updateConcept = useMutation(UPDATE_CONCEPT, {
    update: updateConceptUpdate(activeCourse.id, workspaceId, conceptEditState.courseId)
    // refetchQueries: [{ query: COURSE_PREREQUISITES }]
  })

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: COURSE_PREREQUISITES, variables: { courseId, workspaceId } })
      const addedConcept = response.data.createConcept
      const dataInStoreCopy = { ...dataInStore }
      const courseLink = dataInStoreCopy.courseAndPrerequisites.linksToCourse.find(link => link.from.id === conceptState.id)
      const course = courseLink.from
      if (!includedIn(course.concepts, addedConcept)) {
        course.concepts.push(addedConcept)
        client.writeQuery({
          query: COURSE_PREREQUISITES,
          variables: { courseId, workspaceId },
          data: dataInStoreCopy
        })
      }
    }
  })

  const handleCourseClose = () => {
    setCourseState({ open: false, id: '', name: '' })
  }

  const handleCourseOpen = (id, name) => () => {
    setCourseState({ open: true, id, name })
  }

  const handleConceptClose = () => {
    setConceptState({ ...conceptState, open: false, id: '' })
  }

  const handleConceptOpen = (courseId) => () => {
    setConceptState({ open: true, id: courseId })
  }

  const handleConceptEditClose = () => {
    setConceptEditState({ open: false, conceptId: '', name: '', description: '', courseId: '' })
  }

  const handleConceptEditOpen = (conceptId, name, description, courseId) => () => {
    setConceptEditState({ open: true, conceptId, name, description, courseId })
  }

  const handleConceptInfoClose = () => {
    setConceptInfoState(false)
  }

  const handleCourseInfoClose = () => {
    setCourseInfoState(false)
  }

  const handleLinkInfoClose = () => {
    setLinkInfoState(false)
  }

  return (
    <>
      <Grid onClick={onClick} container item xs={courseTrayOpen ? 4 : 8} lg={courseTrayOpen ? 6 : 9}>
        <Grid item>
          <Typography style={{ margin: '2px 0px 0px 10px' }} variant='h4'>Prerequisites</Typography>
        </Grid>
        {
          courses && courses.length !== 0 ?
            <Grid container item>
              <div style={{ overflowY: 'auto', width: '100%', height: '85vh',
              display: 'flex', flexDirection: 'column', alignItems: 'space-evenly'}}>
                {courses && <Masonry courseTrayOpen={courseTrayOpen}>
                  {courses.map(course =>
                    <Course
                      key={course.id}
                      course={course}
                      activeConceptIds={activeConceptIds}
                      addingLink={addingLink}
                      setAddingLink={setAddingLink}
                      openCourseDialog={handleCourseOpen}
                      openConceptDialog={handleConceptOpen}
                      openConceptEditDialog={handleConceptEditOpen}
                      activeCourseId={courseId}
                      workspaceId={workspaceId}
                    />
                  )}
                </Masonry>}
              </div>
            </Grid>
            :
            null
        }
      </Grid>

      {/* Dialogs */}

      <CourseEditingDialog
        state={courseState}
        handleClose={handleCourseClose}
        updateCourse={updateCourse}
        defaultName={courseState.name}
      />
      <ConceptAdditionDialog
        state={conceptState}
        handleClose={handleConceptClose}
        createConcept={createConcept}
        workspaceId={workspaceId}
      />
      <ConceptEditingDialog
        state={conceptEditState}
        handleClose={handleConceptEditClose}
        updateConcept={updateConcept}
        defaultDescription={conceptEditState.description}
        defaultName={conceptEditState.name}
      />

      {/* Intruction snackbars */}
      {loggedIn ?
        <React.Fragment>
          <Snackbar open={conceptInfoState}
            onClose={handleConceptInfoClose}
            className={classes.snackbar}
            ClickAwayListenerProps={{ onClickAway: () => null }}
            ContentProps={{
              'aria-describedby': 'message-id'
            }}
          >
            <SnackbarContent className={classes.info}
              action={[
                <IconButton
                  key='close'
                  aria-label='Close'
                  color='inherit'
                  onClick={handleConceptInfoClose}
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>
              ]}
              message={
                <span className={classes.message} id='message-id'>
                  <InfoIcon className={classes.infoIcon} />
                  {CONCEPT_ADDING_INSTRUCTION}
                </span>}
            />
          </Snackbar>
          <Snackbar open={courseInfoState}
            onClose={handleCourseInfoClose}
            ClickAwayListenerProps={{ onClickAway: () => null }}
            className={classes.snackbar}
            ContentProps={{
              'aria-describedby': 'message-id'
            }}
          >
            <SnackbarContent className={classes.info}
              action={[
                <IconButton
                  key='close'
                  aria-label='Close'
                  color='inherit'
                  onClick={handleCourseInfoClose}
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>
              ]}
              message={
                <span className={classes.message} id='message-id'>
                  <InfoIcon className={classes.infoIcon} />
                  {COURSE_ADDING_INSTRUCTION}
                </span>}
            />
          </Snackbar>
          <Snackbar open={linkInfoState}
            onClose={handleLinkInfoClose}
            ClickAwayListenerProps={{ onClickAway: () => null }}
            autoHideDuration={6000}
            className={classes.snackbar}
            ContentProps={{
              'aria-describedby': 'message-id'
            }}
          >
            <SnackbarContent className={classes.info}
              action={[
                <IconButton
                  key='close'
                  aria-label='Close'
                  color='inherit'
                  onClick={handleLinkInfoClose}
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>
              ]}
              message={
                <span className={classes.message} id='message-id'>
                  <InfoIcon className={classes.infoIcon} />
                  {CONCEPT_LINKING_INSTRUCTION}
                </span>}
            />
          </Snackbar>
        </React.Fragment>
        : null
      }
    </>
  )
}

export default withStyles(styles)(GuidedCourseContainer)
