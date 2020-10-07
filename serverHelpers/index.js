import { getAppByDomain } from 'helpers'

export async function setAppToUser (model, userId, host) {
  const app = getAppByDomain(host)
  const $auths = model.query('auths', {
    _id: userId,
    app: null
  })
  await $auths.subscribeAsync()
  const $auth = model.scope('auths.' + userId)
  if ($auth.get()) await $auth.setAsync('app', app)
  return app
}
