const { checkAccess, Role, Privilege } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    return await context.prisma.createWorkspace({
      name: args.name,
      sourceProject: args.projectId !== undefined ? {
        connect: { id: args.projectId }
      } : null,
      participants: {
        create: [{
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
        }]
      }
    })
  },
  async deleteWorkspace(root, { id }, context) {
    const asTemplate = await context.prisma.workspace({ id }).asTemplate()
    if (asTemplate) {
      throw new Error('Cannot remove a template')
    }
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId: id
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateWorkspace(root, { id, name }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.EDIT,
      workspaceId: id
    })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },
  async createTemplateWorkspace(root, { name, projectId }, context) {
    await checkAccess(context, { minimumRole: Role.STAFF })
    return await context.prisma.createWorkspace({
      name,
      asTemplate: {
        connect: { id: projectId }
      },
      participants: {
        create: [{
          privilege: 'OWNER',
          user: {
            connect: { id: context.user.id }
          }
        }]
      }
    })
  },
  async deleteTemplateWorkspace(root, { id }, context) {
    const activeTemplate = await context.prisma.workspace({
      id
    }).asTemplate().activeTemplate()
    if (activeTemplate && activeTemplate.id === id) {
      throw new Error('Active template cannot be removed.')
    }
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.OWNER,
      workspaceId: id
    })
    return context.prisma.deleteWorkspace({ id })
  },
  async updateTemplateWorkspace(root, { id, name, active }, context) {
    await checkAccess(context, {
      minimumRole: Role.STAFF,
      minimumPrivilege: Privilege.EDIT,
      workspaceId: id
    })
    const project = await context.prisma.workspace({
      id
    }).asTemplate()
    if (active) {
      await context.prisma.updateProject({
        where: { id: project.id },
        data: {
          activeTemplate: {
            connect: {
              id
            }
          }
        }
      })
    }
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },

  async createWorkspaceParticipant(root, { workspaceId, privilege, userId }, context) {
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.createWorkspaceParticipant({
      privilege,
      workspace: { connect: { id: workspaceId } },
      user: { connect: { id: userId } }
    })
  },
  async updateWorkspaceParticipant(root, { id, privilege }, context) {
    const { id: workspaceId } = await context.prisma.workspaceParticipant({ id }).workspace()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.updateWorkspaceParticipant({
      where: { id },
      data: { privilege }
    })
  },
  async deleteWorkspaceParticipant(root, { id }, context) {
    const { id: workspaceId } = await context.prisma.workspaceParticipant({ id }).workspace()
    const { id: userId } = await context.prisma.workspaceParticipant({ id }).user()
    await checkAccess(context, {
      minimumRole: Role.GUEST,
      minimumPrivilege: userId === context.user.id ? Privilege.READ : Privilege.OWNER,
      workspaceId
    })
    return await context.prisma.deleteWorkspaceParticipant({
      id
    })
  }
}

module.exports = WorkspaceMutations
