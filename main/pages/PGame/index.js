import React from 'react'
import { observer, useSession } from 'startupjs'
import './index.styl'

import Player from './player'
import Teacher from './teacher'

const PGame = () => {
  const [user] = useSession('user')

  return user.isTeacher ? pug`Teacher` : pug`Player`
}

export default observer(PGame)
