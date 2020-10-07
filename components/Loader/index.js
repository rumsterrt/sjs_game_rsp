import React, { useState } from 'react'
import { Loader as SJSLoader } from '@startupjs/ui'
import { useLocal, observer } from 'startupjs'
import './index.styl'

const useLoader = (() => {
  let currentOwnerId, status
  let $status = () => ({})

  return ([topbarProgress, $topbarProgress] = []) => {
    const [controlsId] = useState(setTimeout(() => ({})))

    if (topbarProgress !== undefined) {
      status = topbarProgress
    }

    if ($topbarProgress) {
      $status = (...args) => $topbarProgress.set(...args)
    }

    const set = (flag) => {
      if (flag) {
        currentOwnerId = controlsId
        $status(true)
      } else {
        if (controlsId === currentOwnerId) {
          $status(false)
        }
      }
    }

    return [status, set]
  }
})()

const Loader = observer(() => {
  const [loader] = useLoader(useLocal('_session.loader'))

  return pug`
    if loader
      SJSLoader.loader(color='#00AED6')
  `
})

export { Loader, useLoader }
