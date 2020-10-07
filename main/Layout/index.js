import React from 'react'
import './index.styl'
import { Platform, SafeAreaView, View } from 'react-native'
import { observer, useLocal } from 'startupjs'
import { PLogin } from 'main/pages'
import { Loader } from 'components'

import Topbar from './Topbar'

export default observer(function ({ children }) {
  const [{ user, ...rest }] = useLocal('_session')
  console.log('user', { user, rest })
  if (!user) {
    return pug`
      PLogin
    `
  }
  const main = pug`
    View
      Loader
      Topbar
      Main.content= children
  `
  return main
})

const Main = observer(({ children, style }) => {
  return pug`
    Wrapper
      View(style=style)
        = children
  `
})

const Wrapper =
  Platform.OS === 'web'
    ? React.memo(({ children }) => children)
    : React.memo(
        ({ children }) => pug`
    SafeAreaView.page(style={ flex: 1, backgroundColor: '#fff' })= children
  `
      )
