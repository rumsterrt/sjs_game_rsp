import express from 'express'
import { runHttpHandler } from 'serverHelpers/lifecicle'

const router = express.Router()

// All API routes are automatically prefixed with /api (see server/index.js file)

router.post(
  '/enter',
  runHttpHandler(async (req) => {
    const { model } = req
    const { name, isTeacher } = req.body
    const $users = model.query('users', { name, isTeacher })
    await $users.fetch()

    let user = ($users.get() || [])[0]
    await $users.unfetch()

    if (!user) {
      const id = model.id()
      user = {
        id,
        name,
        isTeacher
      }
      await model.add('users', user)
    }

    req.session.userId = user.id
    req.session.loggedIn = true

    const $session = req.model.scope('_session')
    $session.set('loggedIn', true)
    return user
  })
)

router.get(
  '/logout',
  runHttpHandler(async (req) => {
    delete req.session.userId
    delete req.session.user
    return true
  })
)

// Add new REST API routes here

export default router
