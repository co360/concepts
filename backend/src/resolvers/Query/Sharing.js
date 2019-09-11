const { ForbiddenError } = require('apollo-server-core')

const { checkAccess, Role, Privilege, privilegeToInt } = require('../../accessControl')

const cloneTokenProjectQuery = `
query($id: ID!, $userId: ID!) {
  projectToken(where: { id: $id }) {
    project {
      id
      name
      activeTemplate {
        id
      }
      participants(where: { user: { id: $userId }}) {
        id
        user {
          id
        }
        privilege
      }
    }
  }
}
`

const SharingQueries = {
  async peekToken(root, { id }, context) {
    await checkAccess(context, { minimumRole: Role.GUEST })
    let privilege
    if (id[0] === 'w') {
      privilege = await context.prisma.workspaceToken({ id }).privilege()
    } else if (id[0] === 'p') {
      privilege = await context.prisma.projectToken({ id }).privilege()
    } else {
      throw Error('invalid share token')
    }
    if (privilege === Privilege.CLONE && id[0] === 'p') {
      const data = await context.prisma.$graphql(cloneTokenProjectQuery, {
        id,
        userId: context.user.id
      })
      return {
        __typename: 'LimitedProject',
        id: data.projectToken.project.id,
        name: data.projectToken.project.name,
        activeTemplateId: data.projectToken.project.activeTemplate.id,
        participants: data.projectToken.project.participants
      }
    }
    if (privilegeToInt(privilege) < privilegeToInt(Privilege.READ)) {
      throw new ForbiddenError('Token does not allow reading')
    }

    if (id[0] === 'w') {
      return await context.prisma.workspaceToken({ id }).workspace()
    }
    return await context.prisma.projectToken({ id }).project()
  }
}

module.exports = SharingQueries