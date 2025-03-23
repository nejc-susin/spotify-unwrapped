<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8">Spotify Unwrapped</h1>
      
      <div v-if="!store.streamingData.length">
        <UploadSection @data-loaded="handleDataLoaded" />
      </div>

      <div v-else>
        <Navigation />

        <div class="mt-6">
          <OverviewSection
            v-if="store.activeTab === 'overview'"
            @date-select="handleDateSelect"
            @search="handleSearch"
          />

          <DailyListening
            v-else-if="store.activeTab === 'daily'"
            @search="handleSearch"
          />

          <SearchPlays
            v-else-if="store.activeTab === 'search'"
            ref="searchComponent"
          />

          <HabitsSection
            v-else-if="store.activeTab === 'habits'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useStreamingStore } from './stores/streaming'
import type { StreamingHistoryItem } from './stores/streaming'
import UploadSection from './components/UploadSection.vue'
import Navigation from './components/Navigation.vue'
import OverviewSection from './components/OverviewSection.vue'
import DailyListening from './components/DailyListening.vue'
import SearchPlays from './components/SearchPlays.vue'
import HabitsSection from './components/HabitsSection.vue'

const store = useStreamingStore()
const searchComponent = ref(null)

// Event handlers
const handleDataLoaded = (rawData: StreamingHistoryItem[]) => {
  store.setStreamingData(rawData)
}

const handleDateSelect = (date: string) => {
  store.setSelectedDate(date)
  store.setActiveTab('daily')
}

const handleSearch = (params: { type: string, query: string }) => {
  store.setActiveTab('search')
  nextTick(() => {
    if (searchComponent.value) {
      searchComponent.value.searchQuery = params.query
      searchComponent.value.searchType = params.type
      searchComponent.value.performSearch()
    }
  })
}
</script> 