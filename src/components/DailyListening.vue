<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">Daily Listening</h2>
      <input
        type="date"
        v-model="store.selectedDate"
        class="border rounded px-3 py-1"
        :min="minDate"
        :max="maxDate"
      />
    </div>

    <div v-if="store.selectedDate && dailyTracks.length > 0" class="space-y-4">
      <div class="flex gap-4 mb-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search tracks..."
          class="border rounded px-3 py-1 flex-grow"
        />
      </div>

      <TrackTable 
        :tracks="filteredTracks" 
        :show-time="true"
        @search="handleTableSearch"
      />
    </div>

    <div v-else-if="store.selectedDate" class="text-center text-gray-500 py-8">
      No tracks found for this date
    </div>

    <div v-else class="text-center text-gray-500 py-8">
      Select a date to see your listening history
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DailyListening'
})
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useStreamingStore } from '../stores/streaming'
import type { StreamingHistoryItem } from '../stores/streaming'
import TrackTable from './TrackTable.vue'

const store = useStreamingStore()
const searchQuery = ref('')

// Handle search from table
const handleTableSearch = (params: { type: string, query: string }) => {
  emit('search', params)
}

const emit = defineEmits<{
  (e: 'search', params: { type: string, query: string }): void
}>()

// Get min and max dates from the data
const minDate = computed(() => {
  if (!store.streamingData.length) return ''
  const dates = store.streamingData.map((item: StreamingHistoryItem) => item.ts.split('T')[0])
  return dates.reduce((a, b) => a < b ? a : b)
})

const maxDate = computed(() => {
  if (!store.streamingData.length) return ''
  const dates = store.streamingData.map((item: StreamingHistoryItem) => item.ts.split('T')[0])
  return dates.reduce((a, b) => a > b ? a : b)
})

// Get tracks for selected date
const dailyTracks = computed(() => {
  if (!store.selectedDate || !store.streamingData) return []
  return store.streamingData.filter((item: StreamingHistoryItem) => 
    item.ts.startsWith(store.selectedDate)
  )
})

// Filter tracks based on search query
const filteredTracks = computed(() => {
  if (!searchQuery.value) return dailyTracks.value

  const query = searchQuery.value.toLowerCase()
  return dailyTracks.value.filter((track: StreamingHistoryItem) => 
    track.master_metadata_track_name?.toLowerCase().includes(query) ||
    track.master_metadata_album_artist_name?.toLowerCase().includes(query) ||
    track.master_metadata_album_album_name?.toLowerCase().includes(query)
  )
})
</script> 