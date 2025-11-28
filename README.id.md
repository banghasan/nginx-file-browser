# Penjelajah Berkas Nginx

Aplikasi web ini merupakan penjelajah berkas yang sangat sederhana dan dapat dipakai bersamaan dengan [modul autoindex nginx](http://nginx.org/en/docs/http/ngx_http_autoindex_module.html).

![nginx file browser in action - light theme](assets/screenshot-light.jpg)
![nginx file browser in action - light theme](assets/screenshot-dark.jpg)

Konfigurasi contoh nginx juga disertakan yang memasang **file browser** di root (`/`) dan menautkan direktori berkas yang ingin ditampilkan di jalur `/files`, sehingga `filesBaseUrl` mengarah ke jalur tersebut.

> Catatan versi: rilis terbaru menambahkan dukungan build multiarsitektur (amd64 + arm64) untuk Dockerfile root maupun rootless.

## Menggunakan Docker

Sebagai demonstrasi, image docker tersedia [di sini](https://hub.docker.com/r/banghasan/nginx-file-browser/).
Mount direktori yang ingin dilayani ke `/opt/www/files/` dan map port `80` (root) atau `8080` (rootless) kontainer ke port host. Contoh perintah:

root
```
$ docker run -p 8080:80 -v /path/to/my/files/:/opt/www/files/ banghasan/nginx-file-browser
```
rootless:
```
$ docker run -p 8080:8080 -v /path/to/my/files/:/opt/www/files/ banghasan/nginx-file-browser
```

### Menggunakan Docker Compose

```
services:
  file-browser:
    image: banghasan/nginx-file-browser:latest
    ports:
      - "8080:80"   # ubah port host sesuai kebutuhan
    volumes:
      - /path/to/my/files/:/opt/www/files/:ro

  file-browser-rootless:
    image: banghasan/nginx-file-browser:latest-rootless
    ports:
      - "8081:8080" # image rootless mengekspos port 8080 di dalam kontainer
    volumes:
      - /path/to/my/files/:/opt/www/files/:ro
```

Simpan sebagai `docker-compose.yml` (atau `compose.yaml`) kemudian jalankan
`docker compose up -d` untuk menyalakan keduanya. Hapus layanan yang tidak
dibutuhkan jika hanya ingin menjalankan salah satunya.

Setelah kontainer berjalan, buka browser ke alamat IP host docker beserta port yang dipetakan. Dengan contoh di atas dan IP host `192.168.0.200`, akses:

`http://192.168.0.200:8080`

## Membangun untuk arm64 dan multi-arch

Kedua Dockerfile kini menggunakan fitur platform BuildKit sehingga definisi yang sama dapat menghasilkan image native x86_64 dan arm64. Cara termudah membangun/merilis image multi-arch adalah lewat `docker buildx`:

```
# sekali setiap mesin
docker buildx create --use --name file-browser-builder

# root (port 80)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <registri-anda>/nginx-file-browser:latest \
  -f Dockerfile \
  --push .

# rootless (port 8080)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <registri-anda>/nginx-file-browser:rootless \
  -f Dockerfile-rootless \
  --push .
```

Jika hanya butuh image arm64 secara lokal, ganti `--platform` dengan `--platform linux/arm64` dan tambahkan `--load` agar image diimpor ke daemon Docker lokal tanpa perlu push.

### Dockerfile arm64 khusus

Untuk lingkungan yang memerlukan image arm64 tunggal (tanpa manifest
multi-arch), gunakan `Dockerfile-arm64` yang memaksa basis arm64 dan diterbitkan
otomatis melalui `.github/workflows/docker-image-arm64.yml` sebagai
`banghasan/nginx-file-browser:latest-arm64`.

## Validasi lokal & CI

Repo ini kini menyertakan linting HTML/CSS/JS serta uji end-to-end ringan
berbasis Playwright. Jalankan semua pengecekan secara lokal dengan:

```
npm ci
npx playwright install chromium
npm run lint
npm run test:e2e
```

GitHub Actions mengeksekusi perintah yang sama pada setiap push dan pull
request melalui `.github/workflows/ci.yml`, sehingga regresi tertangkap sebelum
image Docker dirilis.

## Symlink

> Hati-hati dengan symlink; bisa saja membuka akses ke berkas penting sistem!

Jika di dalam direktori berkas terdapat symlink yang ingin tetap ditampilkan, jalur alias tempat `/files` dilayani harus menyesuaikan jalur asli di luar kontainer. Misal kita memiliki direktori `/home/myuser/files-to-serve/` berisi `dir1` dan `dir2`, di mana `dir1` hanyalah symlink ke `dir2`. Agar `dir1` bisa ditelusuri lewat file browser, lakukan hal berikut:

Dalam `default.conf` ubah baris:
```
    alias /opt/www/files/;
```

menjadi
```
    alias /home/myuser/files-to-serve/;
```

Kemudian mount point pada kontainer adalah `/home/myuser/files-to-serve/` alih-alih `/opt/www/files/`.
