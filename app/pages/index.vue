<template>
<UContainer class="mt-5">
      <!-- แถบแสดง Microphones ที่เปิดใช้งาน -->
      <div class="grid auto-cols-max grid-flow-col gap-4 ">
        
        <div class="mb-6 p-4 bg-gray-700 rounded-lg w-80 ">
          <h2 class="text-lg font-semibold mb-2">Active Mic</h2>
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="speaker in activeSpeakers" :key="speaker.id" color="error">
              {{ speaker.name }}
            </UBadge>
          </div>
        </div>

      <!-- Grid แสดง Microphones -->
      <div class="grid grid-cols-8 gap-4">
        <div v-for="speaker in speakers" :key="speaker.id" class="flex flex-col items-center gap-2">
          
            <UButton
              class="text-center w-full"
              size="xl"
              :loading="speaker.isUpdating"
              :color="speaker.micOn ? 'error' : 'neutral'"
              @click="toggleMic(speaker)"
            >
              <span class="text-center">{{ speaker.name }}</span>
            </UButton>
        </div>
      </div>  
      </div>
</UContainer>
</template>

<script setup lang="ts">
interface Speaker {
  id: number
  name: string
  micOn: boolean
  isUpdating: boolean
}

const speakers = ref<Speaker[]>([])
const error = ref<string | null>(null)

// ดึงข้อมูลครั้งแรก
const { data: speakersData } = await useFetch<Speaker[]>('/api/speakers/available')
if (speakersData.value && Array.isArray(speakersData.value)) {
  speakers.value = speakersData.value.map((speaker: any) => ({
    ...speaker,
    isUpdating: false
  }))
}

const activeSpeakers = computed(() => {
  return speakers.value.filter(speaker => speaker.micOn)
})

const toggleMic = async (speaker: Speaker) => {
  if (speaker.isUpdating) return
  
  try {
    speaker.isUpdating = true
    const newStatus = !speaker.micOn

    // ใช้ URL จาก runtimeConfig
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || 'http://192.168.1.125:3000'
    
    const response = await fetch(`${baseURL}/api/speaker/${speaker.id}/mic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({
        micOn: newStatus
      })
    })
    
    if (response.ok) {
      // อัพเดท UI ทันที
      speaker.micOn = newStatus
      error.value = null
      
      // แสดง feedback
      if (process.client) {
        useToast().add({
          title: 'Success',
          description: `${speaker.name} ${newStatus ? 'เปิด' : 'ปิด'}`,
          color: 'success',
          timeout: 2000
        })
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (err) {
    console.error('Failed to update mic status:', err)
    error.value = 'ไม่สามารถอัพเดทสถานะไมค์ได้'
    
    if (process.client) {
      useToast().add({
        title: 'Error',
        description: 'ไม่สามารถอัพเดทสถานะไมค์ได้',
        color: 'error',
        timeout: 3000
      })
    }
    
    // ถ้าเกิด error ให้ refresh ข้อมูลใหม่
    await refreshData()
  } finally {
    speaker.isUpdating = false
  }
}

// ฟังก์ชันสำหรับรีเฟรชข้อมูล
const refreshData = async () => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || 'http://192.168.1.125:3000'
    
    const response = await fetch(`${baseURL}/api/speakers/available`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors',
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        speakers.value = data.map((speaker: any) => ({
          ...speaker,
          isUpdating: speakers.value.find(s => s.id === speaker.id)?.isUpdating || false
        }))
        error.value = null
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (err) {
    console.error('Failed to refresh data:', err)
    error.value = 'ไม่สามารถรีเฟรชข้อมูลได้'
    
    if (process.client) {
      useToast().add({
        title: 'Error',
        description: 'ไม่สามารถรีเฟรชข้อมูลได้',
        color: 'error',
        timeout: 3000
      })
    }
  }
}

// ตั้ง interval สำหรับรีเฟรชข้อมูลเฉพาะบน client
let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  refreshInterval = setInterval(refreshData, 5000)
})

// cleanup เมื่อ component ถูกทำลาย
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.u-grid {
  --un-grid-cols: 3;
}
</style> 