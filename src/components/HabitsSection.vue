<template>
  <div class="space-y-8">
    <!-- Playback Habits -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold mb-4">Playback Habits</h2>
      <div class="space-y-4">
        <!-- Shuffle -->
        <div>
          <div class="text-sm text-gray-600 mb-1">Shuffle Mode</div>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-green-500" 
                  :style="{ width: `${shufflePercentage}%` }"
                ></div>
              </div>
            </div>
            <div class="text-lg">
              {{ shufflePercentage }}%
            </div>
          </div>
        </div>

        <!-- Skipped -->
        <div>
          <div class="text-sm text-gray-600 mb-1">Skipped Tracks</div>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-green-500" 
                  :style="{ width: `${skippedPercentage}%` }"
                ></div>
              </div>
            </div>
            <div class="text-lg">
              {{ skippedPercentage }}%
            </div>
          </div>
        </div>

        <!-- Offline -->
        <div>
          <div class="text-sm text-gray-600 mb-1">Offline Plays</div>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-green-500" 
                  :style="{ width: `${offlinePercentage}%` }"
                ></div>
              </div>
            </div>
            <div class="text-lg">
              {{ offlinePercentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Song Endings -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold mb-4">How Songs End</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(count, reason) in endReasons" :key="reason" class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-3xl font-bold text-green-500">{{ ((count / store.totalPlays) * 100).toFixed(1) }}%</div>
          <div class="text-gray-600 mt-2">{{ formatEndReason(reason) }}</div>
        </div>
      </div>
    </div>

    <!-- Song Starts -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold mb-4">How Songs Start</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(count, reason) in startReasons" :key="reason" class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-3xl font-bold text-green-500">{{ ((count / store.totalPlays) * 100).toFixed(1) }}%</div>
          <div class="text-gray-600 mt-2">{{ formatStartReason(reason) }}</div>
        </div>
      </div>
    </div>

    <!-- Time Distribution -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold mb-4">Listening Time Distribution</h2>
      
      <!-- Hours -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">By Hour of Day</h3>
        <div class="grid grid-cols-24 gap-1 h-24">
          <div 
            v-for="(count, hour) in hourDistribution" 
            :key="hour"
            class="bg-green-500"
            :style="{ 
              height: `${(count / maxHourCount * 100)}%`,
              opacity: 0.3 + (count / maxHourCount * 0.7)
            }"
            :title="`${hour}:00 - ${count.toFixed(2)} minutes`"
          ></div>
        </div>
        <div class="grid grid-cols-24 gap-1 text-xs mt-1">
          <div v-for="hour in 24" :key="hour" class="text-center">
            {{ (hour - 1)}}:00
          </div>
        </div>
      </div>

      <!-- Days -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">By Day of Week</h3>
        <div class="grid grid-cols-7 gap-4">
          <div 
            v-for="(count, day) in dayDistribution" 
            :key="day"
            class="text-center"
          >
            <div class="text-lg font-bold">{{ ((count / store.totalMinutes) * 100).toFixed(1) }}%</div>
            <div class="text-sm text-gray-600">{{ getDayName(day) }}</div>
          </div>
        </div>
      </div>

      <!-- Months -->
      <div>
        <h3 class="text-lg font-semibold mb-3">By Month</h3>
        <div class="grid grid-cols-6 md:grid-cols-12 gap-4">
          <div 
            v-for="(count, month) in monthDistribution" 
            :key="month"
            class="text-center"
          >
            <div class="text-lg font-bold">{{ ((count / store.totalMinutes) * 100).toFixed(1) }}%</div>
            <div class="text-sm text-gray-600">{{ getMonthName(month) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStreamingStore } from '../stores/streaming'
import type { StreamingHistoryItem } from '../stores/streaming'

const store = useStreamingStore()

// Playback habits
const shufflePercentage = computed(() => {
  if (!store.streamingData.length) return 0
  const shufflePlays = store.streamingData.filter((item: StreamingHistoryItem) => item.shuffle).length
  return Math.round((shufflePlays / store.streamingData.length) * 100)
})

const skippedPercentage = computed(() => {
  if (!store.streamingData.length) return 0
  const skippedPlays = store.streamingData.filter((item: StreamingHistoryItem) => item.skipped).length
  return Math.round((skippedPlays / store.streamingData.length) * 100)
})

const offlinePercentage = computed(() => {
  if (!store.streamingData.length) return 0
  const offlinePlays = store.streamingData.filter((item: StreamingHistoryItem) => item.offline).length
  return Math.round((offlinePlays / store.streamingData.length) * 100)
})

// Song endings and starts
const endReasons = computed(() => {
  const reasons: Record<string, number> = {}
  store.streamingData.forEach((item: StreamingHistoryItem) => {
    let reason = item.reason_end
    if (['unknown', 'trackerror', 'unexpected-exit-while-paused', 'unexpected-exit'].includes(item.reason_end)) {
      reason = "other"
    } else if (['fwdbtn', 'backbtn'].includes(item.reason_end)) {
      reason = "Next / Previous"
    } else if (['endplay', 'logout', 'remote'].includes(item.reason_end)) {
      reason = "Stopped Playing"
    }
    reasons[reason] = (reasons[reason] || 0) + 1
  })
  return reasons
})

const startReasons = computed(() => {
  const reasons: Record<string, number> = {}
  store.streamingData.forEach((item: StreamingHistoryItem) => {
    let reason = item.reason_start
    if (['clickrow', 'clickside'].includes(item.reason_start)) {
      reason = 'Clicked Track'
    } else if (['fwdbtn', 'backbtn'].includes(item.reason_start)) {
      reason = 'Next / Previous'
    } else if (['appload', 'restore', 'playbtn', 'remote', 'trackerror', 'unknown'].includes(item.reason_start)) {
      reason = 'Other'
    } else if (['trackdone'].includes(item.reason_start)) {
      reason = 'From Queue'
    }
    reasons[reason] = (reasons[reason] || 0) + 1
  })
  return reasons
})

// Time distributions
const hourDistribution = computed(() => {
  const hours: Record<number, number> = {}
  store.streamingData.forEach((item: StreamingHistoryItem) => {
    const hour = new Date(item.ts).getHours()
    hours[hour] = (hours[hour] || 0) + (item.ms_played / (1000 * 60))
  })
  return hours
})

const maxHourCount = computed(() => {
  if (!store.streamingData.length) return 0
  const values = Object.values(hourDistribution.value) as number[]
  return Math.max(...values)
})

const dayDistribution = computed(() => {
  const days: Record<number, number> = {}
  store.streamingData.forEach((item: StreamingHistoryItem) => {
    const day = new Date(item.ts).getDay()
    days[day] = (days[day] || 0) + (item.ms_played / (1000 * 60))
  })
  return days
})

const monthDistribution = computed(() => {
  const months: Record<number, number> = {}
  store.streamingData.forEach((item: StreamingHistoryItem) => {
    const month = new Date(item.ts).getMonth()
    months[month] = (months[month] || 0) + (item.ms_played / (1000 * 60))
  })
  return months
})

// Helper functions
const formatStartReason = (reason: string) => {
  if (!reason) return 'Unknown'
  const formatted = reason
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  return formatted
}

const formatEndReason = (reason: string) => {
  const formatted = reason
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  return formatted === 'Trackdone' ? 'Track Finished' : formatted
}

const getDayName = (day: string | number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[Number(day)]
}

const getMonthName = (month: string | number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[Number(month)]
}
</script>

<style scoped>
.grid-cols-24 {
  grid-template-columns: repeat(24, minmax(0, 1fr));
}
</style> 