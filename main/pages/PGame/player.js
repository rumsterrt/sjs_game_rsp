import React, { useState, useEffect } from 'react'
import { observer, useSession, useDoc, useQuery, emit } from 'startupjs'
import { Span, Button, Icon, Div, H3, H5, H4, Row } from '@startupjs/ui'
import { withRouter } from 'react-router-native'
import _get from 'lodash/get'
import {
  faHandPaper,
  faHandRock,
  faHandScissors,
  faFlag,
  faQuestionCircle,
  faListAlt
} from '@fortawesome/free-solid-svg-icons'
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

    const [enemyId, setEnemyId] = useState()
    const [enemy = {}] = useDoc('users', enemyId)
    const [rounds] = useQuery('rounds', {
      gameId,
      $sort: { gameIndex: -1 },
      $limit: 1
    })
    const round = rounds && rounds.length > 0 ? rounds[0] : {}

    useEffect(() => {
      if (!game.id) {
        return
      }
      setEnemyId(game.playersIds.find((item) => item !== user.id))
    }, [JSON.stringify(game)])

    useEffect(() => {
      if (user.id === game.teacherId || !game.playersIds || game.playersIds.includes(user.id)) {
        return
      }
      emit('url', '/')
    }, [user, game])

    if (game.isFinished) {
      return pug`Span.centerText Game already finished`
    }

    const handleResponse = async (responseType) => {
      await $game.responseCurrentRound(user.id, responseType)
    }

    const renderPlayerState = (isMe) => {
      const userId = isMe ? user.id : enemyId
      const response = _get(round, `players.${userId}.response`)

      if (!response) {
        return pug`
          ShakeFist.currentPlayerState(isLeft=isMe)
        `
      }

      const icon = isMe || _get(round, `players.${user.id}.response`) ? iconResponseMap[response] : faQuestionCircle

      return pug`
        Icon.currentPlayerState(
          icon=icon
          style={transform: [{scaleX: isMe ? -1 : 1}]}
        )
      `
    }

    const hasResponse = _get(round, `players.${user.id}.response`)
    const points = _get(round, `players.${user.id}.points`) || 0
    const handleMoveToChronology = () => emit('url', `/game/${gameId}/chronology`)

    return pug`
      Div.root
        Div.info
          Row.titleContainer
            H3.centerText #{game.name}
            if enemyId
              Button.chronologyButton(size=35 variant='text' icon=faListAlt onClick=handleMoveToChronology)
          if enemyId
            H4.centerText Round #{round.gameIndex + 1}
            H5.centerText Points #{points}
          else
            Span.centerText Wait your opponent
        if enemyId
          Div.gameField
            Div.playerField
              Span You
              =renderPlayerState(true)
            if round.winnerId
              Span #{round.winnerId === user.id ? 'YOU WIN' : round.winnerId==='draw' ? 'DRAW' : 'YOU LOSE' }
            Div.playerField.right
              Span #{enemy.name}
              =renderPlayerState()
          Row.responseWrapper(vAlign='center' align='around')
            Button(disabled=hasResponse size='40' variant='text' icon=faHandScissors onClick=()=>handleResponse('scissors'))
            Button(disabled=hasResponse size='40' variant='text' icon=faHandRock onClick=()=>handleResponse('rock'))
            Button(disabled=hasResponse size='40' variant='text' icon=faHandPaper onClick=()=>handleResponse('paper'))
            Button(disabled=hasResponse size='40' variant='text' icon=faFlag onClick=()=>handleResponse('pass') color='red')
  `
  })
)
