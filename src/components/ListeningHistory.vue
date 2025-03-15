<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Listening History</h2>
      <select 
        v-model="selectedYear" 
        class="border rounded px-3 py-1"
        @change="updateChart"
      >
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
    <div class="chart-container">
        <Bar
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { format, parse, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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
}

interface Props {
  streamingData: StreamingHistoryItem[]
}

const props = defineProps<Props>()
const selectedYear = ref<number>(new Date().getFullYear())
const chartData = ref<any>(null)

const availableYears = computed(() => {
  const years = new Set<number>()
  props.streamingData.forEach(item => {
    const year = new Date(item.ts).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Sort descending
})

// Set initial year to most recent year in data
onMounted(() => {
  if (availableYears.value.length > 0) {
    selectedYear.value = availableYears.value[0]
    updateChart()
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const minutes = Math.round(context.parsed.y)
          return `${minutes} minutes`
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Minutes Played'
      }
    },
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 90
      }
    }
  }
}

const updateChart = () => {
  // Get all days in the selected year
  const start = startOfYear(new Date(selectedYear.value, 0, 1))
  const end = endOfYear(start)
  const days = eachDayOfInterval({ start, end })

  // Initialize minutes for each day
  const dailyMinutes = new Map<string, number>()
  days.forEach(day => {
    dailyMinutes.set(format(day, 'yyyy-MM-dd'), 0)
  })

  // Sum up minutes for each day
  props.streamingData.forEach(item => {
    const date = format(new Date(item.ts), 'yyyy-MM-dd')
    const year = new Date(item.ts).getFullYear()
    
    if (year === selectedYear.value) {
      const currentMinutes = dailyMinutes.get(date) || 0
      dailyMinutes.set(date, currentMinutes + (item.ms_played / (1000 * 60)))
    }
  })

  // Create chart data
  chartData.value = {
    labels: Array.from(dailyMinutes.keys()).map(date => 
      format(parse(date, 'yyyy-MM-dd', new Date()), 'MMM d')
    ),
    datasets: [
      {
        data: Array.from(dailyMinutes.values()).map(minutes => Math.round(minutes)),
        backgroundColor: '#22c55e', // Green color matching the upload button
        borderRadius: 4
      }
    ]
  }
}
</script>

<style scoped>
.chart-container {
  height: 400px;
}
</style> 