<template>
  <div class="sticky top-0 z-10 bg-gray-100 py-4 -mx-4 px-4 shadow-sm">
    <div class="flex justify-between items-center">
      <div class="flex space-x-4">
        <button 
          v-for="tab in tabs"
          :key="tab"
          @click="$emit('tab-change', tab)"
          class="px-4 py-2 rounded-lg"
          :class="activeTab === tab ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab }}
        </button>
      </div>
      
      <select 
        v-if="activeTab === 'overview'"
        :value="selectedYear"
        @change="handleYearChange"
        class="border rounded px-3 py-1 bg-white"
      >
        <option value="all">All Years</option>
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
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
  reason_end: string
}

type Tab = 'overview' | 'daily' | 'search'

const props = defineProps<{
  streamingData: StreamingHistoryItem[]
  activeTab: Tab
  selectedYear: string | number
}>()

const emit = defineEmits<{
  (e: 'tab-change', tab: Tab): void
  (e: 'update:selectedYear', value: string | number): void
}>()

const tabs: Tab[] = ['overview', 'daily', 'search']

const availableYears = computed(() => {
  if (!props.streamingData) return []
  const years = new Set<number>()
  props.streamingData.forEach((item: StreamingHistoryItem) => {
    const year = new Date(item.ts).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Sort descending
})

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:selectedYear', value === 'all' ? 'all' : Number(value))
}
</script> 