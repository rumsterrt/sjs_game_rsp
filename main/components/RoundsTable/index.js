import React from 'react'
import { observer, useDoc, useQuery } from 'startupjs'
import { Icon, Span } from '@startupjs/ui'
import { Table } from 'components'
import { useQueryTable } from 'main/hooks'
import { faHandPaper, faHandRock, faHandScissors, faFlag } from '@fortawesome/free-solid-svg-icons'
import _get from 'lodash/get'

import './index.styl'

const iconResponseMap = {
  rock: faHandRock,
  scissors: faHandScissors,
  paper: faHandPaper,
  pass: faFlag
}

const RoundsTable = (props) => {
  const gameId = props.gameId
  const [game = {}] = useDoc('games', gameId)
  const roundQuery = { gameId, $sort: { gameIndex: props.fromLast ? -1 : 1 } }
  if (!props.includeCurrent) {
    roundQuery.winnerId = { $ne: null }
  }
  const [rounds = []] = useQueryTable('rounds', {
    query: roundQuery
  })

  const [players = []] = useQuery('users', {
    _id: { $in: game.playersIds }
  })
  if (!gameId) {
    return null
  }
  if (game.playersIds.length < 2) {
    return pug`Span Waiting for players`
  }

  const renderResponse = (response) => {
    if (!response || !iconResponseMap[response]) {
      return
    }

    return pug`Icon(icon=iconResponseMap[response] size=15)`
  }

  const columns = [
    {
      title: '',
      key: 'index',
      render: (data) => pug`
        Span.name Round #{data.gameIndex + 1}
      `
    },
    {
      title: `Player1 (${players[0].name}) response`,
      key: 'p1res',
      render: (data) => renderResponse(_get(data, 'players[0].response'))
    },
    {
      title: `Player2 (${players[1].name}) response`,
      key: 'p2res',
      render: (data) => renderResponse(_get(data, 'players[1].response'))
    },
    {
      title: `Player1 (${players[0].name}) points`,
      key: 'p1points',
      render: (data) => pug`
        Span #{_get(data, 'players[0].points')}
      `
    },
    {
      title: `Player2 (${players[1].name}) points`,
      key: 'p2points',
      render: (data) => pug`
        Span #{_get(data, 'players[1].points')}
      `
    },
    {
      title: 'Winner',
      key: 'winner',
      render: (data) => pug`
        Span #{data.winnerName}
      `
    }
  ]
  const preparedRounds = rounds.items.map((item) => ({
    ...item,
    winnerName: item.winnerId
      ? _get(
          players.find(({ id }) => id === item.winnerId),
          'name',
          'Draw'
        )
      : 'Waiting for answers',
    players: players.map((player) => ({ ...item.players[player.id] }))
  }))
  return pug`
    Table(dataSource=preparedRounds columns=columns rowKey=item => item.id pagination=rounds.pagination colorScheme='secondary')
  `
}

export default observer(RoundsTable)
