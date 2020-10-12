import React from 'react'
import { observer, useSession, useQuery, useValue } from 'startupjs'
import { Text, View } from 'react-native'
import { Button } from '@startupjs/ui'
import { Table } from 'components'
import RoundsTable from 'main/components/RoundsTable'
import moment from 'moment'
import './index.styl'

const PPastGames = () => {
  const [user] = useSession('user')
  const query = user.isTeacher ? { teacherId: { $in: [user.id] } } : { playersIds: { $in: [user.id] } }
  const [games = []] = useQuery('games', {
    ...query,
    isFinished: true
  })
  const [expandedGameId, $expandedGameId] = useValue()

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
        Button(onClick=()=>data.id) JOIN
      `
    }
  ]

  const rowExpandRender = (record) => pug`RoundsTable(gameId=expandedGameId)`

  const handleExpand = (expanded, record) => {
    $expandedGameId.set(expanded ? record.id : null)
    console.log('onExpand', {
      expandedGameId,
      expanded,
      record,
      newId: expanded ? record.id : null,
      get: $expandedGameId.get()
    })
  }

  return pug`
    View.root
      View.coursesContainer
        View.table
          Table(
            title='Past games'
            dataSource=games
            columns=columns
            rowKey=item => item.id
            expandedRowKeys=expandedGameId?[expandedGameId]:[]
            onExpand=handleExpand
            expandedRowRender=rowExpandRender
          )
  `
}

export default observer(PPastGames)
