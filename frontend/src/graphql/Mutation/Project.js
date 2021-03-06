import gql from 'graphql-tag'

const CREATE_PROJECT = gql`
mutation createProject($name: String!) {
  createProject(name: $name) {
    id
    name
  }
}
`

const UPDATE_PROJECT = gql`
mutation updateProject($id: ID!, $name: String!) {
  updateProject(id: $id, name: $name) {
    id
    name
  }
}
`

const DELETE_PROJECT = gql`
mutation deleteProject($id: ID!, $deleteWorkspaces: Boolean!) {
  deleteProject(id: $id, deleteWorkspaces: $deleteWorkspaces) {
    id
  }
}
`

const SET_ACTIVE_TEMPLATE = gql`
mutation setActiveTemplate($projectId: ID!, $workspaceId: ID!) {
  setActiveTemplate(projectId: $projectId, workspaceId: $workspaceId) {
    id
    activeTemplate {
      id
      name
      courses {
        id
        name
      }
      pointGroups {
        id
        name
        startDate
        endDate
        maxPoints
        pointsPerConcept
        course {
          id
        }
      }
      mainCourse {
        id
      }
    }
  }
}
`

const PROMOTE_MERGE = gql`
mutation promoteMerge($projectId: ID!, $workspaceId: ID!) {
  promoteMerge(projectId: $projectId, workspaceId: $workspaceId) {
    id
    asMerge {
      id
    }
    asTemplate {
      id
    }
  }
}
`

export {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  SET_ACTIVE_TEMPLATE,
  PROMOTE_MERGE
}
