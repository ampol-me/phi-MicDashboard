import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Speaker } from '../../../types/speaker'
import { initializeDb, getAllSpeakersFromDb } from '../../utils/db'

// ฟังก์ชันสำหรับโหลดข้อมูลตั้งต้น
function loadInitialData(): Speaker[] {
  try {
    const seatsPath = resolve(process.cwd(), 'server/data/seats.json')
    const fileContent = readFileSync(seatsPath, 'utf-8')
    // ลบ whitespace และ newlines ที่ไม่จำเป็น
    const cleanContent = fileContent.trim()
    const seatsData = JSON.parse(cleanContent)
    
    return seatsData.map((seat: any) => ({
      id: seat.id,
      name: seat.name,
      connected: seat.connected,
      batteryStatus: seat.batteryStatus,
      signalLevel: seat.signalLevel,
      micOn: false
    }))
  } catch (error) {
    console.error('Failed to load initial data:', error)
    return []
  }
}

// ตัวแปรเก็บสถานะการ initialize
let isInitialized = false

// แสดงเฉพาะไมค์ที่เปิดอยู่
export default defineEventHandler(() => {
  try {
    // initialize database ถ้ายังไม่เคยทำ
    if (!isInitialized) {
      const initialData = loadInitialData()
      initializeDb(initialData)
      isInitialized = true
    }

    // ดึงข้อมูลจาก database และกรองเฉพาะไมค์ที่เปิดอยู่
    const speakers = getAllSpeakersFromDb()
    return speakers

  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})