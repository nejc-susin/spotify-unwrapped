<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">Daily Listening</h2>
      <input
        type="date"
        v-model="selectedDate"
        class="border rounded px-3 py-1"
        :min="minDate"
        :max="maxDate"
      />
    </div>

    <div v-if="selectedDate && dailyTracks.length > 0" class="space-y-4">
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

    <div v-else-if="selectedDate" class="text-center text-gray-500 py-8">
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
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import TrackTable from './TrackTable.vue'
import type { StreamingHistoryItem } from '../stores/streaming'

interface Props {
  streamingData: StreamingHistoryItem[]
  initialDate?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'search', params: { type: string, query: string }): void
}>()

const selectedDate = ref(props.initialDate || '')
const searchQuery = ref('')

// Handle search from table
const handleTableSearch = (params: { type: string, query: string }) => {
  emit('search', params)
}

// Get min and max dates from the data
const minDate = computed(() => {
  if (!props.streamingData.length) return ''
  const dates = props.streamingData.map(item => item.ts.split('T')[0])
  return dates.reduce((a, b) => a < b ? a : b)
})

const maxDate = computed(() => {
  if (!props.streamingData.length) return ''
  const dates = props.streamingData.map(item => item.ts.split('T')[0])
  return dates.reduce((a, b) => a > b ? a : b)
})

// Get tracks for selected date
const dailyTracks = computed(() => {
  if (!selectedDate.value || !props.streamingData) return []
  return props.streamingData.filter(item => 
    item.ts.startsWith(selectedDate.value)
  )
})

// Filter tracks based on search query
const filteredTracks = computed(() => {
  if (!searchQuery.value) return dailyTracks.value

  const query = searchQuery.value.toLowerCase()
  return dailyTracks.value.filter(track => 
    track.master_metadata_track_name?.toLowerCase().includes(query) ||
    track.master_metadata_album_artist_name?.toLowerCase().includes(query) ||
    track.master_metadata_album_album_name?.toLowerCase().includes(query)
  )
})

// Watch for changes in initialDate prop
watch(() => props.initialDate, (newDate) => {
  if (newDate) {
    selectedDate.value = newDate
  }
})
</script> 