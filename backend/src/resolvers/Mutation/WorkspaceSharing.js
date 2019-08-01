const { checkAccess, Role, Privilege, privilegeToChar } = require('../../accessControl')

const secretCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const makeSecret = length => Array.from({ length },
  () => secretCharset[Math.floor(Math.random() * secretCharset.length)]).join('')

const WorkspaceSharingMutations = {
  async createWorkspaceToken(root, { workspaceId, privilege }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.createWorkspaceToken({
      id: `w${privilegeToChar(privilege)}${makeSecret(23)}`,
      privilege,
      workspace: {
        connect: { id: workspaceId }
      },
      revoked: false
    })
  },
  async createProjectToken(root, { projectId, privilege }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      projectId
    })
    return await context.prisma.createProjectToken({
      id: `p${privilegeToChar(privilege)}${makeSecret(23)}`,
      privilege,
      project: {
        connect: { id: projectId }
      },
      revoked: false
    })
  },
  async deleteToken(root, { id }, context) {
    // TODO revoke instead of deleting
    if (id[0] === 'w') {
      const { id: workspaceId } = await context.prisma.workspaceToken({ id }).workspace()
      await checkAccess(context, {
        minimumRole: Role.GUEST,
        minimumPrivilege: Privilege.OWNER,
        workspaceId
      })
      return await context.prisma.deleteWorkspaceToken({
        id
      })
    } else if (id[0] === 'p') {
      const { id: projectId } = await context.prisma.projectToken({ id }).project()
      await checkAccess(context, {
        minimumRole: Role.GUEST,
        minimumPrivilege: Privilege.OWNER,
        projectId
      })
      return await context.prisma.deleteProjectToken({
        id
      })
    }
  },
  async useToken(root, { id }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST
    })
    if (id[0] === 'w') {
      const privilege = await context.prisma.workspaceToken({ id }).privilege()
      const workspace = await context.prisma.workspaceToken({ id }).workspace()
      return await context.prisma.createWorkspaceParticipant({
        privilege,
        workspace: { connect: { id: workspace.id } },
        user: { connect: { id: context.user.id } },
        token: { connect: { id } }
      })
    } else if (id[0] === 'p') {
      const privilege = await context.prisma.projectToken({ id }).privilege()
      const project = await context.prisma.projectToken({ id }).project()
      return await context.prisma.createProjectParticipant({
        privilege,
        project: { connect: { id: project.id } },
        user: { connect: { id: context.user.id } },
        token: { connect: { id } }
      })
    } else {
      throw Error('invalid share token')
    }
  }
}

module.exports = WorkspaceSharingMutations