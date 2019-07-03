const { checkAccess } = require('../../accessControl')

const WorkspaceMutations = {
  async createWorkspace(root, args, context) {
    checkAccess(context, { allowStudent: true, allowStaff: true })
    let data = {
      name: args.name,
      owner: {
        connect: { id: context.user.id }
      }
    }
    if (args.projectId !== undefined) {
      data.project = {
        connect: { id: args.projectId }
      }
    }
    return await context.prisma.createWorkspace(data)
  },
  async deleteWorkspace(root, args, context) {
    const owner = await context.prisma.workspace({
      id: args.id
    }).owner()
    checkAccess(context, { allowStudent: true, allowStaff: true, verifyUser: true, userId: owner.id })
    return context.prisma.deleteWorkspace({ id: args.id })
  },
  async updateWorkspace(root, { id, name }, context) {
    const owner = await context.prisma.workspace({ id }).owner()
    checkAccess(context, { allowStaff: true, allowStudent: true, verifyUser: true, userId: owner.id })
    return context.prisma.updateWorkspace({
      where: { id },
      data: { name }
    })
  },
  async addDefaultCourseForWorkspace(root, args, context) {
    return await context.prisma.updateWorkspace({
      where: {
        id: args.workspaceId
      },
      data: {
        defaultCourse: {
          connect: { id: args.courseId }
        }
      }
    })
  },
  async createGuestWorkspace(root, args, context) {
    return await context.prisma.createWorkspace({
      name: args.name,
      public: true
    })
  }
}

module.exports = WorkspaceMutations