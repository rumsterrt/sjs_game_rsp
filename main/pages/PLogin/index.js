import React from 'react'
import { Input, Button, Checkbox, Span, Div, Br } from '@startupjs/ui'
import { useLoader, Logo } from 'components'
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

      $user.set(data)
      window.location.href += ''
    } catch (err) {
      console.log(err)
    } finally {
      $topbarProgress(false)
    }
  }

  return pug`
    Div.login
      Logo(size=50)
      Span Please enter your name to continue
      Div.local
        Span Name
        Input(value=name name='name' placeholder='Enter name' onChange=e=>setName(e.target.value))
        Br
        Checkbox(value=isTeacher name='isTeacher' onChange=setIsTeacher label="I'm teacher")
        Br
        Button(type='primary' onClick=onSubmit) Enter
    `
}

export default observer(PLogin)
