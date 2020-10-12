import React from 'react'
import { observer, useSession, emit } from 'startupjs'
import { Text, View } from 'react-native'
import { Span, Button } from '@startupjs/ui'
import { Table } from 'components'
import { useQueryTable } from 'main/hooks'
import moment from 'moment'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const [games = [], $games] = useQueryTable('games', {
    query: {
      $or: [
        {
          playersIds: { $in: [user.id] }
        },
        {
          $and: [
            { $or: [{ playersIds: { $size: 0 } }, { playersIds: { $size: 1 } }] },
            {
              playersIds: { $not: { $in: [user.id] } }
            }
          ]
        }
      ],
      $sort: { playersIds: -1 },
      isFinished: false
    }
  })

  const columns = [
    {
      title: 'Name',
      key: 'name',

      ellipsis: true,
      align: 'center',
      render: (data) => pug`
        Text.line.text #{data.name}
      `
    },
    {
      title: 'Created At',
      key: 'age',

      align: 'center',
      render: (data) => pug`
        Text.text #{moment(data.createdAt).format('MM/DD/YYYY')}
      `
    },
    {
      title: 'Players count',
      key: 'playersCount',

      align: 'center',
      render: (data) => pug`
        Text.line.text #{data.playersIds.length}
      `
    },
    {
      title: '',
      key: 'join',

      align: 'center',
      render: (data) => pug`
        Button(onClick=()=>handleJoinGame(data)) #{data.playersIds.includes(user.id)? 'BACK' : 'JOIN'}
      `
    }
  ]

  const handleJoinGame = (game) => {
    if (!game.playersIds.includes(user.id)) {
      $games.at(game.id).setEach({
        playersIds: [...game.playersIds, user.id]
      })
    }
    emit('url', '/game/' + game.id)
  }

  return pug`
    View
      View.root
        if (!games.totalCount)
          Span.title Welcome!
          Text.text We don't have any free games, please wait
        View.coursesContainer
          View.table
            Table(title='Games' dataSource=games.items columns=columns rowKey=item => item.id pagination=games.pagination)
  `
})
