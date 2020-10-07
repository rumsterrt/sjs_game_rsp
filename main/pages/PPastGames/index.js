import React from 'react'
import { observer, useSession, useQuery } from 'startupjs'
import { Text, View } from 'react-native'
import { Content, Button } from '@startupjs/ui'
import { Table } from 'components'
import moment from 'moment'
import './index.styl'

export default observer(() => {
  const [user] = useSession('user')
  const query = user.isTeacher ? { teacherId: { $in: [user.id] } } : { playersIds: { $in: [user.id] } }
  const [games = []] = useQuery('games', {
    ...query,
    isFinished: true
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
        Button(onClick=()=>data.id) JOIN
      `
    }
  ]

  console.log('games', { games })
  return pug`
    Content
      View.root
        View.coursesContainer
          View.table
            Table(dataSource=games columns=columns rowKey=item => item.id)
  `
})
