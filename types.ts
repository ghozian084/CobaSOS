export interface PosterMetadata {
  competitionName: string;
  category: string;
  registrationDeadline: string;
  registrationDeadlineIso: string; // YYYYMMDD format for Calendar
  eventDate: string;
  eventDateIso: string; // YYYYMMDD format for Calendar
  cost: string;
  teamType: string;
  status: string;
  location: string;
  broadcastMessage: string;
  link: string;
}

export type MetadataKey = keyof PosterMetadata;

export const LABELS: Record<MetadataKey, string> = {
  competitionName: 'Nama Kompetisi',
  category: 'Bidang Lomba',
  registrationDeadline: 'Deadline Pendaftaran',
  registrationDeadlineIso: 'Deadline (ISO)', // Hidden from main view usually
  eventDate: 'Tanggal Pelaksanaan',
  eventDateIso: 'Tanggal (ISO)', // Hidden from main view usually
  cost: 'Biaya',
  teamType: 'Jenis Lomba',
  status: 'Status Lomba',
  location: 'Lokasi Lomba',
  broadcastMessage: 'Pesan Broadcast',
  link: 'Link Guidebook/Pendaftaran'
};