import React from 'react'
import { View } from 'react-native'
import { Input, Button, Checkbox, Span } from '@startupjs/ui'
import { useLoader } from 'components'
import { observer, emit, useSession } from 'startupjs'
import axios from 'axios'
import './index.styl'

const PLogin = () => {
  const [user, $user] = useSession('user')
  const [name, setName] = React.useState('')
  const [isTeacher, setIsTeacher] = React.useState(false)
  const [, $topbarProgress] = useLoader()

  React.useEffect(() => {
    if (user) emit('url', '/')
  }, [])

  const onSubmit = async () => {
    try {
      $topbarProgress(true)
      const { data } = await axios.post('/api/enter', {
        isTeacher,
        name
      })
      console.log('data', data)
      $user.set(data)
      window.location.href += ''
    } catch (err) {
      console.log(err)
    } finally {
      $topbarProgress(false)
    }
  }

  return pug`
    View.login
      Span Welcome to RSP!
      Span Please enter your name to continue
      View.local
        Span Name
        View.row
          Input(value=name name='name' placeholder='Enter name' onChange=e=>setName(e.target.value))
        View.row
          Checkbox(value=isTeacher name='isTeacher' onChange=setIsTeacher label="I'm teacher")
        Button(type='primary' onClick=onSubmit) Enter
    `
}

export default observer(PLogin)
