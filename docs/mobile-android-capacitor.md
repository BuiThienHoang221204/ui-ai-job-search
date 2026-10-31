# Đóng gói app Android bằng Capacitor (server.url)

Hướng dẫn tự làm lại **từ đầu** việc biến web Next.js này thành app Android.
Mô hình: **app Android native + WebView trỏ thẳng site đã deploy** (`server.url`),
giữ nguyên toàn bộ SSR/auth của Next (không static-export, không refactor).

> Vì sao chọn `server.url` thay vì nhồi web tĩnh vào app: app này là Next.js SSR
> (Server Components, proxy `/api`, cookie httpOnly, `next/image`), ép static export
> sẽ vỡ và phải viết lại auth cross-origin. Chi tiết: phần "Hai cách" ở cuối.

---

## 0. Yêu cầu máy (một lần)

- **Node + pnpm** (đã có sẵn cho repo này).
- **Android Studio** (kèm Android SDK + Platform Tools + ít nhất 1 emulator/AVD).
- **JDK 17+** — dùng luôn JDK bundled trong Android Studio (JBR), không cần cài riêng.

Đường dẫn trên máy hiện tại (máy khác có thể khác — chỉnh lại cho đúng):

| Thứ | Đường dẫn |
|---|---|
| JDK (JBR) | `C:\Program Files\Android\Android Studio\jbr` |
| Android SDK | `C:\Users\<user>\AppData\Local\Android\Sdk` |
| adb | `<SDK>\platform-tools\adb.exe` |
| emulator | `<SDK>\emulator\emulator.exe` |

---

## 1. Cài thư viện Capacitor (một lần)

```bash
cd ui-ai-job-search
pnpm add @capacitor/core @capacitor/android
pnpm add -D @capacitor/cli
```

## 2. Tạo cấu hình `capacitor.config.ts`

Đặt ở gốc `ui-ai-job-search/`. Điểm mấu chốt là `server.url`:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const SERVER_URL =
  process.env.CAP_SERVER_URL ?? "https://ui-ai-job-search.vercel.app";

const config: CapacitorConfig = {
  appId: "com.careelot.app",
  appName: "Careelot",
  webDir: "capacitor",
  server: { url: SERVER_URL, androidScheme: "https" },
};

export default config;
```

## 3. Tạo `webDir` dự phòng

Capacitor bắt buộc có `webDir` kể cả khi dùng `server.url`. Tạo file
`capacitor/index.html` (màn hình chờ, chỉ hiện khi mất mạng). Nội dung gì cũng được;
xem file mẫu trong repo.

## 4. Tạo project Android native (một lần)

```bash
npx cap add android      # tạo thư mục android/
npx cap doctor android   # kiểm tra, phải báo "Android looking great"
```

Sau này mỗi khi đổi `capacitor.config.ts`, đổi `webDir`, hay thêm plugin:

```bash
npx cap sync android     # đồng bộ config + plugin vào android/
```

> **⚠️ Hiểu nhầm hay gặp:** `cap add` / `cap sync` **KHÔNG build web của bạn** và
> **không nhét src FE vào app**. Chúng chỉ **copy nội dung `webDir`** (file tĩnh đã
> build sẵn) vào `android/app/src/main/assets/public/` + đăng ký plugin native. Ở
> setup này `webDir` chỉ là **cái vỏ** (màn hình chờ) và lại có `server.url`, nên app
> **gần như không chứa gì của FE** — FE chạy trên server, app tải từ xa.
> Muốn app **thật sự chứa FE** (chạy offline) → xem **mục 12**.

---

## 5. Build APK bằng dòng lệnh

Gradle cần `JAVA_HOME` (trỏ JBR) và `ANDROID_HOME` (trỏ SDK). Trong Git Bash:

```bash
cd ui-ai-job-search/android
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="/c/Users/<user>/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
./gradlew assembleDebug --console=plain
```

Trong **PowerShell** (tương đương):

```powershell
cd ui-ai-job-search\android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\<user>\AppData\Local\Android\Sdk"
.\gradlew.bat assembleDebug --console=plain
```

APK ra ở: `android/app/build/outputs/apk/debug/app-debug.apk`.

> **Hoặc đơn giản hơn: mở Android Studio** (`npx cap open android` / `pnpm cap:android`),
> chờ Gradle sync, chọn thiết bị, bấm **Run ▶**. GUI làm hết. Dòng lệnh chỉ cần khi
> muốn tự động hoá / máy yếu / CI.

---

## 6. Chạy trên emulator (không cần Android Studio)

```bash
SDK="/c/Users/<user>/AppData/Local/Android/Sdk"
ADB="$SDK/platform-tools/adb.exe"

# Liệt kê AVD có sẵn
"$SDK/emulator/emulator.exe" -list-avds

# Khởi động 1 emulator (chạy nền — cửa sổ emulator sẽ hiện ra)
"$SDK/emulator/emulator.exe" -avd Pixel_9_Pro -no-snapshot-save -no-boot-anim &

# Chờ emulator boot xong
"$ADB" wait-for-device
# rồi chờ tới khi getprop sys.boot_completed trả "1"

# Cài APK + mở app
"$ADB" install -r android/app/build/outputs/apk/debug/app-debug.apk
"$ADB" shell am start -n com.careelot.app/.MainActivity

# Chụp màn hình emulator (để kiểm tra)
"$ADB" exec-out screencap -p > emu.png
```

Cài lên **điện thoại thật**: bật **USB debugging** (Settings → Developer options),
cắm cáp, `adb devices` thấy máy, rồi `adb install -r ...` như trên.

---

## 7. Quy trình HẰNG NGÀY (sau khi đã scaffold)

- **Sửa giao diện/logic web** → không cần đụng app: web đổi + deploy vercel là app
  (trỏ `server.url`) tự có bản mới. Đây là ưu điểm của cách `server.url`.
- **Đổi cấu hình app / thêm plugin native** → sửa `capacitor.config.ts` → `npx cap sync android` → build lại.
- **Build + chạy nhanh**: mở Android Studio bấm Run, hoặc chạy lại mục 5 + 6.

Script tiện trong `package.json`:

```bash
pnpm cap:sync      # cap sync android
pnpm cap:android   # cap open android (mở Android Studio)
```

Thử app trỏ **bản local** thay vì prod (ví dụ đang dev):

```bash
# dùng IP LAN của máy dev, KHÔNG dùng localhost (emulator/điện thoại không hiểu localhost của PC)
CAP_SERVER_URL=http://192.168.1.x:3000 npx cap sync android
# http cần bật cleartext cho Android (sửa AndroidManifest) — hỏi khi cần
```

---

## 8. Xử lý sự cố mạng khi tải Gradle (đã gặp)

Triệu chứng: Gradle sync/build báo
`UnknownHostException: services.gradle.org` hoặc `SocketTimeoutException: Read timed out`
khi tải `gradle-x.y.z-....zip`. Nguyên nhân: mạng chậm/chập, bộ tải của Gradle wrapper
chỉ chờ 10s mỗi lần đọc nên đứt giữa chừng.

**Cách né (dùng curl tải bền hơn rồi trỏ wrapper vào file local):**

```bash
# 1) Tải bằng curl (có resume -C - + retry), bản -bin nhỏ hơn -all
mkdir -p /d/gradle-dist && cd /d/gradle-dist
curl -L --retry 10 --retry-delay 5 --retry-all-errors -C - \
  -o gradle-8.14.3-bin.zip \
  https://services.gradle.org/distributions/gradle-8.14.3-bin.zip
unzip -t gradle-8.14.3-bin.zip >/dev/null && echo "ZIP OK"

# 2) Trỏ wrapper vào file local (sửa android/gradle/wrapper/gradle-wrapper.properties)
#    distributionUrl=file\:///D\:/gradle-dist/gradle-8.14.3-bin.zip
#    networkTimeout=120000
```

Muốn giữ `gradle-wrapper.properties` **portable** (để commit/CI) nhưng máy này khỏi tải lại:
seed sẵn file zip vào cache của Gradle (thư mục cache đặt tên theo hash MD5 của URL):

```bash
URL="https://services.gradle.org/distributions/gradle-8.14.3-bin.zip"
HASH=$(node -e 'const c=require("crypto");const h=c.createHash("md5").update(process.argv[1]).digest();process.stdout.write(BigInt("0x"+h.toString("hex")).toString(36))' "$URL")
DEST="$HOME/.gradle/wrapper/dists/gradle-8.14.3-bin/$HASH"
mkdir -p "$DEST" && cp /d/gradle-dist/gradle-8.14.3-bin.zip "$DEST/"
# rồi để distributionUrl=https... trong gradle-wrapper.properties
```

Mẹo chung khi mạng yếu với gradle.org/ghcr nhưng npm vẫn vào được: đổi DNS sang
`1.1.1.1` / `8.8.8.8`, hoặc bật VPN.

---

## 9. Lỗi hay gặp khác

| Lỗi | Cách xử |
|---|---|
| `java: command not found` khi chạy gradlew | Chưa set `JAVA_HOME` → trỏ JBR như mục 5 |
| Gradle sync lỗi JDK trong Android Studio | Settings → Build Tools → Gradle → Gradle JDK = JBR/JDK 21 |
| `adb devices` trống | Emulator chưa boot xong, hoặc điện thoại chưa bật USB debugging |
| Máy thiếu RAM, emulator/process bị kill | Đóng Android Studio, dừng docker (`docker stop ...`), tắt dev-server không dùng |
| Đăng nhập Google không mở được trong app | Đúng dự kiến — WebView bị Google chặn; cần Google Sign-In **native** (Phase 2) |

---

## 10. RAM: app trỏ prod nên không cần dịch vụ local

Khi chỉ chạy app Android (trỏ `server.url` prod), **không cần** docker (postgres/omniroute)
hay dev-server. Muốn nhẹ máy cho emulator:

```bash
docker stop aijob-omniroute aijob-postgres   # bật lại: cd server && pnpm db:up + up omniroute
```

---

## 11. So sánh 2 cách đóng gói

Capacitor có đúng 2 cách lấy web cho WebView. **Cách này đang dùng là A.**

| | **A. server.url (đang dùng)** | **B. Bundle src FE vào app** |
|---|---|---|
| Web nằm ở | Trên server (prod) | Trong app |
| Trong app có gì | Chỉ cái vỏ `webDir` (vài KB) | Toàn bộ bản build web |
| `cap sync` copy gì | Cái vỏ | Bản build tĩnh của FE |
| **Offline** | ❌ cần mạng | ✅ chạy offline |
| **Cập nhật web** | ✅ deploy web là xong, app tự có bản mới | ❌ phải build + phát hành **app** mới |
| Dung lượng app | Nhỏ | Lớn hơn |
| Gọi `/api` | **Same-origin** (proxy) → cookie httpOnly OK | **Cross-origin** → cần CORS + đổi auth sang token |
| Hợp với | App SSR (như app này) | SPA tĩnh (React/Vite) |
| App Store | Dễ bị coi là "web wrapper" | "Có nội dung native" hơn |

Quy tắc cốt lõi để không nhầm: **`cap add/sync` không build gì cả — chỉ copy `webDir`.**
Cái quyết định app chứa FE hay không là: (1) `webDir` trỏ vào đâu, (2) có `server.url` hay không.

---

## 12. Nếu muốn build src FE THÀNH app (Phương án B — bundle)

> Ghi lại để sau này so sánh. **Hiện KHÔNG dùng** vì app là Next.js SSR (xem phần "vỡ" bên dưới).

Quy trình đúng của cách B (bước build là **bạn tự làm**, Capacitor không làm hộ):

```bash
# 1) Tự build web ra THƯ MỤC TĨNH (cap KHÔNG tự làm bước này)
#    Với app SPA (Vite): tạo ra dist/ ;  với Next: cần output: 'export' → ra out/
next build                      # + đặt output: 'export' trong next.config

# 2) Trỏ webDir vào bản build đó, và BỎ server.url
#    capacitor.config.ts:
#      webDir: "out",           // hoặc "dist" với Vite
#      // server: { url: ... }   // XOÁ / comment dòng này

# 3) Giờ sync mới copy bản build vào app
npx cap sync android

# 4) Build + chạy app như mục 5–6 → app chứa toàn bộ FE, chạy offline
```

**Khác biệt mấu chốt so với cách A:** ở cách A không có bước 1 (`next build … export`),
`webDir` chỉ là cái vỏ, và có `server.url`. Ở cách B có bước 1, `webDir` = bản build, không `server.url`.

### Vì sao cách B KHÔNG dùng được cho app này (Next.js SSR)
`output: 'export'` chỉ ra được HTML/JS tĩnh. App này phụ thuộc nhiều thứ chạy trên server, sẽ **vỡ**:

- **Mất `rewrites` proxy `/api`** → phải gọi backend **cross-origin** → bật CORS + **viết lại auth từ cookie httpOnly sang token** (SameSite=None, lưu token ở đâu đó an toàn…).
- **Server Components** (trang jobs/market/salary fetch lúc request), **`generateMetadata`**, **`notFound()`**, **`next/image`** (tối ưu ảnh ở server) → không chạy ở bản tĩnh.
- Phá nhiều bất biến trong `CLAUDE.md` (dữ liệu công khai ở Server Component, `/api` qua rewrites, cookie httpOnly same-origin).

→ Cách B chỉ "dễ như quảng cáo" khi FE là **SPA thuần** (React/Vite): `build` ra `dist/`, trỏ `webDir`, xong.
Với Next SSR, cách B = **một cuộc refactor lớn + đổi mô hình auth**, nên ta chọn cách A.

---

## 13. Tiếp theo (Phase 2)

Thêm "chất native" trên hướng server.url: icon/splash, nút back, safe-area, mở link ngoài,
Google Sign-In native, push (FCM), quyền mic/camera, rồi ký release để lên Google Play.
(iOS là Phase 3 — cần máy Mac.)
