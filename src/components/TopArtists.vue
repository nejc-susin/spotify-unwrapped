<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Top Artists</h2>
    <div class="space-y-4">
      <div v-for="(artist, index) in topArtists" :key="artist.name" class="flex items-center">
        <span class="w-6 text-gray-500">{{ index + 1 }}.</span>
        <div class="flex-1">
          <div class="font-semibold">{{ artist.name }}</div>
          <div class="text-sm text-gray-500">
            {{ formatDuration(artist.totalTime) }} total listening time
          </div>
          <div class="text-xs text-gray-400">
            {{ artist.trackCount }} different tracks
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StreamingHistoryItem {
  ts: string
  username: string
  platform: string
  ms_played: number
  conn_country: string
  ip_addr_decrypted: string
  master_metadata_track_name: string
  master_metadata_album_artist_name: string
  master_metadata_album_album_name: string
}

interface Props {
  streamingData: StreamingHistoryItem[]
}

const props = defineProps<Props>()

interface ArtistStats {
  name: string
  totalTime: number
  trackCount: number
}

const topArtists = computed(() => {
  const artistMap = new Map<string, ArtistStats>()
  
  props.streamingData.forEach(item => {
    const artistName = item.master_metadata_album_artist_name
    if (!artistName) return

    const current = artistMap.get(artistName) || {
      name: artistName,
      totalTime: 0,
      trackCount: 0
    }

    const trackName = item.master_metadata_track_name
    if (trackName && !current.trackCount) {
      current.trackCount++
    }

    current.totalTime += item.ms_played
    artistMap.set(artistName, current)
  })

  return Array.from(artistMap.values())
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