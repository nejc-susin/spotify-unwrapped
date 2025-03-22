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
        <p class="mt-4 text-gray-600">
          Don't have your data yet? Try our
          <button
            @click="loadSampleData"
            class="text-green-500 hover:text-green-600 underline"
          >
            sample data
          </button>
        </p>
      </div>

      <div v-else>
        <div class="sticky top-0 z-10 bg-gray-100 py-4 -mx-4 px-4 shadow-sm">
          <div class="flex justify-between items-center">
            <div class="flex space-x-4">
              <button 
                @click="switchTab('overview')"
                class="px-4 py-2 rounded-lg"
                :class="activeTab === 'overview' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
              >
                Overview
              </button>
              <button 
                @click="switchTab('daily')"
                class="px-4 py-2 rounded-lg"
                :class="activeTab === 'daily' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
              >
                Daily Listening
              </button>
              <button 
                @click="switchTab('search')"
                class="px-4 py-2 rounded-lg"
                :class="activeTab === 'search' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
              >
                Search
              </button>
            </div>
            
            <select 
              v-if="activeTab === 'overview'"
              v-model="selectedYear" 
              class="border rounded px-3 py-1 bg-white"
            >
              <option value="all">All Years</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-6">
          <div v-if="activeTab === 'overview'">
            <div class="mb-8 bg-white p-6 rounded-lg shadow">
              <h2 class="text-2xl font-bold mb-4">Listening Overview</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Total Listening Time</div>
                  <div class="text-2xl font-bold">{{ formatDuration(totalListeningTime) }}</div>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Total Plays</div>
                  <div class="text-2xl font-bold">{{ filteredData.length }}</div>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Unique Artists</div>
                  <div class="text-2xl font-bold">{{ uniqueArtists }}</div>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Unique Songs</div>
                  <div class="text-2xl font-bold">{{ uniqueSongs }}</div>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Unique Albums</div>
                  <div class="text-2xl font-bold">{{ uniqueAlbums }}</div>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-500">Average Daily Listening</div>
                  <div class="text-2xl font-bold">{{ formatDuration(totalListeningTime / (filteredData.length ? Math.ceil(filteredData.length / 24) : 1)) }}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TopArtists :streaming-data="filteredData" @search="handleSearch" />
              <TopSongs :streaming-data="filteredData" @search="handleSearch" />
              <TopAlbums :streaming-data="filteredData" @search="handleSearch" />
            </div>

            <div class="mt-6 h-[400px]">
              <ListeningHistory 
                :streaming-data="filteredData" 
                @date-select="date => {
                  selectedDate = date;
                  switchTab('daily');
                }"
              />
            </div>
          </div>

          <div v-else-if="activeTab === 'daily'">
            <DailyListening 
              :streaming-data="streamingData" 
              :initial-date="selectedDate"
              @search="handleSearch"
            />
          </div>
          <div v-else>
            <SearchPlays ref="searchComponent" :streaming-data="streamingData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import TopArtists from './components/TopArtists.vue'
import TopSongs from './components/TopSongs.vue'
import TopAlbums from './components/TopAlbums.vue'
import ListeningHistory from './components/ListeningHistory.vue'
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
const fileInput = ref<HTMLInputElement>()
const selectedYear = ref<string | number>('all')
const activeTab = ref<Tab>('overview')
const selectedDate = ref('')
const searchComponent = ref(null)

// Computed properties
const availableYears = computed(() => {
  if (!streamingData.value) return []
  const years = new Set<number>()
  streamingData.value.forEach((item: StreamingHistoryItem) => {
    const year = new Date(item.ts).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Sort descending
})

const filteredData = computed(() => {
  if (!streamingData.value) return []
  if (selectedYear.value === 'all') return streamingData.value

  return streamingData.value.filter((item: StreamingHistoryItem) => {
    const year = new Date(item.ts).getFullYear()
    return year === selectedYear.value
  })
})

// Statistics computed properties
const totalListeningTime = computed(() => {
  if (!filteredData.value) return 0
  return filteredData.value.reduce((total: number, item: StreamingHistoryItem) => total + item.ms_played, 0)
})

const uniqueArtists = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => item.master_metadata_album_artist_name)).size
})

const uniqueSongs = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => 
    `${item.master_metadata_track_name}-${item.master_metadata_album_artist_name}`
  )).size
})

const uniqueAlbums = computed(() => {
  if (!filteredData.value) return 0
  return new Set(filteredData.value.map((item: StreamingHistoryItem) => 
    `${item.master_metadata_album_album_name}-${item.master_metadata_album_artist_name}`
  )).size
})

// Utility functions
const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const processStreamingData = (rawData: StreamingHistoryItem[]) => {
  // Filter to only include tracks that ended with "trackdone"
  streamingData.value = rawData.filter((item: StreamingHistoryItem) => item.reason_end === "trackdone")
  // Set initial year to most recent
  if (availableYears.value.length > 0) {
    selectedYear.value = availableYears.value[0]
  }
}

// Event handlers
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  const text = await file.text()
  const rawData = JSON.parse(text) as StreamingHistoryItem[]
  processStreamingData(rawData)
}

const loadSampleData = async () => {
  try {
    const response = await fetch('/spotify-unwrapped/assets/data/Clean_Streaming_History_2020-2023.json')
    const rawData = await response.json() as StreamingHistoryItem[]
    processStreamingData(rawData)
  } catch (error) {
    console.error('Error loading sample data:', error)
    alert('Failed to load sample data. Please try again.')
  }
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