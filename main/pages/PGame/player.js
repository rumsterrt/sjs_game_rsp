import React, { useState, useEffect } from 'react'
import { observer, useSession, useDoc, emit } from 'startupjs'
import { Span, Button, Icon, Div } from '@startupjs/ui'
import { View } from 'react-native'
import { withRouter } from 'react-router-native'
import _get from 'lodash/get'
import { faHandPaper, faHandRock, faHandScissors, faFlag } from '@fortawesome/free-solid-svg-icons'
import './index.styl'

const iconResponseMap = {
  rock: faHandRock,
  scissors: faHandScissors,
  paper: faHandPaper
}

export default withRouter(
  observer(({ location, match }) => {
    const gameId = match.params.gameId
    const [user = {}] = useSession('user')
    const [game = {}, $game] = useDoc('games', gameId)
    const [currentRoundId, setCurrentRoundId] = useState()
    const [enemyId, setEnemyId] = useState()
    const [round = {}] = useDoc('rounds', currentRoundId)

    useEffect(() => {
      checkCurrentRound()
    }, [])

    useEffect(() => {
      if (!game.id) {
        return
      }
      setEnemyId(game.playersIds.find((item) => item !== user.id))
    }, [game.id])

    useEffect(() => {
      if (user.id === game.teacherId || !game.playersIds || game.playersIds.includes(user.id)) {
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

    const renderPlayerState = (isMe) => {
      const userId = isMe ? user.id : enemyId
      const response = _get(round, `players.${userId}.response`)
      let icon, styleName
      if (!response) {
        icon = faHandRock
        styleName = [{ _wait: true }]
      } else {
        icon = iconResponseMap[response]
      }
      console.log('styleName', styleName)
      return pug`
        Icon.currentPlayerState(icon=icon styleName=styleName size=50)
      `
    }

    const hasResponse = _get(round, `players.${user.id}.response`)
    const points = _get(round, `players.${user.id}.points`) || 0
    const handleMoveToChronology = () => emit('url', `/game/${gameId}/chronology`)

    return pug`
      View
        Span Round #{round.gameIndex + 1}
        Span Points #{points}
        if round.winnerId
          Span #{round.winnerId === user.id ? 'YOU WIN' : round.winnerId==='draw' ? 'DRAW' : 'YOU LOSE' }
          Button( onClick=gotoNextRound) Move next
        Div.gameField
          Div.playerField
            = renderPlayerState(true)
          Div.playerField
            = renderPlayerState()
        Div.responseWrapper
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandScissors onClick=()=>handleResponse('scissors'))
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandRock onClick=()=>handleResponse('rock'))
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandPaper onClick=()=>handleResponse('paper'))
        Button(disabled=hasResponse variant='text' icon=faFlag onClick=()=>handleResponse('pass') style={backgroundColor: 'red'})
        Button(onClick=handleMoveToChronology) Chronology
  `
  })
)
