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

        <TrackTable 
          :tracks="searchResults" 
          :show-date="true" 
          :show-time="true"
          @search="handleTableSearch"
        />
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchPlays'
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useStreamingStore } from '../stores/streaming'
import type { StreamingHistoryItem } from '../stores/streaming'
import TrackTable from './TrackTable.vue'

const store = useStreamingStore()

const searchQuery = ref('')
const searchType = ref('all')
const hasSearched = ref(false)
const searchResults = ref<StreamingHistoryItem[]>([])

const handleTableSearch = (params: { type: string, query: string }) => {
  searchType.value = params.type
  searchQuery.value = params.query
  performSearch()
}

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = true
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = store.streamingData.filter((item: StreamingHistoryItem) => {
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

// Expose properties and methods for external access
defineExpose({
  searchType,
  searchQuery,
  performSearch
})
</script> 