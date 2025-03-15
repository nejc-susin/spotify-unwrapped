<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">Search Plays</h2>
      <div class="flex gap-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Enter search term..."
          class="border rounded px-3 py-1 flex-grow"
          @keyup.enter="performSearch"
        />
        <select v-model="searchType" class="border rounded px-3 py-1 w-40">
          <option value="all">All Fields</option>
          <option value="track">Track Name</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
        </select>
        <button 
          @click="performSearch"
          class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
        >
          Search
        </button>
      </div>
    </div>

    <div v-if="hasSearched">
      <div v-if="searchResults.length > 0" class="space-y-4">
        <div class="text-sm text-gray-500 mb-4">
          Found {{ searchResults.length }} matching plays
        </div>

        <div class="flex gap-4 mb-4">
          <select v-model="sortBy" class="border rounded px-3 py-1">
            <option value="date">Sort by Date</option>
            <option value="track">Sort by Track Name</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="duration">Sort by Duration</option>
          </select>
          <select v-model="sortOrder" class="border rounded px-3 py-1">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-2 px-4">Date</th>
                <th class="text-left py-2 px-4">Time</th>
                <th class="text-left py-2 px-4">Track</th>
                <th class="text-left py-2 px-4">Artist</th>
                <th class="text-left py-2 px-4">Album</th>
                <th class="text-left py-2 px-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="track in sortedResults" :key="track.ts" class="border-t hover:bg-gray-50">
                <td class="py-2 px-4">{{ formatDate(track.ts) }}</td>
                <td class="py-2 px-4">{{ formatTime(track.ts) }}</td>
                <td class="py-2 px-4">{{ track.master_metadata_track_name }}</td>
                <td class="py-2 px-4">{{ track.master_metadata_album_artist_name }}</td>
                <td class="py-2 px-4">{{ track.master_metadata_album_album_name }}</td>
                <td class="py-2 px-4">{{ formatDuration(track.ms_played) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-8">
        No matching plays found
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-8">
      Enter a search term and press Search
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'

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

interface Props {
  streamingData: StreamingHistoryItem[]
}

const props = defineProps<Props>()
const searchQuery = ref('')
const searchType = ref('all')
const hasSearched = ref(false)
const sortBy = ref('date')
const sortOrder = ref('desc')
const searchResults = ref<StreamingHistoryItem[]>([])

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = true
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = props.streamingData.filter(item => {
    const trackName = (item.master_metadata_track_name || '').toLowerCase()
    const artistName = (item.master_metadata_album_artist_name || '').toLowerCase()
    const albumName = (item.master_metadata_album_album_name || '').toLowerCase()

    switch (searchType.value) {
      case 'track':
        return trackName.includes(query)
      case 'artist':
        return artistName.includes(query)
      case 'album':
        return albumName.includes(query)
      default:
        return trackName.includes(query) || 
               artistName.includes(query) || 
               albumName.includes(query)
    }
  })

  hasSearched.value = true
}

const sortedResults = computed(() => {
  const sorted = [...searchResults.value]
  sorted.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'date':
        comparison = a.ts.localeCompare(b.ts)
        break
      case 'track':
        comparison = (a.master_metadata_track_name || '').localeCompare(b.master_metadata_track_name || '')
        break
      case 'artist':
        comparison = (a.master_metadata_album_artist_name || '').localeCompare(b.master_metadata_album_artist_name || '')
        break
      case 'album':
        comparison = (a.master_metadata_album_album_name || '').localeCompare(b.master_metadata_album_album_name || '')
        break
      case 'duration':
        comparison = a.ms_played - b.ms_played
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  return sorted
})

const formatDate = (timestamp: string) => {
  return format(new Date(timestamp), 'MMM d, yyyy')
}

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm')
}

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script> 