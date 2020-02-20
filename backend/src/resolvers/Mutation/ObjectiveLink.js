import { ForbiddenError } from 'apollo-server-core'
import { checkAccess, Role, Privilege } from '../../util/accessControl'
import pubsub from '../Subscription/pubsub'
import { nullShield } from '../../util/errors'
import * as channels from '../Subscription/channels'

const createObjectiveLink = async(root, { objectiveId, courseId, workspaceId, text }, context) => {
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const objective = nullShield(await context.prisma.concept({ id: objectiveId }))
  if (objective.level !== 'OBJECTIVE') {
    throw new ForbiddenError("Can't create objective link to a non-objective concept")
  }

  const createdLink = await context.prisma.createObjectiveLink({
    objective: { connect: { id: objectiveId }},
    course: { connect: { id: courseId }},
    workspace: { connect: { id: workspaceId }},
    createdBy: { connect: { id: context.user.id }},
    text
  })

  pubsub.publish(channels.OBJECTIVE_LINK_CREATED, {
    objectiveLinkCreated: { ...createdLink }
  })

  return createdLink
}

const deleteObjectiveLink = async(root, { id }, context) => {
  const { id: workspaceId } = nullShield(await context.prisma.objectiveLink({ id }).workspace())
  await checkAccess(context, {
    minimumRole: Role.STAFF,
    minimumPrivilege: Privilege.EDIT,
    workspaceId
  })
  const { id: courseId } = await context.prisma.objectiveLink({ id }).course()
  await context.prisma.deleteObjectiveLink({ id })
  const objectiveLinkDeleted = { id, workspaceId, courseId }
  
  pubsub.publish(channels.OBJECTIVE_LINK_DELETED, {
    objectiveLinkDeleted
  })

  return objectiveLinkDeleted
}


export {
  createObjectiveLink,
  deleteObjectiveLink
}