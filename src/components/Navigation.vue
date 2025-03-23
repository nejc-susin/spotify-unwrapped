<template>
  <div class="sticky top-0 z-10 bg-gray-100 py-4 -mx-4 px-4 shadow-sm">
    <div class="flex justify-between items-center">
      <div class="flex space-x-4">
        <button 
          v-for="tab in tabs"
          :key="tab"
          @click="store.setActiveTab(tab)"
          class="px-4 py-2 rounded-lg"
          :class="store.activeTab === tab ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab }}
        </button>
      </div>
      
      <select 
        v-if="store.activeTab === 'overview'"
        :value="store.selectedYear"
        @change="handleYearChange"
        class="border rounded px-3 py-1 bg-white"
      >
        <option value="all">All Years</option>
        <option v-for="year in store.availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStreamingStore } from '../stores/streaming'

type Tab = 'overview' | 'daily' | 'search' | 'habits'

const store = useStreamingStore()
const tabs: Tab[] = ['overview', 'daily', 'search', 'habits']

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  store.setSelectedYear(value === 'all' ? 'all' : Number(value))
}
</script> 