import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, Animated, Easing, PanResponder, useWindowDimensions, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { requireOptionalNativeModule } from 'expo'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, font } from '@/lib/theme'
import { sized } from '@/lib/sanity'
import { getStoryQueue, markSeen } from '@/lib/stories'
import { timeAgo } from '@/lib/links'
import { PrimaryButton } from '@/components/ui'

const IMAGE_MS = 5000
const HOLD_MS = 250
const CLOSE_DY = 90

// expo-video native modülü eski dev build'lerde yok; yoksa video kare yer tutucuyla geçilir.
const StoryVideo = requireOptionalNativeModule('ExpoVideo')
  ? (require('@/components/StoryVideo') as typeof import('@/components/StoryVideo')).StoryVideo
  : null

export default function StoryViewer() {
  const { t } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [queue] = useState(getStoryQueue)
  // n: aynı kareyi baştan oynatmak için (ilk karede geri dokunma) medya anahtarını yeniler.
  const [pos, setPos] = useState(() => ({ s: Math.max(0, queue.findIndex((x) => x._id === id)), i: 0, n: 0 }))
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const [progress] = useState(() => new Animated.Value(0))
  const [dragY] = useState(() => new Animated.Value(0))

  const story = queue[pos.s]
  const item = story?.items[pos.i]
  const videoUnsupported = item?._type === 'video' && !StoryVideo
  // Video oynatılamıyorsa (modül yok / yüklenemedi) kare görsel gibi süreyle geçer.
  const playsAsVideo = item?._type === 'video' && !!StoryVideo && !failed
  const ready = loaded || videoUnsupported

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))

  const goTo = (s: number, i: number) => {
    progress.setValue(0)
    setLoaded(false)
    setFailed(false)
    setPos((p) => ({ s, i, n: p.n + 1 }))
  }
  const next = () => {
    if (!story) return close()
    if (pos.i < story.items.length - 1) goTo(pos.s, pos.i + 1)
    else if (pos.s < queue.length - 1) goTo(pos.s + 1, 0)
    else close()
  }
  const prev = () => {
    if (pos.i > 0) goTo(pos.s, pos.i - 1)
    else if (pos.s > 0) goTo(pos.s - 1, 0)
    else goTo(0, 0)
  }

  // Animasyon ve dokunma işleyicileri her zaman güncel fonksiyonu çağırsın.
  const nav = useRef({ next, prev, close })
  useEffect(() => {
    nav.current = { next, prev, close }
  })

  useEffect(() => {
    if (!story) nav.current.close()
  }, [story])

  // Story'nin ilk karesi açılınca izlendi say.
  useEffect(() => {
    if (story && pos.i === 0) markSeen(story._id)
  }, [story, pos.i])

  // Görsel (ve oynatılamayan video) kareleri için süre sayacı.
  useEffect(() => {
    if (!item || playsAsVideo || !ready || paused) return
    let from = 0
    progress.stopAnimation((v) => (from = v))
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: IMAGE_MS * (1 - from),
      easing: Easing.linear,
      useNativeDriver: false,
    })
    anim.start(({ finished }) => finished && nav.current.next())
    return () => anim.stop()
  }, [item, playsAsVideo, ready, paused, progress])

  const pan = useMemo(() => {
    let startedAt = 0
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startedAt = Date.now()
        setPaused(true)
      },
      onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (e, g) => {
        if (g.dy > CLOSE_DY) return nav.current.close()
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start()
        setPaused(false)
        const isTap = Date.now() - startedAt < HOLD_MS && Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10
        if (!isTap) return
        if (e.nativeEvent.pageX < width / 3) nav.current.prev()
        else nav.current.next()
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start()
        setPaused(false)
      },
    })
  }, [dragY, width])

  if (!story || !item) return <View style={{ flex: 1, backgroundColor: t.storyBg }} />

  const cta = story.productSlug
    ? { label: 'Ürünü İncele', href: `/urun/${story.productSlug}` as const }
    : story.collectionSlug
      ? { label: 'Koleksiyonu Gör', href: `/koleksiyon/${story.collectionSlug}` as const }
      : null

  return (
    <Animated.View style={{ flex: 1, backgroundColor: t.storyBg, transform: [{ translateY: dragY }] }}>
      <StatusBar style="light" />

      {/* Medya */}
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
        {item._type === 'image' && item.url ? (
          <Image
            key={`${item._key}-${pos.n}`}
            source={{ uri: sized(item.url, 1080) }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true)
              setLoaded(true)
            }}
          />
        ) : playsAsVideo && item.url ? (
          <StoryVideo
            key={`${item._key}-${pos.n}`}
            url={item.url}
            paused={paused}
            onReady={() => setLoaded(true)}
            onProgress={(f) => progress.setValue(f)}
            onEnd={() => nav.current.next()}
            onError={() => {
              setFailed(true)
              setLoaded(true)
            }}
          />
        ) : null}

        {(failed || videoUnsupported || !item.url) && (
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 10 }]}>
            <MaterialIcons name={item._type === 'video' ? 'videocam-off' : 'broken-image'} size={36} color={t.storyTrack} />
            <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.onNavy }}>
              {videoUnsupported ? 'Video bu sürümde oynatılamıyor' : 'Yüklenemedi'}
            </Text>
          </View>
        )}
      </View>

      {/* Üst: ilerleme çubukları + başlık + kapat */}
      <View pointerEvents="box-none" style={{ paddingTop: insets.top + 8, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {story.items.map((it, idx) => (
            <View key={it._key} style={{ flex: 1, height: 2.5, borderRadius: 2, backgroundColor: t.storyTrack, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: t.onNavy,
                  width:
                    idx < pos.i
                      ? '100%'
                      : idx > pos.i
                        ? '0%'
                        : progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
              />
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 4 }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: font.sansBold, fontSize: 14, color: t.onNavy }}>
              {story.title}
            </Text>
            <Text style={{ marginTop: 2, fontFamily: font.sans, fontSize: 11, color: t.storyTrack }}>
              {timeAgo(story.publishedAt)}
            </Text>
          </View>
          <Pressable onPress={close} hitSlop={12} accessibilityLabel="Kapat" style={{ padding: 6 }}>
            <MaterialIcons name="close" size={26} color={t.onNavy} />
          </Pressable>
        </View>
      </View>

      {/* Alt: ürün / koleksiyon bağlantısı */}
      {cta && (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 16 }}>
          <PrimaryButton
            label={cta.label}
            icon="arrow-forward"
            color={t.accent}
            textColor={t.onNavy}
            onPress={() => router.replace(cta.href)}
          />
        </View>
      )}
    </Animated.View>
  )
}
