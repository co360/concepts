const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server-core')

const tmc = require('../../TMCAuthentication')


const AuthenticationMutations = {
  async createGuest(root, args, context) {
    const guest = await context.prisma.createUser({
      role: 'GUEST'
    })
    const token = jwt.sign({
      role: guest.role,
      id: guest.id },
    process.env.SECRET)

    return {
      token,
      user: guest
    }
  },
  async login(root, args, context) {
    // Get user details from tmc
    let userDetails
    try {
      userDetails = await tmc.userDetails(args.tmcToken)
    } catch (e) {
      return new AuthenticationError('Invalid tmc-token')
    }
    const tmcId = userDetails.id
    const user = await context.prisma.user({ tmcId })

    // New user
    if (!user) {
      const userData = { tmcId }
      if (userDetails && userDetails.administrator) {
        userData.role = 'ADMIN'
      } else {
        userData.role = 'STAFF'
      }
      const createdUser = await context.prisma.createUser(userData)
      const token = jwt.sign({ role: createdUser.role, id: createdUser.id }, process.env.SECRET)
      return {
        token,
        user: createdUser
      }
    }

    // Existing user
    const token = jwt.sign({ role: user.role, id: user.id }, process.env.SECRET)
    return {
      token,
      user
    }
  }
}

module.exports = AuthenticationMutations