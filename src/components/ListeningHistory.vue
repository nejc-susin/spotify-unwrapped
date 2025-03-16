<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="mb-4">
      <h2 class="text-2xl font-bold">Listening History</h2>
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
import { ref, computed, onMounted, watch } from 'vue'
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
const chartData = ref<any>(null)
const dailyMinutes = ref(new Map<string, number>())

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
  },
  onHover: (evt, activeEls) => {
      activeEls.length > 0 ? evt.chart.canvas.style.cursor = 'pointer' : evt.chart.canvas.style.cursor = 'default';
    },
  onClick: (event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index
      const dates = Array.from(dailyMinutes.value.keys())
      if (dates[index]) {
        emit('dateSelect', dates[index])
      }
    }
  }
}

const emit = defineEmits<{
  (e: 'dateSelect', date: string): void
}>()

const updateChart = () => {
  if (!props.streamingData.length) return

  // Get the year range from the data
  const dates = props.streamingData.map(item => new Date(item.ts))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  // Get all days in the range
  const days = eachDayOfInterval({ start: minDate, end: maxDate })

  // Initialize minutes for each day
  dailyMinutes.value = new Map()
  days.forEach(day => {
    dailyMinutes.value.set(format(day, 'yyyy-MM-dd'), 0)
  })

  // Sum up minutes for each day
  props.streamingData.forEach(item => {
    const date = format(new Date(item.ts), 'yyyy-MM-dd')
    const currentMinutes = dailyMinutes.value.get(date) || 0
    dailyMinutes.value.set(date, currentMinutes + (item.ms_played / (1000 * 60)))
  })

  // Create chart data
  chartData.value = {
    labels: Array.from(dailyMinutes.value.keys()).map(date => 
      format(parse(date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')
    ),
    datasets: [
      {
        data: Array.from(dailyMinutes.value.values()).map(minutes => Math.round(minutes)),
        backgroundColor: '#22c55e',
        borderRadius: 4
      }
    ]
  }
}

// Watch for changes in streaming data
watch(() => props.streamingData, () => {
  updateChart()
}, { immediate: true })
</script>

<style scoped>
.chart-container {
  height: 400px;
}
</style> 