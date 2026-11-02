export function useWebSocket() {
  const wsConnection = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  // ฟังก์ชันสำหรับแปลง ArrayBuffer เป็น Int32
  function arrayBufferToInt32(buffer: ArrayBuffer, offset: number): number {
    const value = new Int32Array(buffer.slice(offset, offset + 4))[0]
    if (value === undefined) {
      throw new Error('Failed to read Int32 from buffer')
    }
    return value
  }

  // สร้าง WebSocket connection
  function connect(url: string) {
    if (wsConnection.value?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      wsConnection.value = new WebSocket(url)

      wsConnection.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        error.value = null
      }

      wsConnection.value.onerror = (event) => {
        console.error('WebSocket error:', event)
        error.value = 'Connection error'
      }

      wsConnection.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        wsConnection.value = null
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect'
      isConnected.value = false
    }
  }

  // รับข้อมูล XML
  async function receiveXmlData(): Promise<string> {
    if (!wsConnection.value || wsConnection.value.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }

    return new Promise((resolve, reject) => {
      let receivedData = new Uint8Array()
      let messageLength = 0
      let isWaitingForHeader = true

      wsConnection.value!.onmessage = async (event) => {
        try {
          const data = await event.data.arrayBuffer()

          if (isWaitingForHeader) {
            if (data.byteLength < 8) {
              reject(new Error('Invalid header size'))
              return
            }

            // อ่าน header
            const topic = arrayBufferToInt32(data, 0)
            messageLength = arrayBufferToInt32(data, 4)
            isWaitingForHeader = false

            // เริ่มเก็บข้อมูลหลัง header
            const contentData = new Uint8Array(data.slice(8))
            receivedData = new Uint8Array([...receivedData, ...contentData])

          } else {
            // เก็บข้อมูล chunk
            const chunk = new Uint8Array(data)
            receivedData = new Uint8Array([...receivedData, ...chunk])
          }

          // ตรวจสอบว่าได้ข้อมูลครบแล้ว
          if (receivedData.length >= messageLength) {
            const decoder = new TextDecoder('utf-16le')
            const xmlString = decoder.decode(receivedData.slice(0, messageLength))
            resolve(xmlString)

            // รีเซ็ตตัวแปร
            receivedData = new Uint8Array()
            messageLength = 0
            isWaitingForHeader = true
          }

        } catch (error) {
          reject(error)
        }
      }
    })
  }

  // ปิด connection
  function disconnect() {
    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
      isConnected.value = false
    }
  }

  // Cleanup เมื่อ component ถูกทำลาย
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    error,
    connect,
    disconnect,
    receiveXmlData
  }
} 