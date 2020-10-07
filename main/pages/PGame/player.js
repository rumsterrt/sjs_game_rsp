import React, { useState, useEffect } from 'react'
import { observer, useSession, useDoc, emit } from 'startupjs'
import { Span, Content, Button } from '@startupjs/ui'
import { withRouter } from 'react-router-native'
import _get from 'lodash/get'
import './index.styl'

export default withRouter(
  observer(({ location, match }) => {
    const gameId = match.params.gameId
    const [user] = useSession('user')
    const [game, $game] = useDoc('games', gameId)
    const [currentRoundId, setCurrentRoundId] = useState()
    const [round = {}] = useDoc('rounds', currentRoundId)

    useEffect(() => {
      checkCurrentRound()
    }, [])

    useEffect(() => {
      if (!user || !game || user.id === game.teacherId || game.playersIds.includes(user.id)) {
        return
      }
      emit('url', '/')
    }, [user, game])

    const checkCurrentRound = async () => {
      const { currentRound } = await $game.getCurrentRound()
      console.log('currentRound', currentRound)
      if (currentRound) {
        setCurrentRoundId(currentRound.id)
      }
    }

    const handleResponse = async (responseType) => {
      await $game.responseCurrentRound(user.id, responseType)
    }

    const gotoNextRound = () => {
      checkCurrentRound()
    }

    console.log('game', { game, round, currentRoundId })

    const hasResponse = _get(round, `players.${user.id}.response`)
    const points = _get(round, `players.${user.id}.points`) || 0
    const handleMoveToChronology = () => emit('url', `/game/${gameId}/chronology`)
    return pug`
      Content
        Span Points #{points}
        if round.winnerId
          Span #{round.winnerId === user.id ? 'YOU WIN' : round.winnerId==='draw' ? 'DRAW' : 'YOU LOSE' }
          Button( onClick=gotoNextRound) Move next
        Button(disabled=hasResponse onClick=()=>handleResponse('scissors')) Scissors
        Button(disabled=hasResponse onClick=()=>handleResponse('rock')) Rock
        Button(disabled=hasResponse onClick=()=>handleResponse('paper')) Paper
        Button(disabled=hasResponse onClick=()=>handleResponse('pass') style={backgroundColor: 'red'}) Pass
        Button(onClick=handleMoveToChronology) Chronology
  `
  })
)
