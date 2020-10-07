import React from 'react'
import { observer, useSession, useQuery, emit } from 'startupjs'
import { Text, View } from 'react-native'
import { Span, Content, Button } from '@startupjs/ui'
import { Table } from 'components'
import moment from 'moment'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const [currentGames = []] = useQuery('games', {
    playersIds: { $in: [user.id] },
    isFinished: false
  })
  const [freeGames = [], $freeGames] = useQuery('games', {
    $or: [{ playersIds: { $size: 0 } }, { playersIds: { $size: 1 } }],
    playersIds: { $not: { $in: [user.id] } },
    isFinished: false
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
      title: 'join',
      key: 'join',

      align: 'center',
      render: (data) => pug`
        Button(onClick=()=>handleJoinGame(data)) #{data.playersIds.includes(user.id)? 'BACK TO GAME' : 'JOIN'}
      `
    }
  ]

  const handleJoinGame = (game) => {
    if (!game.playersIds.includes(user.id)) {
      $freeGames.at(game.id).setEach({
        playersIds: [...game.playersIds, user.id]
      })
    }
    emit('url', '/game/' + game.id)
  }

  const games = [...currentGames, ...freeGames]

  return pug`
    Content
      View.root
        if (!games.length)
          Span.title Welcome!
          Text.text We don't have any free games, please wait
        View.coursesContainer
          View.table
            Table(dataSource=games columns=columns rowKey=item => item.id)
  `
})
