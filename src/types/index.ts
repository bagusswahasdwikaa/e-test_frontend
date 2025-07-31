export interface ExamResult {
  id_peserta: number;
  nama_lengkap: string;
  tanggal: string | null;
  hasil_tes: number | null;
  nama_ujian: string;
  status: string;
}
