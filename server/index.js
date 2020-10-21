import init from 'startupjs/init'
import orm from '../model'
import startupjsServer from 'startupjs/server'
import api from './api'
import getMainRoutes from '../main/routes'
import { initApp } from 'startupjs/app/server'

// Init startupjs ORM.
init({ orm })

// Check '@startupjs/server' readme for the full API
export default (done) => {
  startupjsServer(
    {
      getHead,
      appRoutes: [...getMainRoutes()],
      sessionMaxAge: 1000 * 60 * 60 * 4 // 4 hours
    },
    (ee, options) => {
      initApp(ee)

      ee.on('routes', (expressApp) => {
        expressApp.use('/api', api)
      })

      ee.on('done', () => {
        done && done()
      })
    }
  )
}

const getHead = (appName) => {
  return `
    <title>HelloWorld</title>
    <!-- Put vendor JS and CSS here -->
  `
}
