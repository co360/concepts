const { checkAccess } = require('../../accessControl')

const CourseQueries = {
  createCourseLink(root, args, context) {
    checkAccess(context, { allowStaff: true, allowStudent: true })
    return args.official !== undefined
      ? context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from, }
        },
        official: args.official,
        createdBy: { connect: { id: context.user.id } }
      })
      : context.prisma.createCourseLink({
        to: {
          connect: { id: args.to }
        },
        from: {
          connect: { id: args.from }
        },
        createdBy: { connect: { id: context.user.id } }
      })
  },

  async deleteCourseLink(root, args, context) {
    const user = context.prisma.courseLink({ id: args.id }).createdBy()
    checkAccess(context, { allowStaff: true, allowStudent: true, verifyUser: true, userId: user.id })
    return context.prisma.deleteCourseLink({
      id: args.id
    })
  }
}

module.exports = CourseQueries