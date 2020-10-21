import React from 'react'
import { observer, useSession, useQuery, useValue } from 'startupjs'
import { Div, Span } from '@startupjs/ui'
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
        Span.line.text #{data.name}
      `
    },
    {
      title: 'Created At',
      key: 'age',

      align: 'center',
      render: (data) => pug`
        Span.text #{moment(data.createdAt).format('MM/DD/YYYY')}
      `
    },
    {
      title: 'Players count',
      key: 'playersCount',

      align: 'center',
      render: (data) => pug`
        Span.line.text #{data.playersIds.length}
      `
    }
  ]

  const rowExpandRender = (record) => pug`
    if expandedGameId
      RoundsTable(gameId=expandedGameId)
  `

  const handleExpand = (expanded, record) => {
    $expandedGameId.set(expanded ? record.id : null)
  }

  return pug`
    Div.root
      Div.coursesContainer
        Div.table
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
