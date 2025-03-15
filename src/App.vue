<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Spotify Unwrapped</h1>
      
      <div v-if="!streamingData" class="text-center">
        <input
          type="file"
          accept=".json"
          @change="handleFileUpload"
          class="hidden"
          ref="fileInput"
        />
        <button
          @click="$refs.fileInput.click()"
          class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Upload Streaming History
        </button>
      </div>

      <div v-else>
        <div class="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 class="text-2xl font-bold mb-4">Listening Overview</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-500">Total Listening Time</div>
              <div class="text-2xl font-bold">{{ formatDuration(totalListeningTime) }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-500">Total Tracks</div>
              <div class="text-2xl font-bold">{{ streamingData.length }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopArtists :streaming-data="streamingData" />
          <TopSongs :streaming-data="streamingData" />
          <TopAlbums :streaming-data="streamingData" />
        </div>

        <div class="mt-6 h-[400px]">
          <ListeningHistory :streaming-data="streamingData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopArtists from './components/TopArtists.vue'
import TopSongs from './components/TopSongs.vue'
import TopAlbums from './components/TopAlbums.vue'
import ListeningHistory from './components/ListeningHistory.vue'

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

const streamingData = ref<StreamingHistoryItem[]>()
const fileInput = ref<HTMLInputElement>()

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  const text = await file.text()
  streamingData.value = JSON.parse(text)
}

const totalListeningTime = computed(() => {
  if (!streamingData.value) return 0
  return streamingData.value.reduce((total, item) => total + item.ms_played, 0)
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