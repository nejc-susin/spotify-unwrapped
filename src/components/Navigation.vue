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

defineProps<{
  activeTab: Tab
  selectedYear: string | number
}>()

const emit = defineEmits<{
  (e: 'tab-change', tab: Tab): void
  (e: 'update:selectedYear', value: string | number): void
}>()

const tabs: Tab[] = ['overview', 'daily', 'search', 'habits']

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:selectedYear', value === 'all' ? 'all' : Number(value))
}
</script> 