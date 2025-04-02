import Database from 'better-sqlite3'
import { Speaker } from '../../types/speaker'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbDir = resolve(__dirname, '../data')
const dbPath = resolve(dbDir, 'speakers.db')

// สร้างโฟลเดอร์ถ้ายังไม่มี
try {
  mkdirSync(dbDir, { recursive: true })
} catch (error) {
  console.error('Error creating database directory:', error)
}

const db = new Database(dbPath, {
  fileMustExist: false,
  readonly: false
})

// สร้างตาราง speakers ถ้ายังไม่มี
db.exec(`
  CREATE TABLE IF NOT EXISTS speakers (
    id INTEGER PRIMARY KEY,
    batteryStatus INTEGER,
    batteryCharges INTEGER,
    name TEXT,
    prio INTEGER,
    extra_seat INTEGER,
    signalStatus INTEGER,
    selected INTEGER,
    cameraPrepos INTEGER,
    batterySerialNo TEXT,
    cameraId INTEGER,
    unitType INTEGER,
    connected INTEGER,
    signalLevel INTEGER,
    dual INTEGER,
    unitId INTEGER,
    hasDisplay INTEGER,
    identification INTEGER,
    voting INTEGER,
    rangeTest INTEGER,
    unitProps INTEGER,
    micOn INTEGER NOT NULL DEFAULT 0
  )
`)

// เตรียม statements
const insertSpeaker = db.prepare(`
  INSERT OR REPLACE INTO speakers (
    id, batteryStatus, batteryCharges, name, prio, extra_seat,
    signalStatus, selected, cameraPrepos, batterySerialNo,
    cameraId, unitType, connected, signalLevel, dual,
    unitId, hasDisplay, identification, voting,
    rangeTest, unitProps, micOn
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?
  )
`)

const updateMicStatus = db.prepare(`
  UPDATE speakers
  SET micOn = ?
  WHERE id = ?
`)

const getAllSpeakers = db.prepare(`
  SELECT * FROM speakers
`)

const getSpeakerById = db.prepare(`
  SELECT * FROM speakers
  WHERE id = ?
`)

export function initializeDb(speakers: Speaker[]) {
  const insertMany = db.transaction((items: Speaker[]) => {
    for (const item of items) {
      insertSpeaker.run(
        item.id,
        item.batteryStatus,
        item.batteryCharges,
        item.name,
        item.prio ? 1 : 0,
        item.extra_seat ? 1 : 0,
        item.signalStatus,
        item.selected ? 1 : 0,
        item.cameraPrepos,
        item.batterySerialNo,
        item.cameraId,
        item.unitType,
        item.connected ? 1 : 0,
        item.signalLevel,
        item.dual ? 1 : 0,
        item.unitId,
        item.hasDisplay ? 1 : 0,
        item.identification ? 1 : 0,
        item.voting ? 1 : 0,
        item.rangeTest,
        item.unitProps,
        0 // micOn default to false
      )
    }
  })

  insertMany(speakers)
}

export function getAllSpeakersFromDb(): Speaker[] {
  const rows = getAllSpeakers.all()
  return rows.map(convertRowToSpeaker)
}

export function getSpeakerByIdFromDb(id: number): Speaker | undefined {
  const row = getSpeakerById.get(id)
  return row ? convertRowToSpeaker(row) : undefined
}

export function updateSpeakerMicStatus(id: number, micOn: boolean): boolean {
  try {
    const result = updateMicStatus.run(micOn ? 1 : 0, id)
    return result.changes > 0
  } catch (error) {
    console.error('Error updating mic status:', error)
    return false
  }
}

function convertRowToSpeaker(row: any): Speaker {
  return {
    ...row,
    prio: !!row.prio,
    extra_seat: !!row.extra_seat,
    selected: !!row.selected,
    connected: !!row.connected,
    dual: !!row.dual,
    hasDisplay: !!row.hasDisplay,
    identification: !!row.identification,
    voting: !!row.voting,
    micOn: !!row.micOn
  }
} 