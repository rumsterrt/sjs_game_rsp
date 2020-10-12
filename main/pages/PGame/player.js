import React, { useState, useEffect } from 'react'
import { observer, useSession, useDoc, emit } from 'startupjs'
import { Span, Button, Icon, Div, H3, H5, Row } from '@startupjs/ui'
import { View, Text } from 'react-native'
import { withRouter } from 'react-router-native'
import _get from 'lodash/get'
import { faHandPaper, faHandRock, faHandScissors, faFlag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import ShakeFist from './shakeFist'
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
    const [enemy = {}] = useDoc('users', enemyId)
    const [round = {}] = useDoc('rounds', currentRoundId)
    console.log('game', { game, round })
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
        return pug`
          ShakeFist.currentPlayerState(isLeft=isMe size=150)
        `
      } else {
        icon = isMe || _get(round, `players.${user.id}.response`) ? iconResponseMap[response] : faQuestionCircle
      }
      console.log('styleName', styleName)
      return pug`
        Icon.currentPlayerState(icon=icon styleName=[{left: isMe}] size=150)
      `
    }

    const hasResponse = _get(round, `players.${user.id}.response`)
    const points = _get(round, `players.${user.id}.points`) || 0
    const handleMoveToChronology = () => emit('url', `/game/${gameId}/chronology`)

    return pug`
      View
        Div.info
          H3.centerText #{game.name} Round #{round.gameIndex + 1}
          H5.centerText Points #{points}
        if round.winnerId
          Span #{round.winnerId === user.id ? 'YOU WIN' : round.winnerId==='draw' ? 'DRAW' : 'YOU LOSE' }
          Button( onClick=gotoNextRound) Move next
        Div.gameField
          Div.playerField
            Text #{'You'}
            =renderPlayerState(true)
          Div.playerField.right
            Text #{enemy.name}
            =renderPlayerState()
        Row.responseWrapper(vAlign='center' align='around')
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandScissors onClick=()=>handleResponse('scissors'))
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandRock onClick=()=>handleResponse('rock'))
          Button(disabled=hasResponse size='xxl' variant='text' icon=faHandPaper onClick=()=>handleResponse('paper'))
          Button(disabled=hasResponse size='xxl' variant='text' icon=faFlag onClick=()=>handleResponse('pass') color='red')
        Button(onClick=handleMoveToChronology) Chronology
  `
  })
)
