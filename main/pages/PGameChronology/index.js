import React, { useEffect } from 'react'
import { observer, useDoc, emit, useSession } from 'startupjs'
import { Span } from '@startupjs/ui'
import { withRouter } from 'react-router-native'
import RoundsTable from 'main/components/RoundsTable'
import './index.styl'

export default withRouter(
  observer(({ match, includeCurrentRound, startFromLastRound }) => {
    const gameId = match.params.gameId
    const [user] = useSession('user')
    const [game] = useDoc('games', gameId)

    useEffect(() => {
      if (!user || !game || user.id === game.teacherId || game.playersIds.includes(user.id)) {
        return
      }
      emit('url', '/')
    }, [user, game])

    if (game.playersIds.length < 2) {
      return pug`Span Waiting for players`
    }

    return pug`
      RoundsTable(gameId=gameId includeCurrent=includeCurrentRound fromLast=startFromLastRound)
  `
  })
)
