export type PresenceStatus = 'present' | 'absent';

export interface Coordinator {
  id: string;
  email: string;
  school: string;
  name: string;
  rg: string;
  code: string;
  qrCodeLink: string;
  presenceStatus: PresenceStatus;
  presenceDate?: string;
  updatedAt: string;
}

export interface AttendanceLog {
  id: string;
  coordinatorId: string;
  coordinatorName: string;
  scannedAt: string;
  deviceInfo?: string;
}
