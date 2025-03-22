<template>
  <div class="text-center">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const emit = defineEmits<{
  (e: 'data-loaded', data: StreamingHistoryItem[]): void
}>()

const fileInput = ref<HTMLInputElement>()

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  const text = await file.text()
  const rawData = JSON.parse(text) as StreamingHistoryItem[]
  emit('data-loaded', rawData)
}

const loadSampleData = async () => {
  try {
    const response = await fetch('/spotify-unwrapped/assets/data/Clean_Streaming_History_2020-2023.json')
    const rawData = await response.json() as StreamingHistoryItem[]
    emit('data-loaded', rawData)
  } catch (error) {
    console.error('Error loading sample data:', error)
    alert('Failed to load sample data. Please try again.')
  }
}
</script> 