import React from 'react'
import { observer, useDoc, useQuery } from 'startupjs'
import { Text, View } from 'react-native'
import { Icon } from '@startupjs/ui'
import { Table } from 'components'
import { useQueryTable } from 'main/hooks'
import { faHandPaper, faHandRock, faHandScissors, faFlag } from '@fortawesome/free-solid-svg-icons'
import _get from 'lodash/get'

const iconResponseMap = {
  rock: faHandRock,
  scissors: faHandScissors,
  paper: faHandPaper,
  pass: faFlag
}

const RoundsTable = (props) => {
  const gameId = props.gameId
  const [game = {}] = useDoc('games', gameId)
  const [rounds = []] = useQueryTable('rounds', {
    query: { gameId, winnerId: { $ne: null } },
    limit: 3
  })
  console.log('rounds', rounds)
  const [players = []] = useQuery('users', {
    _id: { $in: game.playersIds }
  })
  if (!gameId) {
    return null
  }
  if (game.playersIds.length < 2) {
    return pug`Text Waiting for players`
  }

  const renderResponse = (response) => {
    if (!response || !iconResponseMap[response]) {
      return
    }

    return pug`Icon(icon=iconResponseMap[response] size=15)`
  }

  const columns = [
    {
      title: 'Index',
      key: 'index',

      ellipsis: true,
      align: 'center',
      render: (data) => pug`
        Text.line.text #{data.gameIndex + 1}
      `
    },
    {
      title: `Player1 (${players[0].name}) response`,
      key: 'p1res',

      align: 'center',
      render: (data) => renderResponse(_get(data, 'players[0].response'))
    },
    {
      title: `Player2 (${players[1].name}) response`,
      key: 'p2res',

      align: 'center',
      render: (data) => renderResponse(_get(data, 'players[1].response'))
    },
    {
      title: `Player1 (${players[0].name}) points`,
      key: 'p1points',

      align: 'center',
      render: (data) => pug`
        Text.text #{_get(data, 'players[0].points')}
      `
    },
    {
      title: `Player2 (${players[1].name}) points`,
      key: 'p2points',

      align: 'center',
      render: (data) => pug`
        Text.text #{_get(data, 'players[1].points')}
      `
    },
    {
      title: 'Winner',
      key: 'winner',

      align: 'center',
      render: (data) => pug`
        Text.text #{data.winnerName}
      `
    }
  ]
  const preparedRounds = rounds.items.map((item) => ({
    ...item,
    winnerName: _get(
      players.find(({ id }) => id === item.winnerId),
      'name',
      'Draw'
    ),
    players: players.map((player) => ({ ...item.players[player.id] }))
  }))
  return pug`
    View.table
      Table(dataSource=preparedRounds columns=columns rowKey=item => item.id pagination=rounds.pagination)
  `
}

export default observer(RoundsTable)
