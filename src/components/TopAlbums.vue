<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Top Albums</h2>
    <div class="space-y-4">
      <div v-for="(album, index) in topAlbums" :key="album.name" class="flex items-center">
        <span class="w-6 text-gray-500">{{ index + 1 }}.</span>
        <div class="flex-1">
          <div class="font-semibold">{{ album.name }}</div>
          <div class="text-sm text-gray-500">
            {{ album.artistName }} • {{ formatDuration(album.totalTime) }} total
          </div>
          <div class="text-xs text-gray-400">
            {{ album.trackCount }} tracks
          </div>
          <div class="text-xs text-gray-400">
            Most played: {{ album.topTrack }}
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

interface AlbumStats {
  name: string
  artistName: string
  totalTime: number
  trackCount: number
  tracks: Map<string, number>
  topTrack: string
}

const topAlbums = computed(() => {
  const albumMap = new Map<string, AlbumStats>()
  
  props.streamingData.forEach(item => {
    const albumName = item.master_metadata_album_album_name
    const artistName = item.master_metadata_album_artist_name
    const trackName = item.master_metadata_track_name
    if (!albumName || !artistName || !trackName) return

    const key = `${albumName}|${artistName}`
    const current = albumMap.get(key) || {
      name: albumName,
      artistName,
      totalTime: 0,
      trackCount: 0,
      tracks: new Map<string, number>(),
      topTrack: ''
    }

    current.totalTime += item.ms_played

    // Track unique tracks and their play time
    const trackTime = current.tracks.get(trackName) || 0
    current.tracks.set(trackName, trackTime + item.ms_played)

    // Update track count and top track
    if (!current.tracks.has(trackName)) {
      current.trackCount++
    }
    
    current.topTrack = Array.from(current.tracks.entries())
      .sort((a, b) => b[1] - a[1])[0][0]
    
    albumMap.set(key, current)
  })

  return Array.from(albumMap.values())
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