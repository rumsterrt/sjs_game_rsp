import React, { useEffect, useRef } from 'react'
import { Icon } from '@startupjs/ui'
import { faFistRaised } from '@fortawesome/free-solid-svg-icons'
import { Animated, StyleSheet } from 'react-native'
import './index.styl'

const AnimatedView = Animated.View

const ShakeFist = ({ isLeft, size = 150, ...props }) => {
  const shake = useRef(new Animated.Value(0)).current
  const _start = () => {
    Animated.loop(
      Animated.timing(shake, {
        toValue: 1,
        duration: 800
      })
    ).start()
  }
  useEffect(() => {
    _start()
  }, [])
  const shakeInter = shake.interpolate({
    inputRange: [0, 1],
    outputRange: isLeft ? ['15deg', '-15deg'] : ['-15deg', '15deg']
  })

  const style = {
    width: 'min-content',
    transformOrigin: 'center bottom',
    transform: [{ rotateZ: shakeInter }]
  }

  const iconStyle = StyleSheet.flatten([{ transform: [{ scaleX: isLeft ? -1 : 1 }] }, props.style])

  return pug`
    AnimatedView.root(style=style ...props)
      Icon(style=iconStyle icon=faFistRaised size=size)
  `
}

export default ShakeFist
