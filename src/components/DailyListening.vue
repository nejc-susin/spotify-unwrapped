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
        <select v-model="sortBy" class="border rounded px-3 py-1">
          <option value="time">Sort by Time</option>
          <option value="track">Sort by Track Name</option>
          <option value="artist">Sort by Artist</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left py-2 px-4">Time</th>
              <th class="text-left py-2 px-4">Track</th>
              <th class="text-left py-2 px-4">Artist</th>
              <th class="text-left py-2 px-4">Album</th>
              <th class="text-left py-2 px-4">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="track in filteredAndSortedTracks" :key="track.ts" class="border-t">
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

    <div v-else-if="selectedDate" class="text-center text-gray-500 py-8">
      No tracks found for this date
    </div>

    <div v-else class="text-center text-gray-500 py-8">
      Select a date to see your listening history
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, parse } from 'date-fns'

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
const selectedDate = ref('')
const searchQuery = ref('')
const sortBy = ref('time')

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

// Filter and sort tracks
const filteredAndSortedTracks = computed(() => {
  let tracks = [...dailyTracks.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tracks = tracks.filter(track => 
      track.master_metadata_track_name?.toLowerCase().includes(query) ||
      track.master_metadata_album_artist_name?.toLowerCase().includes(query) ||
      track.master_metadata_album_album_name?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  tracks.sort((a, b) => {
    switch (sortBy.value) {
      case 'time':
        return a.ts.localeCompare(b.ts)
      case 'track':
        return (a.master_metadata_track_name || '').localeCompare(b.master_metadata_track_name || '')
      case 'artist':
        return (a.master_metadata_album_artist_name || '').localeCompare(b.master_metadata_album_artist_name || '')
      case 'duration':
        return b.ms_played - a.ms_played
      default:
        return 0
    }
  })

  return tracks
})

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm')
}

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script> 