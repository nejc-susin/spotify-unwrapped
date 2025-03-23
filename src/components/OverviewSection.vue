<template>
  <div>
    <div class="mb-8 bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4">Listening Overview</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Total Listening Time</div>
          <div class="text-2xl font-bold">{{ formatDuration(totalListeningTime) }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Total Plays</div>
          <div class="text-2xl font-bold">{{ filteredData.length }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Average Daily Listening</div>
          <div class="text-2xl font-bold">{{ formatDuration(totalListeningTime / (filteredData.length ? Math.ceil(filteredData.length / 24) : 1)) }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Unique Artists</div>
          <div class="text-2xl font-bold">{{ uniqueArtists }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Unique Songs</div>
          <div class="text-2xl font-bold">{{ uniqueSongs }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-500">Unique Albums</div>
          <div class="text-2xl font-bold">{{ uniqueAlbums }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TopArtists :streaming-data="filteredData" @search="handleSearch" />
      <TopSongs :streaming-data="filteredData" @search="handleSearch" />
      <TopAlbums :streaming-data="filteredData" @search="handleSearch" />
    </div>

    <div class="mt-6 h-[400px]">
      <ListeningHistory 
        :streaming-data="filteredData" 
        @date-select="date => {
          emit('date-select', date);
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopArtists from './TopArtists.vue'
import TopSongs from './TopSongs.vue'
import TopAlbums from './TopAlbums.vue'
import ListeningHistory from './ListeningHistory.vue'

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
  reason_end: string
}

const props = defineProps<{
  streamingData: StreamingHistoryItem[]
  selectedYear: string | number
}>()

const emit = defineEmits<{
  (e: 'date-select', date: string): void
  (e: 'search', params: { type: string, query: string }): void
}>()

const filteredData = computed(() => {
  if (!props.streamingData) return []
  if (props.selectedYear === 'all') return props.streamingData

  return props.streamingData.filter((item: StreamingHistoryItem) => {
    const year = new Date(item.ts).getFullYear()
    return year === props.selectedYear
  })
})

const totalListeningTime = computed(() => {
  if (!filteredData.value) return 0
  return filteredData.value.reduce((total: number, item: StreamingHistoryItem) => total + item.ms_played, 0)
})

const uniqueArtists = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => item.master_metadata_album_artist_name)).size
})

const uniqueSongs = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => 
    `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`
  )).size
})

const uniqueAlbums = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => 
    `${item.master_metadata_album_album_name}-${item.master_metadata_album_artist_name}`
  )).size
})

const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const handleSearch = (params: { type: string, query: string }) => {
  emit('search', params)
}
</script> 