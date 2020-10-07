import React from 'react'
import { View } from 'react-native'
import { Span, Button } from '@startupjs/ui'
import { observer, useLocal, emit } from 'startupjs'
import { logout } from 'clientHelpers'
import './index.styl'

const Topbar = () => {
  const [{ user }] = useLocal('_session')
  return pug`
    View.wrapper
      View.root
        View.content
          Span(onClick=() => emit('url', '/') style={cursor: 'pointer'}) #{user.isTeacher ? 'Professor' : 'Player'} #{user.name}
          Button(onClick=() => emit('url', '/leaderboard')) Leaderboard
          Button(onClick=() => emit('url', '/pastgames')) Past games
          Button(onClick=() => logout()) Exit
  `
}

export default observer(Topbar)
