const success = (res, { status = 200, ...payload } = {}) => res.status(status).send(payload)
const failure = (res, { error, message, status = 500 }) =>
  res.status(status).send({
    error: { name: (error && error.name) || 'Internal error', message: message || (error && error.message) }
  })

export { success, failure }
