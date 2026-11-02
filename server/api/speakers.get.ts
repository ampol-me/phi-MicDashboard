import { getAllSpeakersFromDb } from '../utils/db'

// แสดงไมค์ทั้งหมด
export default defineEventHandler(() => {
  try {

    const speakers = getAllSpeakersFromDb()
    const seats =  speakers.filter(speaker => speaker.micOn === true)

    return seats.map((seat: any) => ({
      id: seat.id,
      name: seat.name,
      seatName: seat.id.toString().padStart(4, '0'),
      prio: seat.prio,
      prioOn: false,
      participantId: 65535,
      micOn: seat.micOn
    }))

  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}) 