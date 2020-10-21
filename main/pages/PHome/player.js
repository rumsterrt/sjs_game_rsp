import React from 'react'
import { observer, useSession, emit } from 'startupjs'
import { Span, Button, Div } from '@startupjs/ui'
import { Table } from 'components'
import { useQueryTable } from 'main/hooks'
import moment from 'moment'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const [games = [], $games] = useQueryTable('games', {
    query: [
      {
        $match: {
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
      },
      {
        $lookup: {
          from: 'users',
          let: { teacherId: '$teacherId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$teacherId']
                }
              }
            }
          ],
          as: 'teacher'
        }
      },
      { $unwind: { path: '$teacher' } }
    ]
  })

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (data) => pug`
        Span #{data.name}
      `
    },
    {
      title: 'Teacher',
      key: 'teacher',
      render: (data) => pug`
        Span #{data.teacher.name}
      `
    },
    {
      title: 'Created At',
      key: 'age',
      render: (data) => pug`
        Span #{moment(data.createdAt).format('MM/DD/YYYY')}
      `
    },
    {
      title: 'Players count',
      key: 'playersCount',
      render: (data) => pug`
        Span #{data.playersIds.length}
      `
    },
    {
      title: '',
      key: 'join',
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
    Div.root
      if (!games.totalCount)
        Span.title Welcome!
        Span.text We don't have any free games, please wait
      else
        Table(title='Games' dataSource=games.items columns=columns rowKey=item => item._id pagination=games.pagination)
  `
})
