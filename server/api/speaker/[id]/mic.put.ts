import { updateSpeakerMicStatus } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id || '')
    
    if (isNaN(id)) {
      throw new Error('Invalid speaker ID')
    }

    const body = await readBody(event)
    
    if (typeof body.micOn !== 'boolean') {
      throw new Error('Invalid micOn value')
    }

    const success = updateSpeakerMicStatus(id, body.micOn)
    
    if (!success) {
      throw new Error('Failed to update mic status')
    }

    return {
      success: true,
      data: { id, micOn: body.micOn }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}) 