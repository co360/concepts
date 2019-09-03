import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery, useMutation } from 'react-apollo-hooks'
import { TextField, MenuItem } from '@material-ui/core'

import { PROJECT_BY_ID } from '../../../graphql/Query'
import { CREATE_POINTGROUP, UPDATE_POINTGROUP,
  DELETE_POINTGROUP, UPDATE_TEMPLATE_WORKSPACE
} from '../../../graphql/Mutation'
import NotFoundView from '../../error/NotFoundView'
import LoadingBar from '../../../components/LoadingBar'
import EditableTable from './EditableTable'
import { useMessageStateValue } from '../../../store'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto'
  }
}))

const PointGroupsView = ({ projectId }) => {
  const classes = useStyles()
  const [, messageDispatch] = useMessageStateValue()

  const projectQuery = useQuery(PROJECT_BY_ID, {
    variables: { id: projectId }
  })

  const createPointGroup = useMutation(CREATE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const updatePointGroup = useMutation(UPDATE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const deletePointGroup = useMutation(DELETE_POINTGROUP, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const setMainCourse = useMutation(UPDATE_TEMPLATE_WORKSPACE, {
    refetchQueries: [
      { query: PROJECT_BY_ID, variables: { id: projectId } }
    ]
  })

  const columns = [
    { title: 'Group', field: 'name', type: 'text', minWidth: '80px' },
    { title: 'Start date', field: 'startDate', type: 'date', minWidth: '80px' },
    { title: 'End date', field: 'endDate', type: 'date', minWidth: '80px' },
    { title: 'Max points', field: 'maxPoints', type: 'number', min: '0', minWidth: '40px' },
    {
      title: 'Points per concept',
      field: 'pointsPerConcept',
      type: 'number',
      step: '0.1',
      min: '0.0',
      minWidth: '40px'
    }
  ]

  if (projectQuery.loading) {
    return <LoadingBar id='project-manager-view' />
  } else if (projectQuery.error) {
    return <NotFoundView message='Project not found' />
  }

  const activeTemplate = projectQuery.data.projectById
                      && projectQuery.data.projectById.activeTemplate
  const mainCourse = activeTemplate && activeTemplate.mainCourse
  const disabled = !activeTemplate || (
    activeTemplate &&
    activeTemplate.courses &&
    activeTemplate.courses.length === 0
  )
  const editableTableDisabled = disabled || !mainCourse

  const handleMainCourseChange = evt => {
    if (disabled) return
    setMainCourse({
      variables: {
        id: activeTemplate.id,
        courseId: evt.target.value
      }
    }).catch(() => {
      messageDispatch({
        type: 'setError',
        data: 'Access denied'
      })
    })
  }

  const CourseSelector = () => (
    <TextField
      select
      disabled={disabled}
      variant='outlined'
      margin='dense'
      label='Tracking course'
      value={mainCourse ? mainCourse.id : ''}
      style={{ width: '200px' }}
      onChange={handleMainCourseChange}
    >
      {(activeTemplate ? activeTemplate.courses : []).map(course =>
        <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
      )}
    </TextField>
  )

  return (
    <div className={classes.root}>
      <EditableTable
        columns={columns}
        AdditionalAction={CourseSelector}
        disabled={editableTableDisabled}
        createMutation={args => createPointGroup({ variables: {
          workspaceId: activeTemplate && activeTemplate.id,
          courseId: mainCourse && mainCourse.id,
          ...args
        } })}
        updateMutation={args => updatePointGroup({ variables: { ...args } })}
        deleteMutation={args => deletePointGroup({ variables: { ...args } })}
        rows={activeTemplate ? activeTemplate.pointGroups.filter(group =>
          group.course.id === (mainCourse && mainCourse.id)) : []}
      />
    </div>
  )
}

export default PointGroupsView
