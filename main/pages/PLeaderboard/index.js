import React from 'react'
import { observer } from 'startupjs'
import { Span } from '@startupjs/ui'
import { Table } from 'components'
import { useQueryTable } from 'main/hooks'
import './index.styl'

const LIMIT = 10

const PLeaderboard = () => {
  const [users] = useQueryTable('users', {
    limit: LIMIT,
    query: [
      {
        $match: { $expr: { $eq: ['$isTeacher', false] } }
      },
      {
        $lookup: {
          from: 'games',
          let: { user_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$user_id', '$playersIds']
                }
              }
            }
          ],
          as: 'game'
        }
      },
      { $unwind: { path: '$game', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'rounds',
          let: { lastIndex: '$game.lastFinishedRoundIndex', gameId: '$game._id' },
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
        $addFields: {
          scores: { $objectToArray: '$round.players' }
        }
      },
      {
        $unwind: { path: '$scores', preserveNullAndEmptyArrays: true }
      },
      {
        $match: { $expr: { $or: [{ $eq: ['$_id', '$scores.k'] }, { $eq: ['$scores', null] }] } }
      },
      {
        $group: {
          _id: '$name',
          totalAmount: { $sum: '$scores.v.points' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]
  })

  const columns = [
    {
      title: 'Position',
      key: 'position',
      align: 'center',
      render: (data, index, pagination) => pug`
        Span #{index + 1 + LIMIT * pagination.page}
      `
    },
    {
      title: 'Name',
      key: 'name',
      render: (data) => pug`
        Span #{data._id}
      `
    },
    {
      title: 'Total score',
      key: 'totalAmount',
      render: (data) => pug`
        Span #{data.totalAmount}
      `
    }
  ]
  return pug`
    Table(title='Leaderboard' dataSource=users.items columns=columns rowKey=item => item._id pagination=users.pagination)
  `
}

export default observer(PLeaderboard)
