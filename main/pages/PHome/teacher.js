import React from 'react'
import { observer, useSession, model, emit } from 'startupjs'
import { Span, Input, Button, Div, H3, H4 } from '@startupjs/ui'
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
      render: (data) => pug`
        Span.line.text #{data.name}
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
      title: 'Players count',
      key: 'playersCount',
      render: (data) => pug`
        Span.line.text #{_get(data,'playersIds.length', 0)}
      `
    },
    {
      title: '',
      key: 'join',
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
        if !items.length
          H3.centerText Welcome!
          H4.centerText You don't have games for now, please create a new one
        Div.createGameContainer
          Input.createInput(name="name" placeholder="Input new game name" value=newGameName onChange=e=>setNewGameName(e.target.value))
          Button(disabled=!newGameName onClick=handleCreateGame) Create game
        if items.length
          Div.table
            Table(title='Active Games' dataSource=items columns=columns rowKey=item => item.id pagination=pagination)
  `
})
