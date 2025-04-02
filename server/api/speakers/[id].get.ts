import { Speaker } from '../../../types/speaker'
import { getSpeakerByIdFromDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id || '')
    
    if (isNaN(id)) {
      throw new Error('Invalid speaker ID')
    }

    const speaker = getSpeakerByIdFromDb(id)
    
    if (!speaker) {
      throw new Error('Speaker not found')
    }

    return {
      success: true,
      data: speaker
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}) 