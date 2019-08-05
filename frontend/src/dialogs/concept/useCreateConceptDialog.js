import { useMutation } from 'react-apollo-hooks'

import { CREATE_CONCEPT } from '../../graphql/Mutation'
import { COURSE_PREREQUISITES, COURSE_BY_ID } from '../../graphql/Query'
import client from '../../apollo/apolloClient'
import { useDialog } from '../DialogProvider'

const useCreateConceptDialog = (activeCourse, workspaceId, prerequisite = false) => {
  const { openDialog } = useDialog()

  const includedIn = (set, object) =>
    set.map(p => p.id).includes(object.id)

  const createConcept = useMutation(CREATE_CONCEPT, {
    update: prerequisite ? (store, response) => {
      try {
        const dataInStore = store.readQuery({
          query: COURSE_PREREQUISITES,
          variables: { courseId: activeCourse.id, workspaceId }
        })
        const addedConcept = response.data.createConcept
        const dataInStoreCopy = { ...dataInStore }
        const courseLink = dataInStoreCopy.courseAndPrerequisites.linksToCourse.find(link =>
          link.from.id === addedConcept.courses[0].id //  conceptCreateState.id
        )
        const course = courseLink.from
        if (!includedIn(course.concepts, addedConcept)) {
          course.concepts.push(addedConcept)
          client.writeQuery({
            query: COURSE_PREREQUISITES,
            variables: { courseId: activeCourse.id, workspaceId },
            data: dataInStoreCopy
          })
        }
      } catch (error) {}
    }
      :
      (store, response) => {
        const dataInStore = store.readQuery({
          query: COURSE_BY_ID,
          variables: {
            id: activeCourse.id
          }
        })
        const addedConcept = response.data.createConcept
        const dataInStoreCopy = { ...dataInStore }
        const concepts = dataInStoreCopy.courseById.concepts
        if (!includedIn(concepts, addedConcept)) {
          dataInStoreCopy.courseById.concepts.push(addedConcept)
          client.writeQuery({
            query: COURSE_BY_ID,
            variables: {
              id: activeCourse.id
            },
            data: dataInStoreCopy
          })
        }
      }
  })

  return courseId => openDialog({
    mutation: createConcept,
    requiredVariables: {
      workspaceId,
      courseId,
      official: false
    },
    actionText: 'Add concept',
    title: 'Add concept',
    fields: [{
      name: 'name',
      required: true
    }, {
      name: 'description'
    }]
  })
}

export default useCreateConceptDialog
