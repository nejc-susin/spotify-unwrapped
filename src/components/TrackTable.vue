<template>
  <div class="overflow-x-auto">
    <table class="min-w-full">
      <thead class="bg-gray-50 sticky top-0">
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.key"
            class="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
            @click="sort(column.key)"
          >
            <div class="flex items-center gap-1">
              {{ column.label }}
              <span v-if="sortKey === column.key" class="text-xs">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="track in sortedTracks" :key="track.ts" class="border-t hover:bg-gray-50">
          <td v-if="showDate" class="py-2 px-4">{{ formatDate(track.ts) }}</td>
          <td v-if="showTime" class="py-2 px-4">{{ formatTime(track.ts) }}</td>
          <td class="py-2 px-4">
            <span 
              class="cursor-pointer hover:text-green-600"
              @click="emit('search', { type: 'track', query: track.master_metadata_track_name })"
            >
              {{ track.master_metadata_track_name }}
            </span>
          </td>
          <td class="py-2 px-4">
            <span 
              class="cursor-pointer hover:text-green-600"
              @click="emit('search', { type: 'artist', query: track.master_metadata_album_artist_name })"
            >
              {{ track.master_metadata_album_artist_name }}
            </span>
          </td>
          <td class="py-2 px-4">
            <span 
              class="cursor-pointer hover:text-green-600"
              @click="emit('search', { type: 'album', query: track.master_metadata_album_album_name })"
            >
              {{ track.master_metadata_album_album_name }}
            </span>
          </td>
          <td class="py-2 px-4">{{ formatDuration(track.ms_played) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TrackTable'
})
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import type { StreamingHistoryItem } from '../stores/streaming'

interface Props {
  tracks: StreamingHistoryItem[]
  showDate?: boolean
  showTime?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDate: false,
  showTime: false
})

const emit = defineEmits<{
  (e: 'search', params: { type: string, query: string }): void
}>()

const sortKey = ref<string>('ts')
const sortOrder = ref<'asc' | 'desc'>('desc')

const columns = computed(() => {
  const cols = []
  if (props.showDate) cols.push({ key: 'date', label: 'Date' })
  if (props.showTime) cols.push({ key: 'time', label: 'Time' })
  cols.push(
    { key: 'track', label: 'Track' },
    { key: 'artist', label: 'Artist' },
    { key: 'album', label: 'Album' },
    { key: 'duration', label: 'Duration' }
  )
  return cols
})

const sortedTracks = computed(() => {
  const tracks = [...props.tracks]
  tracks.sort((a, b) => {
    let comparison = 0
    switch (sortKey.value) {
      case 'date':
      case 'time':
      case 'ts':
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
  return tracks
})

const sort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

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

<style scoped>
thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style> 