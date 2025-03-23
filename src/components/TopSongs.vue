<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Top Songs</h2>
    <div class="space-y-4">
      <div v-for="(song, index) in topSongs" :key="song.trackName" class="flex items-center">
        <span class="w-6 text-gray-500">{{ index + 1 }}.</span>
        <div class="flex-1">
          <div class="font-semibold cursor-pointer hover:text-green-600" @click="emit('search', { type: 'track', query: song.trackName })">{{ song.trackName }}</div>
          <div class="text-sm text-gray-500">
            <span class="cursor-pointer hover:text-green-600" @click="emit('search', { type: 'artist', query: song.artistName })">{{ song.artistName }}</span> • {{ formatDuration(song.totalTime) }} total
          </div>
          <div class="text-xs text-gray-400">
            Played {{ song.playCount }} times
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StreamingHistoryItem } from '../stores/streaming'

interface Props {
  streamingData: StreamingHistoryItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'search', params: { type: string, query: string }): void
}>()

interface SongStats {
  trackName: string
  artistName: string
  totalTime: number
  playCount: number
}

const topSongs = computed(() => {
  const songMap = new Map<string, SongStats>()
  
  props.streamingData.forEach(item => {
    const trackName = item.master_metadata_track_name
    const artistName = item.master_metadata_album_artist_name
    if (!trackName || !artistName) return

    const key = `${trackName}|${artistName}`
    const current = songMap.get(key) || {
      trackName,
      artistName,
      totalTime: 0,
      playCount: 0
    }
    
    current.totalTime += item.ms_played
    current.playCount++
    
    songMap.set(key, current)
  })

  return Array.from(songMap.values())
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10)
})

const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
</script> 