<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Spotify Unwrapped</h1>
      
      <div v-if="!streamingData">
        <UploadSection @data-loaded="handleDataLoaded" />
      </div>

      <div v-else>
        <Navigation
          :streaming-data="streamingData"
          :active-tab="activeTab"
          v-model:selected-year="selectedYear"
          @tab-change="switchTab"
        />

        <div class="mt-6">
          <OverviewSection
            v-if="activeTab === 'overview'"
            :streaming-data="streamingData"
            :selected-year="selectedYear"
            @date-select="handleDateSelect"
            @search="handleSearch"
          />

          <DailyListening
            v-else-if="activeTab === 'daily'"
            :streaming-data="streamingData"
            :initial-date="selectedDate"
            @search="handleSearch"
          />

          <SearchPlays
            v-else
            ref="searchComponent"
            :streaming-data="streamingData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import UploadSection from './components/UploadSection.vue'
import Navigation from './components/Navigation.vue'
import OverviewSection from './components/OverviewSection.vue'
import DailyListening from './components/DailyListening.vue'
import SearchPlays from './components/SearchPlays.vue'

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

// State
const streamingData = ref<StreamingHistoryItem[]>()
const selectedYear = ref<string | number>('all')
const activeTab = ref<Tab>('overview')
const selectedDate = ref('')
const searchComponent = ref(null)

// Event handlers
const handleDataLoaded = (rawData: StreamingHistoryItem[]) => {
  // Filter to only include tracks that ended with "trackdone"
  streamingData.value = rawData.filter((item: StreamingHistoryItem) => item.reason_end === "trackdone")
}

const handleDateSelect = (date: string) => {
  selectedDate.value = date
  switchTab('daily')
}

const switchTab = (tab: Tab, searchParams?: { type: string, query: string }) => {
  activeTab.value = tab
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  if (tab === 'search' && searchParams) {
    nextTick(() => {
      searchComponent.value.searchQuery = searchParams.query
      searchComponent.value.searchType = searchParams.type
      searchComponent.value.performSearch()
    })
  }
}

const handleSearch = (params: { type: string, query: string }) => {
  switchTab('search', params)
}
</script> 