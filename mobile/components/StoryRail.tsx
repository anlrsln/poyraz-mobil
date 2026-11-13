import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { sized } from '@/lib/sanity'
import { Story, loadSeen, setStoryQueue, sortStories } from '@/lib/stories'

const IMG = 68
const RING = 2.5
const GAP = 2.5
const OUTER = IMG + 2 * (RING + GAP)

/** Ana sayfanın üstündeki yuvarlak story şeridi. Aktif story yoksa hiç görünmez. */
export function StoryRail({ stories }: { stories: Story[] }) {
  const { t } = useTheme()
  const router = useRouter()
  const [seen, setSeen] = useState<Set<string>>(new Set())

  const ids = stories.map((s) => s._id).join(',')

  // İzleyiciden dönünce halkaların güncellenmesi için odakta yeniden okunur.
  useFocusEffect(
    useCallback(() => {
      let alive = true
      loadSeen(ids ? ids.split(',') : []).then((s) => alive && setSeen(s))
      return () => {
        alive = false
      }
    }, [ids])
  )

  if (stories.length === 0) return null

  const ordered = sortStories(stories, seen)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingTop: 16 }}
    >
      {ordered.map((s) => {
        const isSeen = seen.has(s._id)
        return (
          <Pressable
            key={s._id}
            accessibilityRole="button"
            accessibilityLabel={`Story: ${s.title}`}
            onPress={() => {
              setStoryQueue(ordered)
              router.push(`/story/${s._id}`)
            }}
            style={({ pressed }) => ({ width: OUTER, alignItems: 'center', opacity: pressed ? 0.75 : 1 })}
          >
            <View
              style={{
                width: OUTER,
                height: OUTER,
                borderRadius: OUTER / 2,
                borderWidth: RING,
                borderColor: isSeen ? t.line : t.accent,
                padding: GAP,
              }}
            >
              {s.cover ? (
                <Image
                  source={{ uri: sized(s.cover, 200) }}
                  style={{ width: IMG, height: IMG, borderRadius: IMG / 2, backgroundColor: t.chip }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: IMG,
                    height: IMG,
                    borderRadius: IMG / 2,
                    backgroundColor: t.navy,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="play-circle-outline" size={30} color={t.onNavy} />
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={{ marginTop: 6, fontFamily: font.sansSemi, fontSize: 11, color: isSeen ? t.sub : t.ink }}
            >
              {s.title}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
