<template>
<UContainer class="mt-5">
      <!-- แถบแสดง Mi
       crophones ที่เปิดใช้งาน -->
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

<script setup>
const speakers = ref([])

// ดึงข้อมูลครั้งแรก
const { data: speakersData } = await useFetch('/api/speakers/available')
speakers.value = speakersData.value.map(speaker => ({
  ...speaker,
  isUpdating: false
}))

const activeSpeakers = computed(() => {
  return speakers.value.filter(speaker => speaker.micOn)
})

const toggleMic = async (speaker) => {
  try {
    speaker.isUpdating = true
    const newStatus = !speaker.micOn
    
    await $fetch(`/api/speaker/${speaker.id}/mic`, {
      method: 'PUT',
      body: {
        micOn: newStatus
      }
    })
    
    speaker.micOn = newStatus
  } catch (error) {
    console.error('Failed to update mic status:', error)
    // แสดง error notification ถ้าต้องการ
  } finally {
    speaker.isUpdating = false
  }
}

// ฟังก์ชันสำหรับรีเฟรชข้อมูล
const refreshData = async () => {
  const { data: newData } = await useFetch('/api/speakers/available')
  if (newData.value) {
    speakers.value = newData.value.map(speaker => ({
      ...speaker,
      isUpdating: speakers.value.find(s => s.id === speaker.id)?.isUpdating || false
    }))
  }
}

// ตั้ง interval สำหรับรีเฟรชข้อมูลเฉพาะบน client
let refreshInterval
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