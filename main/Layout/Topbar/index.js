import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Menu, Button, Icon } from '@startupjs/ui'
import { observer, useLocal, emit } from 'startupjs'
import { Logo } from 'components'
import { logout } from 'clientHelpers'
import { faArrowDown, faArrowUp, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import './index.styl'

const MenuItem = Menu.Item

const menuItems = [
  {
    title: 'Games',
    action: () => emit('url', '/')
  },
  {
    title: 'Leaderboard',
    action: () => emit('url', '/leaderboard')
  },
  {
    title: 'Past games',
    action: () => emit('url', '/pastgames')
  },
  {
    title: 'Exit',
    icon: faSignOutAlt,
    style: { alignSelf: 'center' },
    action: () => logout()
  }
]

const Topbar = () => {
  const [{ user }] = useLocal('_session')
  const [menuOpen, setMenuOpen] = useState(false)
  return pug`
    View.wrapper
      View.root
        View.content
          Logo(onPress=() => emit('url', '/'))
          Button(
            onClick=() => setMenuOpen(!menuOpen)
            icon=menuOpen?faArrowUp:faArrowDown
            variant='text'
            iconPosition='right'
          ) #{user.isTeacher ? 'Professor' : 'Player'} #{user.name}
            Menu.menu(styleName=[{hide: !menuOpen}])
              each item in menuItems
                MenuItem.menuItem(key=item.title onPress=() => {
                  item.action()
                  setMenuOpen(false)
                }) 
                  if item.icon
                    Icon.currentPlayerState(icon=item.icon size=20 style=item.style)
                  else
                    Text #{item.title} 
  `
}

export default observer(Topbar)
