import { defineStore } from 'pinia'

export interface StreamingHistoryItem {
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
  reason_start: string
  shuffle: boolean
  skipped: boolean
  offline: boolean
}

export const useStreamingStore = defineStore('streaming', {
  state: () => ({
    streamingData: [] as StreamingHistoryItem[],
    selectedYear: 'all' as string | number,
    activeTab: 'overview' as 'overview' | 'daily' | 'search' | 'habits',
    selectedDate: ''
  }),

  getters: {
    totalMinutes: (state) => 
      state.streamingData.reduce((sum: number, item: StreamingHistoryItem) => sum + (item.ms_played / (1000 * 60)), 0),

    totalPlays: (state) => state.streamingData.length,

    availableYears: (state) => {
      if (!state.streamingData.length) return []
      const years = new Set<number>()
      state.streamingData.forEach((item: StreamingHistoryItem) => {
        const year = new Date(item.ts).getFullYear()
        years.add(year)
      })
      return Array.from(years).sort((a, b) => b - a)
    }
  },

  actions: {
    setStreamingData(data: StreamingHistoryItem[]) {
      this.streamingData = data
    },

    setSelectedYear(year: string | number) {
      this.selectedYear = year
    },

    setActiveTab(tab: 'overview' | 'daily' | 'search' | 'habits') {
      this.activeTab = tab
    },

    setSelectedDate(date: string) {
      this.selectedDate = date
    }
  }
}) 