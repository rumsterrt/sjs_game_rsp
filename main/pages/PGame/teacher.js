import React, { useEffect } from 'react'
import { observer, useSession, useDoc, emit, useQuery } from 'startupjs'
import { Button, H3, Div } from '@startupjs/ui'
import { withRouter } from 'react-router-native'
import PGameChronology from '../PGameChronology'
import './index.styl'

export default withRouter(
  observer(({ match }) => {
    const gameId = match.params.gameId
    const [user] = useSession('user')
    const [game, $game] = useDoc('games', gameId)
    const [rounds] = useQuery('rounds', {
      gameId,
      $sort: { gameIndex: -1 },
      $limit: 1
    })
    const round = rounds && rounds.length > 0 ? rounds[0] : {}

    useEffect(() => {
      if (!user || !game || user.id === game.teacherId) {
        return
      }
      emit('url', '/')
    }, [user, game])

    return pug`
      Div
        H3.centerText #{game.name}
        PGameChronology(match=match includeCurrentRound startFromLastRound)
        Div.teacherButtons
          Button.teacherButton(disabled=!round.winnerId || game.isFinished onClick=() => $game.createNextRound()) Next round
          Button.teacherButton.last(disabled=game.isFinished || !round.winnerId onClick=() => $game.setEach({isFinished: true})) Finish game
  `
  })
)
