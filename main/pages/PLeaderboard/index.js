import React from 'react'
import { observer, useQuery } from 'startupjs'
import { Text, View } from 'react-native'
import { Table } from 'components'
import './index.styl'

const PLeaderboard = () => {
  const [games = []] = useQuery('users', {
    $aggregate: [
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
      { $unwind: { path: '$game' } },
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
      { $unwind: { path: '$round' } },
      {
        $addFields: {
          scores: { $objectToArray: '$round.players' }
        }
      },
      {
        $unwind: '$scores'
      },
      {
        $match: { $expr: { $eq: ['$_id', '$scores.k'] } }
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
  console.log('games', games)
  const columns = [
    {
      title: 'Name',
      key: 'name',

      ellipsis: true,
      align: 'center',
      render: (data) => pug`
        Text.line.text #{data._id}
      `
    },
    {
      title: 'Total score',
      key: 'totalAmount',

      align: 'center',
      render: (data) => pug`
        Text.text #{data.totalAmount}
      `
    }
  ]
  return pug`
    View
      View.root
        View.coursesContainer
          View.table
            Table(dataSource=games columns=columns rowKey=item => item.id)
  `
}

export default observer(PLeaderboard)
