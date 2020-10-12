import React from 'react'
import { Row, Icon } from '@startupjs/ui'
import { faHandRock, faHandPaper, faHandScissors } from '@fortawesome/free-solid-svg-icons'
import './index.styl'

const Logo = ({ onPress, size = 25 }) => {
  return pug`
    Row.root(onClick=() => onPress && onPress())
      Icon(icon=faHandRock size=size)
      Icon.centerIcon(icon=faHandScissors size=size)
      Icon(icon=faHandPaper size=size)
  `
}

export default Logo
