import React, { useEffect } from 'react'
import { observer, useSession, useDoc, emit } from 'startupjs'
import { Button } from '@startupjs/ui'
import { View } from 'react-native'
import { withRouter } from 'react-router-native'
import PGameChronology from '../PGameChronology'
import './index.styl'

export default withRouter(
  observer(({ match }) => {
    const gameId = match.params.gameId
    const [user] = useSession('user')
    const [game, $game] = useDoc('games', gameId)

    useEffect(() => {
      if (!user || !game || user.id === game.teacherId) {
        return
      }
      emit('url', '/')
    }, [user, game])

    return pug`
      View
        PGameChronology(match=match)
        if !game.isFinished
          Button(onClick=() => $game.setEach({isFinished: true})) Finish game
  `
  })
)
