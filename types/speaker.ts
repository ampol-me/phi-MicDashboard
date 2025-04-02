export interface Speaker {
  batteryStatus: number | null;
  batteryCharges: number | null;
  name: string;
  prio: boolean;
  extra_seat: boolean;
  signalStatus: number | null;
  selected: boolean;
  cameraPrepos: number;
  batterySerialNo: string;
  cameraId: number;
  unitType: number;
  connected: boolean;
  signalLevel: number | null;
  dual: boolean;
  unitId: number;
  hasDisplay: boolean;
  identification: boolean;
  voting: boolean;
  id: number;
  rangeTest: number;
  unitProps: number;
  micOn: boolean;
} 