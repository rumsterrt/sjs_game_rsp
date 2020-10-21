import React from 'react'
import { observer, useSession, useValue } from 'startupjs'
import { Div, Span } from '@startupjs/ui'
import { Table } from 'components'
import RoundsTable from 'main/components/RoundsTable'
import moment from 'moment'
import { useQueryTable } from 'main/hooks'
import './index.styl'

const PPastGames = () => {
  const [user] = useSession('user')
  const search = user.isTeacher ? { teacherId: { $in: [user.id] } } : { playersIds: { $in: [user.id] } }
  const [games = {}] = useQueryTable('games', {
    query: [
      {
        $match: { isFinished: true, ...search }
      },
      {
        $lookup: {
          from: 'rounds',
          let: { lastIndex: '$lastFinishedRoundIndex', gameId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$$lastIndex', '$gameIndex'] }, { $eq: ['$$gameId', '$gameId'] }]
                }
              }
            }
          ],
          as: 'round'
        }
      },
      { $unwind: { path: '$round', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { playersIds: '$playersIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$playersIds']
                }
              }
            }
          ],
          as: 'players'
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
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } }
    ]
  })
  const [expandedGameId, $expandedGameId] = useValue()

  const columns = [
    {
      title: 'Name',
      key: 'name',

      ellipsis: true,
      render: (data) => pug`
        Span.line.text #{data.name}
      `
    },
    {
      title: 'Teacher',
      key: 'teacher',

      ellipsis: true,
      render: (data) => pug`
        Span.line.text #{data.teacher.name}
      `
    },
    {
      title: 'Created At',
      key: 'age',
      render: (data) => pug`
        Span.text #{moment(data.createdAt).format('MM/DD/YYYY')}
      `
    },
    {
      title: 'Player1',
      key: 'player1',
      render: (data) => {
        const info = data.round.players[data.playersIds[0]]
        const player = data.players.find((item) => item._id === data.playersIds[0]) || {}
        return pug`
          Span.line.text #{player.name}
          Span.line.text #{info.points}
        `
      }
    },
    {
      title: 'Player2',
      key: 'player2',
      render: (data) => {
        const info = data.round.players[data.playersIds[1]]
        const player = data.players.find((item) => item._id === data.playersIds[1]) || {}
        return pug`
          Span.line.text #{player.name}
          Span.line.text #{info.points}
        `
      }
    }
  ]

  const rowExpandRender = (record) => pug`
    if expandedGameId
      RoundsTable(gameId=expandedGameId)
  `

  const handleExpand = (expanded, record) => {
    $expandedGameId.set(expanded ? record._id : null)
  }

  return pug`
    Div.root
      Div.coursesContainer
        Div.table
          Table(
            title='Past games'
            dataSource=games.items
            pagination=games.pagination
            columns=columns
            rowKey=item => item._id
            expandedRowKeys=expandedGameId?[expandedGameId]:[]
            onExpand=handleExpand
            expandedRowRender=rowExpandRender
          )
  `
}

export default observer(PPastGames)
