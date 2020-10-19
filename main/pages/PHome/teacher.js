import React from 'react'
import { observer, useSession, model, emit } from 'startupjs'
import { Span, Input, Button, Div } from '@startupjs/ui'
import { Table } from 'components'
import moment from 'moment'
import { useQueryTable } from 'main/hooks'
import _get from 'lodash/get'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const [{ items, pagination }, $games] = useQueryTable('games', {
    query: { teacherId: { $in: [user.id] }, isFinished: false, $sort: { playersIds: -1, createdAt: -1 } }
  })
  const [newGameName, setNewGameName] = React.useState('')

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
        Span.line.text #{_get(data,'playersIds.length', 0)}
      `
    },
    {
      title: '',
      key: 'join',

      align: 'center',
      render: (data) => pug`
        Button(onClick=()=>emit('url', '/game/' + data.id)) JOIN
      `
    }
  ]

  const handleCreateGame = () => {
    const gameId = model.id()
    $games.add({
      id: gameId,
      teacherId: user.id,
      name: newGameName,
      isFinished: false,
      createdAt: Date.now(),
      playersIds: []
    })
    model.add('rounds', {
      id: model.id(),
      gameId,
      gameIndex: 0,
      winnerId: null,
      players: {}
    })
    setNewGameName('')
  }

  return pug`
    Div
      Div.root
        if (!items.length)
          Span.title Welcome!
          Span.text You don't have games for now, please create a new one
        Div.coursesContainer
          Div.createGameContainer
            Input.createInput(name="name" placeholder="Input new game name" value=newGameName onChange=e=>setNewGameName(e.target.value))
            Button(disabled=!newGameName onClick=handleCreateGame) Create game
          Div.table
            Table(title='Active Games' dataSource=items columns=columns rowKey=item => item.id pagination=pagination)
  `
})
