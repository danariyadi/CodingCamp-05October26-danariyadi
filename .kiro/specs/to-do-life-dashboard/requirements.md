# Requirements Document

## Introduction

To-Do Life Dashboard adalah aplikasi web sederhana yang membantu pengguna mengorganisir aktivitas harian mereka. Dashboard ini menampilkan waktu real-time, daftar tugas (to-do list), focus timer dengan metode Pomodoro, dan akses cepat ke website favorit. Aplikasi dibangun menggunakan HTML, CSS, dan vanilla JavaScript tanpa framework, dengan penyimpanan data menggunakan Browser Local Storage API.

## Glossary

- **Dashboard**: Antarmuka utama aplikasi yang menampilkan semua komponen
- **Focus_Timer**: Komponen timer berbasis teknik Pomodoro untuk membantu fokus
- **To_Do_List**: Komponen daftar tugas yang dapat ditambah, diedit, dan dihapus
- **Quick_Links**: Komponen tombol akses cepat ke website favorit
- **Local_Storage**: Browser API untuk menyimpan data secara lokal di browser
- **Greeting_Component**: Komponen yang menampilkan sapaan, waktu, dan tanggal
- **Theme_Switcher**: Komponen untuk beralih antara mode terang dan gelap
- **Valid_Task**: Task yang memiliki teks tidak kosong (tidak hanya whitespace)
- **Valid_URL**: URL yang memiliki format valid dengan protokol http:// atau https://
- **Pomodoro_Session**: Satu siklus timer dengan durasi yang dapat dikonfigurasi (default 25 menit)

## Requirements

### Requirement 1: Greeting dan Waktu Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat waktu saat ini dan sapaan yang personal, sehingga saya merasa lebih terhubung dengan dashboard.

#### Acceptance Criteria

1. THE Greeting_Component SHALL menampilkan waktu saat ini yang diperbarui setiap detik
2. THE Greeting_Component SHALL menampilkan tanggal saat ini dalam format yang mudah dibaca
3. WHEN waktu berada antara 05:00-11:59, THE Greeting_Component SHALL menampilkan sapaan "Selamat Pagi"
4. WHEN waktu berada antara 12:00-17:59, THE Greeting_Component SHALL menampilkan sapaan "Selamat Siang"
5. WHEN waktu berada antara 18:00-21:59, THE Greeting_Component SHALL menampilkan sapaan "Selamat Malam"
6. WHEN waktu berada antara 22:00-04:59, THE Greeting_Component SHALL menampilkan sapaan "Selamat Tidur"
7. WHERE pengguna telah menyimpan nama custom, THE Greeting_Component SHALL menampilkan nama tersebut dalam sapaan
8. WHERE pengguna belum menyimpan nama custom, THE Greeting_Component SHALL menampilkan sapaan generik tanpa nama
9. THE Greeting_Component SHALL menyimpan nama custom ke Local_Storage
10. WHEN pengguna mengubah nama custom, THE Greeting_Component SHALL memperbarui Local_Storage dan tampilan

### Requirement 2: Focus Timer dengan Pomodoro

**User Story:** Sebagai pengguna, saya ingin menggunakan timer fokus, sehingga saya dapat mengelola waktu kerja dengan teknik Pomodoro.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan waktu tersisa dalam format MM:SS
2. THE Focus_Timer SHALL memiliki durasi default 25 menit untuk satu Pomodoro_Session
3. WHEN tombol start ditekan, THE Focus_Timer SHALL memulai menghitung mundur dari durasi yang ditetapkan
4. WHEN tombol stop ditekan, THE Focus_Timer SHALL menghentikan penghitungan mundur
5. WHEN tombol reset ditekan, THE Focus_Timer SHALL mengembalikan waktu ke durasi awal
6. WHEN timer mencapai 00:00, THE Focus_Timer SHALL menghentikan penghitungan dan memberikan notifikasi
7. WHERE pengguna telah mengatur durasi custom, THE Focus_Timer SHALL menggunakan durasi custom tersebut
8. THE Focus_Timer SHALL menyimpan durasi custom ke Local_Storage
9. THE Focus_Timer SHALL memuat durasi custom dari Local_Storage saat halaman dimuat
10. WHEN timer sedang berjalan, THE Focus_Timer SHALL menonaktifkan tombol start
11. WHEN timer sedang berhenti, THE Focus_Timer SHALL menonaktifkan tombol stop

### Requirement 3: To-Do List Management

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas, sehingga saya dapat melacak aktivitas yang perlu diselesaikan.

#### Acceptance Criteria

1. THE To_Do_List SHALL menampilkan semua task yang telah ditambahkan
2. WHEN pengguna menambahkan Valid_Task, THE To_Do_List SHALL menyimpan task ke Local_Storage
3. WHEN pengguna menambahkan task kosong atau hanya whitespace, THE To_Do_List SHALL menolak dan tidak menyimpan task
4. THE To_Do_List SHALL menampilkan task dalam urutan yang sama seperti saat ditambahkan
5. WHEN pengguna mengklik checkbox task, THE To_Do_List SHALL menandai task sebagai selesai dan memperbarui Local_Storage
6. WHEN pengguna mengklik tombol edit pada task, THE To_Do_List SHALL mengubah task menjadi editable
7. WHEN pengguna menyimpan hasil edit Valid_Task, THE To_Do_List SHALL memperbarui task di Local_Storage
8. WHEN pengguna menyimpan hasil edit dengan teks kosong, THE To_Do_List SHALL membatalkan edit dan mempertahankan teks original
9. WHEN pengguna mengklik tombol delete pada task, THE To_Do_List SHALL menghapus task dari tampilan dan Local_Storage
10. THE To_Do_List SHALL memuat semua task dari Local_Storage saat halaman dimuat
11. WHEN task ditandai sebagai selesai, THE To_Do_List SHALL menampilkan visual indicator (misalnya strikethrough text)

### Requirement 4: Quick Links ke Website Favorit

**User Story:** Sebagai pengguna, saya ingin memiliki akses cepat ke website favorit, sehingga saya dapat mengunjungi website tersebut dengan mudah.

#### Acceptance Criteria

1. THE Quick_Links SHALL menampilkan semua link yang telah disimpan
2. WHEN pengguna menambahkan link dengan nama dan Valid_URL, THE Quick_Links SHALL menyimpan link ke Local_Storage
3. WHEN pengguna menambahkan link dengan URL tidak valid, THE Quick_Links SHALL menolak dan menampilkan pesan error
4. WHEN pengguna mengklik link, THE Quick_Links SHALL membuka URL di tab baru
5. WHEN pengguna mengklik tombol delete pada link, THE Quick_Links SHALL menghapus link dari tampilan dan Local_Storage
6. THE Quick_Links SHALL memuat semua link dari Local_Storage saat halaman dimuat
7. THE Quick_Links SHALL menampilkan link dalam format tombol atau card yang mudah diklik
8. WHEN pengguna menambahkan link tanpa nama, THE Quick_Links SHALL menggunakan URL sebagai nama default

### Requirement 5: Light/Dark Mode Theme

**User Story:** Sebagai pengguna, saya ingin dapat memilih tema terang atau gelap, sehingga saya dapat menggunakan dashboard dengan nyaman di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE Theme_Switcher SHALL menyediakan kontrol untuk beralih antara light mode dan dark mode
2. THE Dashboard SHALL menggunakan light mode sebagai tema default saat pertama kali diakses
3. WHEN pengguna mengaktifkan dark mode, THE Dashboard SHALL mengubah warna background, text, dan UI elements ke skema warna gelap
4. WHEN pengguna mengaktifkan light mode, THE Dashboard SHALL mengubah warna background, text, dan UI elements ke skema warna terang
5. THE Theme_Switcher SHALL menyimpan preferensi tema ke Local_Storage
6. THE Dashboard SHALL memuat preferensi tema dari Local_Storage saat halaman dimuat
7. THE Theme_Switcher SHALL menampilkan visual indicator untuk tema yang sedang aktif
8. WHEN tema berubah, THE Dashboard SHALL mengaplikasikan perubahan warna secara smooth tanpa flicker

### Requirement 6: Data Persistence dengan Local Storage

**User Story:** Sebagai pengguna, saya ingin data saya tersimpan secara otomatis, sehingga saya tidak kehilangan informasi saat menutup atau me-refresh browser.

#### Acceptance Criteria

1. THE Dashboard SHALL menyimpan semua data pengguna ke Local_Storage setiap kali terjadi perubahan
2. THE Dashboard SHALL memuat semua data dari Local_Storage saat halaman dimuat
3. WHEN Local_Storage tidak tersedia atau kosong, THE Dashboard SHALL menampilkan tampilan default tanpa error
4. THE Dashboard SHALL menyimpan data dalam format JSON yang valid
5. WHEN terjadi error saat membaca dari Local_Storage, THE Dashboard SHALL menggunakan data default dan tetap berfungsi
6. WHEN terjadi error saat menulis ke Local_Storage, THE Dashboard SHALL menampilkan pesan error kepada pengguna
7. THE Dashboard SHALL menyimpan data berikut: tasks, links, custom name, theme preference, dan timer duration

### Requirement 7: Responsive User Interface

**User Story:** Sebagai pengguna, saya ingin dashboard bekerja dengan lancar dan responsif, sehingga pengalaman penggunaan saya menyenangkan.

#### Acceptance Criteria

1. THE Dashboard SHALL memuat semua komponen dalam waktu kurang dari 2 detik pada koneksi normal
2. THE Dashboard SHALL merespons setiap interaksi pengguna dalam waktu kurang dari 100 milidetik
3. WHEN pengguna melakukan aksi (add, edit, delete), THE Dashboard SHALL memberikan feedback visual langsung
4. THE Dashboard SHALL tetap responsif meskipun To_Do_List memiliki hingga 100 task
5. THE Dashboard SHALL tetap responsif meskipun Quick_Links memiliki hingga 50 link
6. THE Dashboard SHALL menampilkan layout yang rapi pada layar desktop (minimal 1024px width)
7. THE Dashboard SHALL menampilkan layout yang rapi pada layar mobile (minimal 375px width)
8. WHEN ukuran window browser berubah, THE Dashboard SHALL menyesuaikan layout secara otomatis

### Requirement 8: File Structure dan Code Organization

**User Story:** Sebagai developer, saya ingin kode terorganisir dengan baik, sehingga mudah untuk dipelihara dan dikembangkan.

#### Acceptance Criteria

1. THE Dashboard SHALL memiliki satu file HTML di root directory
2. THE Dashboard SHALL memiliki tepat satu file CSS di dalam folder css/
3. THE Dashboard SHALL memiliki tepat satu file JavaScript di dalam folder js/
4. THE Dashboard SHALL tidak menggunakan framework atau library eksternal
5. THE Dashboard SHALL tidak memerlukan build tools atau bundler
6. THE Dashboard SHALL dapat berjalan dengan membuka file HTML langsung di browser
7. THE JavaScript SHALL menggunakan fungsi-fungsi yang well-named dan terdokumentasi
8. THE CSS SHALL menggunakan class naming yang konsisten dan deskriptif

### Requirement 9: Browser Compatibility

**User Story:** Sebagai pengguna, saya ingin dashboard bekerja di browser modern yang saya gunakan, sehingga saya dapat mengaksesnya tanpa masalah kompatibilitas.

#### Acceptance Criteria

1. THE Dashboard SHALL berfungsi dengan baik di Google Chrome versi terbaru
2. THE Dashboard SHALL berfungsi dengan baik di Mozilla Firefox versi terbaru
3. THE Dashboard SHALL berfungsi dengan baik di Microsoft Edge versi terbaru
4. THE Dashboard SHALL berfungsi dengan baik di Safari versi terbaru
5. THE Dashboard SHALL menggunakan JavaScript ES6+ yang didukung oleh browser modern
6. THE Dashboard SHALL menggunakan CSS properties yang didukung oleh browser modern
7. WHEN browser tidak mendukung Local_Storage API, THE Dashboard SHALL menampilkan pesan error yang informatif

### Requirement 10: User Experience dan Visual Design

**User Story:** Sebagai pengguna, saya ingin dashboard yang mudah digunakan dan enak dipandang, sehingga saya senang menggunakannya setiap hari.

#### Acceptance Criteria

1. THE Dashboard SHALL menggunakan tipografi yang mudah dibaca dengan ukuran font minimal 14px untuk body text
2. THE Dashboard SHALL menggunakan hirarki visual yang jelas untuk membedakan berbagai komponen
3. THE Dashboard SHALL menggunakan spacing yang konsisten antar elemen
4. THE Dashboard SHALL menggunakan color scheme yang harmonis dan tidak mengganggu mata
5. WHEN pengguna hover pada tombol atau interactive element, THE Dashboard SHALL memberikan visual feedback
6. THE Dashboard SHALL menggunakan ikon atau label yang jelas untuk setiap tombol aksi
7. THE Dashboard SHALL menampilkan semua komponen dalam satu halaman tanpa scrolling horizontal
8. WHERE error atau validasi terjadi, THE Dashboard SHALL menampilkan pesan error yang jelas dan membantu
