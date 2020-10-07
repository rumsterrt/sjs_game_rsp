import React, { useEffect } from 'react'
import { observer, useDoc, useQuery, emit, useSession } from 'startupjs'
import { Text, View } from 'react-native'
import { Content } from '@startupjs/ui'
import { Table } from 'components'
import { withRouter } from 'react-router-native'
import _get from 'lodash/get'
import './index.styl'

export default withRouter(
  observer(({ match }) => {
    const gameId = match.params.gameId
    const [user] = useSession('user')
    const [game] = useDoc('games', gameId)
    const [rounds = []] = useQuery('rounds', {
      gameId,
      winnerId: { $ne: null }
    })
    const [players = []] = useQuery('users', {
      _id: { $in: game.playersIds }
    })

    useEffect(() => {
      if (!user || !game || user.id === game.teacherId || game.playersIds.includes(user.id)) {
        return
      }
      emit('url', '/')
    }, [user, game])

    if (game.playersIds.length < 2) {
      return pug`Text Waiting for players`
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
        render: (data) => pug`
          Text.text #{_get(data, 'players[0].response')}
      `
      },
      {
        title: `Player2 (${players[1].name}) response`,
        key: 'p2res',

        align: 'center',
        render: (data) => pug`
          Text.text #{_get(data, 'players[1].response')}
      `
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
    const preparedRounds = rounds.map((item) => ({
      ...item,
      winnerName: _get(
        players.find(({ id }) => id === item.winnerId),
        'name',
        'Draw'
      ),
      players: players.map((player) => ({ ...item.players[player.id] }))
    }))
    return pug`
      Content
        View.root
          View.coursesContainer
            View.table
              Table(dataSource=preparedRounds columns=columns rowKey=item => item.id)
  `
  })
)
