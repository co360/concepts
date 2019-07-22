const { checkAccess } = require('../../accessControl')

async function hackyGetOwner(context, id) {
  const participants = await context.prisma.workspace({ id }).participants()
  return await context.prisma.workspaceParticipant({
    id: participants.filter(pcp => pcp.privilege === 'OWNER')[0].id
  }).user()
}

const CourseQueries = {
  allCourses(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return context.prisma.courses()
  },
  courseById(root, args, context) {
    checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true })
    return context.prisma.course({
      id: args.id
    })
  },
  async courseAndPrerequisites(root, args, context) {
    // Check if the course is related to the workspace
    const courses = await context.prisma
      .workspace({ id: args.workspaceId })
      .courses({
        where: {
          id: args.courseId
        }
      })

    if (courses.length > 0) {
      checkAccess(context, { allowGuest: true, allowStaff: true, allowStudent: true })
      return await context.prisma.course({
        id: args.courseId
      })
    }
    return null
  },
  async coursesByWorkspace(root, args, context) {
    const owner = await hackyGetOwner(context, args.workspaceId)
    checkAccess(context, {
      allowGuest: true, allowStaff: true, allowStudent: true, verifyUser: true, userId: owner.id
    })
    return await context.prisma.courses({
      where: {
        workspace: {
          id: args.workspaceId
        }
      }
    })
  }
}

module.exports = CourseQueries
