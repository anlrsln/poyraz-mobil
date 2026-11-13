import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { useEventListener } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

/**
 * Story'deki tek video kare. İlerlemeyi ve bitişi üst bileşene bildirir.
 * expo-video native modül gerektirdiği için yalnızca app/story/[id].tsx içinden,
 * modül build'de varsa yüklenir.
 */
export function StoryVideo({
  url,
  paused,
  onReady,
  onProgress,
  onEnd,
  onError,
}: {
  url: string
  paused: boolean
  onReady: () => void
  onProgress: (fraction: number) => void
  onEnd: () => void
  onError: () => void
}) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false
    p.timeUpdateEventInterval = 0.1
  })

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') onReady()
    if (status === 'error') onError()
  })
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (player.duration > 0) onProgress(Math.min(1, currentTime / player.duration))
  })
  useEventListener(player, 'playToEnd', onEnd)

  useEffect(() => {
    if (paused) player.pause()
    else player.play()
  }, [paused, player])

  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
}
