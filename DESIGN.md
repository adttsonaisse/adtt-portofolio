# DESIGN.md — adtt-portofolio

Sistem desain kecil yang mengikat seluruh halaman. Alasan setiap pilihan ada di sini;
yang tidak tertulis di sini bukan keputusan — jangan dipakai.

## Palet (2 core + 1 aksen + netral)

- `--bg` / `--bg-soft` — dasar (dark `#0a0a0b`/`#141416`, light `#f8f7f4`/`#ffffff`).
- `--fg` / `--fg-muted` — teks dan teks sekunder.
- `--border` — satu-satunya garis pemisah.
- Aksen indigo `#5855F6` — **hanya di momen kunci**: primary CTA, indikator
  nav aktif, focus ring, progress bar splash. Label section, garis dekoratif,
  dan dot TIDAK memakai aksen.
- Sekunder `#818CF8` — hanya untuk kedalaman DepthText + goresan segel splash.
- Logo skill monokrom (`--fg-muted`); warna brand muncul **hanya saat hover/fokus**.

## Tipografi

- Sans (Inter) untuk UI, serif Georgia italic untuk suara editorial
  (sapaan Hero, heading Contact, brand splash), mono (JetBrains Mono) **hanya**
  untuk angka dan meta (`N° 042`, `01/04`, `#01 — 2024`).
- Label section: `.section-label` — mono, muted, `01 · About`.
  Nomor = posisi nyata section di halaman (sekuens), bukan dekorasi.

## Radius & shadow & glass

- Pill (`999px`) hanya untuk kontrol kecil: nav, tag, tombol ikon, tombol bahasa/tema.
- Kartu `20px` (`--radius-md`), media/galeri `28px` (`--radius-lg`).
- Shadow angkat cuma satu: `--shadow-lift`, milik primary CTA.
- Glass maksimal 2 elemen (panah galeri Projects). Sisanya solid.

## Glow & motion (MOTION dial = 2)

- Satu glow per pengalaman: pantulan bawah Hero (sekaligus cerminan splash).
  Skills/Projects/Contact tanpa wash radial.
- Motion yang menjawab aksi pengguna (hover, pointer, reveal scroll) bebas.
  Loop abadi hanya satu yang bertugas: marquee skill (konten). Tanpa blink,
  tanpa ping, tanpa drift, tanpa auto-orbit teks. `prefers-reduced-motion`
  mematikan semuanya.

## Panah

- `→` hanya di CTA Hero (isyarat arah ke `#contact`), `↑` hanya di footer
  (kembali ke atas). Tautan eksternal memakai `↗` (penanda fungsional).
  Tombol lain tanpa panah.

## Ritme section

- Hero: intro. About/Skills/Projects: `py-20 md:py-28`. Contact: finale
  (`pt-20 pb-24 md:pt-28 md:pb-32`). Komposisi bervariasi per section
  (kolom editorial, marquee, galeri, orbit) — tidak ada dua header yang identik.

## Lapisan playful (satu signature interaction per area)

- Kursor: dot + ring membuntuti, membesar di elemen interaktif. Native tetap
  tampil; mati di touch & reduced-motion (`Cursor.tsx`).
- Partikel: `burst(x, y)` — canvas sekali pakai, hapus otomatis (`particles.ts`).
- Splash: segel bisa di-stamp (pop elastis + burst); counter mengikuti loading
  aset asli (`loadProgress.ts`), wipe menunggu intro + aset (timeout 6s).
- Hero: nama per huruf (DepthText + `pulseKey` stagger 60ms), klik = gelombang
  + burst; foto selalu grayscale, warna mekar dari titik kursor (lingkaran
  mask trailing rAF, radius membesar selama hover; tap 1 detik di touch).
- About: kartu lanyard dis sentil saat dilepas (`applyImpulse`); badge flip
  depan/belakang (status ketersediaan), tombol keyboard-accessible.
- Skills: logo boing + tooltip fun-fact (`skillFacts`, EN/ID — draf, koreksi manual).
- Projects: caption pop tiap ganti aktif; flick velocity 1–3 item; stiker
  featured rotasi acak + draggable (stopPropagation native).
- Contact: orbit 8 node dipertahankan; isi node magnetis ke kursor (rAF +
  IntersectionObserver, hanya pointer halus); klik = burst, node mail = salin
  + toast.
- Semua gerak mati di `prefers-reduced-motion`; rAF pause saat off-screen/hidden.
