import { success as successResponse, failure as failureResponse } from './responses'

const runHttpHandler = fn => async (req, res) => {
  try {
    const { success = true, ...payload } = await fn(req, res)
    if (success) {
      successResponse(res, payload)
    } else {
      failureResponse(res, payload)
    }
  } catch (error) {
    failureResponse(res, {
      error: error.name === 'Error' ? 'InternalError' : error.name,
      message: error.message
    })
  }
}

export { runHttpHandler }
