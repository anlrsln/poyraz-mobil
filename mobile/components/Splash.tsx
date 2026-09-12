import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { Image } from 'expo-image'
import { font } from '@/lib/theme'

const LOGO = 'https://www.poyrazmobilya.com/assets/logo.png'

export default function Splash() {
  const fade = useRef(new Animated.Value(0)).current
  const bar = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start()
    Animated.timing(bar, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start()
  }, [bar, fade])

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ opacity: fade, alignItems: 'center', gap: 22 }}>
        <Image source={{ uri: LOGO }} style={{ width: 210, height: 78 }} contentFit="contain" />
        <Text style={{ fontFamily: font.sans, fontSize: 11.5, letterSpacing: 2.5, color: '#5C6E8C' }}>
          TASARIM BİZİM İŞİMİZ
        </Text>
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          bottom: 96,
          width: 132,
          height: 2,
          borderRadius: 2,
          backgroundColor: '#E3EAF4',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: '#2E9BD6',
            width: bar.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] }),
          }}
        />
      </View>

      <Text style={{ position: 'absolute', bottom: 58, fontFamily: font.sansSemi, fontSize: 10, letterSpacing: 2, color: '#A9B8CE' }}>
        EST. 1972 · KAYSERİ
      </Text>
    </View>
  )
}
