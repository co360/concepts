import { gql } from 'apollo-boost'

const COURSES_BY_WORKSPACE = gql`
query coursesByWorkspace($workspaceId: ID!) {
  coursesByWorkspace(workspaceId: $workspaceId) {
    id
    name
    concepts {
      id
      name
    }
  }
}
`

const COURSE_BY_ID = gql`
query courseById($id: ID!) {
  courseById(id: $id) {
    id
    name
    concepts {
      id
      name
      description
      official
      courses {
          id
      }
      linksFromConcept {
        id
        official
        to {
          id
        }
      }
      linksToConcept {
        id
        official
        from {
          id
        }
      }
    }
  }
}
`

const COURSE_PREREQUISITES = gql`
query courseAndPrerequisites($courseId: ID!) {
  courseAndPrerequisites(courseId: $courseId) {
    id
    name
    linksToCourse {
      id
      from {
        id
        name
        concepts {
          id
          name
          description
          official
          linksFromConcept {
            id
            official
            to {
              id
            }
          }
          linksToConcept {
            id
            official
            from {
              id
            }
          }
        }
      }
    }
  }
}
`

export {
  COURSES_BY_WORKSPACE,
  COURSE_BY_ID,
  COURSE_PREREQUISITES
}
