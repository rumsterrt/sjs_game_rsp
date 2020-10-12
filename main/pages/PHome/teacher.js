import React from 'react'
import { observer, useSession, model, emit } from 'startupjs'
import { Text, View } from 'react-native'
import { Span, Input, Button } from '@startupjs/ui'
import { Table } from 'components'
import moment from 'moment'
import { useQueryTable } from 'main/hooks'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const [{ items, pagination }, $games] = useQueryTable('games', {
    query: { teacherId: { $in: [user.id] }, isFinished: false }
  })
  const [newGameName, setNewGameName] = React.useState('')

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
        Button(onClick=()=>emit('url', '/game/' + data.id)) JOIN
      `
    }
  ]

  const handleCreateGame = () => {
    $games.add({
      id: model.id(),
      teacherId: user.id,
      name: newGameName,
      isFinished: false,
      createdAt: Date.now(),
      playersIds: []
    })
    setNewGameName('')
  }

  return pug`
    View
      View.root
        if (!items.length)
          Span.title Welcome!
          Text.text You don't have games for now, please create a new one
        View.coursesContainer
          View.table
            Table(title='Games' dataSource=items columns=columns rowKey=item => item.id pagination=pagination)
          Input(name="name" placeholder="Input new game name" value=newGameName onChange=e=>setNewGameName(e.target.value))
          Button(disabled=!newGameName onClick=handleCreateGame) Create game
  `
})
