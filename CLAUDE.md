# Làm việc trong `ui-ai-job-search`

Frontend Next.js (App Router) + Tailwind v4 + TanStack Query + zustand + react-hook-form. Backend nằm ở `../ai-job-search/server`. Hệ thiết kế đã chốt ở `design.md` — đọc trước khi đổi giao diện.

## Quy tắc bắt buộc khi viết component

**1. Code đơn giản, dễ đọc.** Logic thẳng, ít tầng, không trừu tượng hoá trước khi cần. Ba dòng lặp lại tốt hơn một helper khó hiểu. Cụ thể (chốt 2026-10-14 sau một đợt rà):

- **Hành động gắn với sự kiện người dùng, không với `useEffect` + `setTimeout`.** Đã sửa: tự lưu câu trả lời bằng effect hẹn giờ + `useCallback` + cờ `dirty` + hàm `toggle` phải phối hợp với nhau, dễ sinh lưu lặp khi danh tính hàm đổi. Nay `practice-question.tsx` lưu ở `onBlur` của ô nhập — bấm nút nào khác cũng làm ô mất focus nên không mất chữ.
- **Đủ dùng, không làm trước cho quy mô chưa tới.** Một cơ chế cho một vấn đề; tối ưu khi đã đo thấy chậm; giữ đúng phạm vi việc được giao; một test cho một hành vi. Trước khi coi là xong, xem `git diff --numstat` — code chạy thật tăng nhiều hơn phần tính năng cần thì rút lại. Chi tiết: `../ai-job-search/CLAUDE.md`, mục "Sửa ĐỦ DÙNG".
- **Không ternary lồng**, kể cả trong biến hiển thị: gán bằng `if` trước `return`.
- **Chỉ tách hàm/component khi có lý do** (dùng ≥ 2 nơi, hoặc là một khái niệm có tên rõ). Hàm không dùng state của component thì đưa ra `lib/`, đừng khai trong thân component.
- **Không dùng mẹo để code ngắn hơn** (`flatMap` trả `[]`/`[x]`, ghép chuỗi rồi lọc theo hậu tố…): viết `filter` + `map` hoặc vòng lặp thường.
- **Tận dụng cơ chế nguyên bản của HTML/DOM thay vì dựng state React phức tạp.** Ví dụ: fallback ảnh lỗi dùng thẳng `onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}` và `src={src || DEFAULT_LOGO}`, KHÔNG tạo `useState` lưu `failed`/`failedSrc` để theo dõi trạng thái tải ảnh.
- **Tuyệt đối không over-engineer hay viết code phòng thủ thừa.** Không khai báo state, effect, biến trung gian hay cờ thừa cho những thứ giải quyết được bằng toán tử logic trực tiếp (`||`, `??`, `if`). Component chỉ nhận và xử lý đúng những gì nó thực sự cần, không nhận prop thừa rồi `void` hay viết wrapper vòng vèo.

**2. Truyền ÍT props nhất có thể — lý tưởng là chỉ một `id`.** Component tự lấy dữ liệu nó cần qua custom hook thay vì nhận cả object từ cha rồi chuyền tiếp xuống.

- Dữ liệu từ server: **TanStack Query bọc trong custom hook**, mọi component gọi cùng hook — TanStack tự gộp theo key nên không tốn thêm request. Mẫu: `useJobDetail(jobId)` ở `hooks/use-job-detail.ts` — thanh tab, khối điểm, nhận xét, đối chiếu đều chỉ nhận `jobId`.
- State giao diện dùng chung giữa các component anh em (modal đang mở, tab, bộ lọc): **zustand**. Mẫu: `useProfileUi` ở `hooks/use-profile.ts`, `useCvDraft` ở `hooks/use-cv-draft.ts`.
- Form: **react-hook-form** (`Controller` cho component tuỳ biến như `SelectMenu`).
- Ghi xong thì cập nhật cache (`queryClient.setQueryData`) hoặc `invalidateAfter(...)` ở `lib/query-keys.ts`, đừng giữ bản sao dữ liệu server trong `useState`.

**3. Tránh re-render thừa bằng cách đặt state ĐÚNG CHỖ, không phải rắc `memo`.** State đổi nhanh (stream từng mảnh, đếm giờ, ô đang gõ) phải nằm trong component NHỎ NHẤT dùng nó. Mẫu: `useJobScoring(jobId)` chỉ được gọi trong `MatchPanel`, nên mỗi mảnh stream của lượt chấm điểm chỉ render lại khối đó chứ không kéo cả trang. Chỉ dùng `memo`/`useMemo` khi đã thấy vấn đề thật.

**4. Tái sử dụng component có sẵn** trong `components/ui/` (`Card`, `SectionCard`, `Button`, `Badge`, `Progress`, `ProgressCircle`, `SelectMenu`, `Tabs`, `Modal`…) và `components/layout/`, `components/jobs/`, `components/documents/`. Không tạo component mới khi một cái có sẵn làm được; ưu tiên sửa component đang có hơn thêm file. Không dùng thẻ HTML gốc (`<select>`…) khi đã có component tương ứng. Hook cũng vậy: trước khi tự viết state cho việc quen thuộc, grep `hooks/` — đã có `useDropdown` (đóng khi bấm ra ngoài), `useCopy` (sao chép kèm nhãn "đã chép"), `useFileDrop` (kéo thả file), `useDebounce`, `useScrollLock`. Đã sửa 2026-10-28: menu Chia sẻ tự viết đóng/mở bằng `onBlur`, nút sao chép tự giữ cờ `copied`.

**5. Đặt file đúng chỗ.** Chia theo LOẠI file (chốt 2026-10-16 sau đợt tái cấu trúc):

```
app/          route + component chỉ một trang dùng (không hook, không type dùng chung, không hàm thuần)
components/
  ui/         nguyên liệu giao diện: Button, Card, Modal, PageHeader, DashSection, ModelElapsed…
  layout/     khung app: AppLayout, Sidebar, Header, nav-items, BrandLogo
  jobs/       component việc làm nhiều trang dùng: CompanyLogo, JobActionCards, JobTime, LocationText
  documents/  luồng tạo tài liệu dùng chung cho CV và thư: document-job, GenerationProgress
  ads/ auth/ pwa/ salary/
providers/    context: SessionProvider, ToastProvider, QueryProvider
hooks/        mọi hook useXxx, kể cả useSession, useToast
lib/          hàm thuần (không React) kèm test ở test/unit/lib/ — KHÔNG còn utils/
services/     CHỈ hàm gọi API (một object xxxService mỗi file), không khai type
types/        mọi type dùng chung, một file theo miền, gom qua types/index.ts (`export type * from`)
```

- **Import chỉ đi một chiều:** `types` ← `lib` ← `services` ← `hooks`/`providers` ← `components` ← `app`. File trong `types/` import file anh em (`./api`), không import `@/types`, `@/lib`, `@/services`. `hooks/`, `lib/`, `services/` không import `components/` hay `app/`.
- **Type/interface dùng ở hơn một file → `types/`.** Chỉ type nội bộ của đúng một file (ví dụ kiểu state của một store, props của component) mới được khai tại chỗ. Type của dữ liệu API cũng ở `types/`, không ở `services/`.
- **Hook (`useXxx`) → `hooks/`**, kể cả hook chỉ một trang dùng. Hàm KHÔNG phải hook thì không để trong `hooks/` (đã dời: `afterSaveJob` → `lib/job-cache.ts`, `isClosed` → `lib/interview-status.ts`).
- **Context: provider ở `providers/`, hook đọc nó ở `hooks/`** (`SessionProvider` + `hooks/use-session.ts`). Đừng để context trong `components/`.
- **Hàm thuần (không React) → `lib/`** kèm test ở `test/unit/lib/`. Mẫu: `lib/cv-checklist.ts`. Không có barrel `lib/index.ts` — import thẳng file (`@/lib/cn`).
- **`lib/` và `types/` chia theo CHỦ ĐỀ, không theo hàm.** Thêm hàm hay type mới thì đặt vào file cùng chủ đề đã có (đường dẫn đăng nhập → `lib/redirect.ts`, tin công khai → `lib/public-job.ts`, ngày giờ → `lib/date.ts`, kiểu lỗi API chung → `types/api.ts`, mọi thứ quanh tin và điểm phù hợp → `types/job.ts`); chỉ mở file mới khi chưa có chủ đề nào hợp. Test đi theo vào spec của file đó. Đã gom 2026-10-28: `auth-redirect`, `job-share`, `blob-error`, `repost`, `types/ai`, `types/job-action`, `types/match`. Ngược lại, **hook vẫn một hook một file** (`use-xxx.ts`) — đó là quy ước, không phải file lẻ cần gom.
- **Mỗi component một file.** Trang lớn chia thư mục con theo trạng thái màn hình (ví dụ `cv-optimizer/home/`, `cv-optimizer/workspace/`), file gốc chỉ ghép các phần lại.
- **Component chỉ một trang dùng → cạnh trang trong `app/`** (import tương đối `./job-row`). **Dùng ở nhiều trang → `components/<nhóm>/`.** Mẫu: `components/jobs/job-action-cards.tsx` dùng chung cho trang chi tiết tin, CV và thư.
- **Không viết lớp bọc mỏng.** Component chỉ để gọi lại một component khác với vài props cố định thì viết thẳng ở chỗ dùng.

**6. Xoá code chết ngay.** Component, hàm, hằng không còn ai import thì xoá trong cùng thay đổi.

## Dữ liệu, hiệu năng, bảo mật, SEO

Lý do và nguồn của từng quy tắc dưới đây (docs Next.js 16, react.dev, TanStack Query): `docs/research-frontend-best-practices.md` — đọc khi định đổi cách lấy dữ liệu, thêm trang công khai, hay tối ưu hiệu năng.

**Truyền dữ liệu và cache**

- **Mọi lời gọi API đi qua `services/`** (axios `api` ở `lib/axios.ts`, gửi cookie). Component, hook chỉ gọi `xxxService`; từ `lib/axios` chỉ lấy `apiErrorMessage`/`apiErrorStatus`.
- **Lỗi API hiện đúng câu backend soạn:** axios qua `apiErrorMessage`, `fetch` của đường stream qua `responseErrorMessage` (`lib/axios.ts`). Chữ hiển thị cho người dùng nói họ làm gì tiếp, không mang mã HTTP — đã sửa 2026-10-24 ba hàm stream từng hiện "Máy chủ trả về HTTP 400".
- **Dữ liệu cần đăng nhập lấy ở client** bằng TanStack Query bọc trong hook ở `hooks/`. Giữ nó ở client: Server Component không ghi được cookie nên không làm mới được access token — fetch trên server với cookie người dùng là một lớp phức tạp không đáng.
- **Dữ liệu công khai lấy trong Server Component** bằng `fetch` tới `BACKEND_URL` kèm `next: { revalidate }` — mẫu: `services/salary.ts`, `lib/job-metadata.ts`. `BACKEND_URL` chỉ đọc ở server; client chỉ thấy biến `NEXT_PUBLIC_*`.
- **Query key chỉ lấy từ `lib/query-keys.ts`.** Ghi xong: API trả object mới thì `setQueryData`, không thì `invalidateAfter(action)`. Hai trạng thái đăng nhập dùng hai key khác nhau (`keys.job` / `keys.publicJob`) — cache sống qua điều hướng client, chung key thì đăng nhập xong vẫn thấy bản khách.
- **Gọi thẳng backend NestJS** cho cả đọc lẫn ghi. Server Action và Route Handler để dành cho việc backend không làm được; dùng chúng làm lớp trung gian thì thêm một chặng, phải tự chuyển cookie, và Server Action chạy tuần tự.

**Hiệu năng**

- **`page.tsx` là Server Component** (để khai `metadata`), phần tương tác ở `*-view.tsx` client — mẫu `app/dashboard/jobs/page.tsx`. `"use client"` đặt ở component lá cần state/sự kiện, không đặt ở cấp trang.
- **Đo trước khi tối ưu:** `pnpm next analyze` cho bundle; `memo`/`useMemo` chỉ khi đã thấy vấn đề thật (mục 3).
- **UI nặng chỉ hiện khi bấm** (modal lớn, nút đăng nhập Google) nạp bằng `next/dynamic`.
- **Ảnh và khối tải sau có khung kích thước cố định** (như `CompanyLogo` `size-11/13/16`) để trang không nhảy (CLS).
- Danh sách dài dùng phân trang có sẵn (`components/ui/pagination.tsx`).

**Bảo mật**

- **Chữ do model hoặc người dùng sinh ra render dạng text của React.** `dangerouslySetInnerHTML` chỉ có ở script khởi tạo trong `app/layout.tsx`; JSON-LD (nếu có) phải thay `<` bằng `<`.
- **Khung xem trước CV giữ `sandbox="allow-same-origin"`, không bật `allow-scripts`** — lý do ở `../ai-job-search/docs/adr/0003-nguoi-dung-sua-cv.md`.
- **Xác thực chỉ bằng cookie httpOnly do backend đặt.** Token không vào `localStorage`, state hay URL. Chuyển hướng sau đăng nhập luôn qua `safeNextPath` (`lib/redirect.ts`).
- **Trang cho khách:** đường dẫn khai trong `isGuestPath` (`lib/public-job.ts`); trang đó chỉ gọi API `/public/...` hoặc route `@Public()` của backend. `QueryProvider` chuyển về đăng nhập khi gặp bất kỳ 401 nào, nên một query cần đăng nhập lọt vào trang khách sẽ đẩy khách ra ngoài. Lương và toàn văn mô tả tin do backend quyết định có trả cho khách hay không — FE không tự ghép lại.

**SEO**

- Khu riêng tư (`/dashboard/*` khi đã đăng nhập) và trang tin tuyển dụng: `robots: { index: false, follow: false }` — trang tin vì điều khoản portal (`../ai-job-search/docs/adr/0008-trang-viec-lam-cong-khai.md`).
- Trang muốn được index (như `/dashboard/market/*`, `/dashboard/salary/*`; ghi đè `noindex` của khung dashboard bằng `robots` ở cấp trang) render nội dung trong Server Component, khai `metadata`/`generateMetadata`, gọi `notFound()` khi không có dữ liệu để trả 404 thật.
- JobPosting JSON-LD và bỏ `noindex` trang tin chỉ làm khi chủ dự án quyết.

## Quy trình

- **Đổi giao diện: làm mockup HTML trước** trong `mockups/` (thư mục bị gitignore), mở cho người dùng xem, và **chỉ code khi được duyệt rõ ràng** ("ok triển khai", "làm đi").
- **Không commit / push** khi người dùng chưa yêu cầu.
- Trước khi coi là xong: `pnpm exec tsc --noEmit -p .`, `pnpm exec eslint <thư mục đã sửa>`, `pnpm exec vitest run`.
- **Tự rà diff trước khi báo xong** theo bốn câu hỏi, sửa ngay những gì vướng rồi mới báo, và báo kèm kết quả rà: (1) có over-engineer không — state/effect/props/helper thừa, component bọc mỏng, làm trước cho nhu cầu chưa có; (2) có vi phạm quy tắc ở file này không — mục "Quy tắc bắt buộc khi viết component", vị trí file, import một chiều, dữ liệu qua `services/` + TanStack; (3) logic có thẳng và đơn giản không — không ternary lồng, không mẹo, chỉ tách hàm/component khi có lý do. (4) có lỗ hổng bảo mật không — trang khách chỉ gọi API công khai, chữ của người dùng hay model render dạng text, token không vào `localStorage`/URL, link chia sẻ không chứa dữ liệu cá nhân.
- **Chỉ chạy prettier trên file mình sửa.** Chạy cả thư mục sẽ định dạng lại (kể cả đổi xuống dòng CRLF) những file không liên quan — xem `git status` và `git checkout` các file đó.

## Cách viết

- Chữ hiển thị cho người dùng: tiếng Việt.
- Comment: chỉ một dòng `/** ... */` ngắn trên hàm/component có logic đáng giải thích. Không comment cho hằng, kiểu, JSX.
- Đọc DOM trong iframe thì không dùng `instanceof` (khác realm) — xem `../ai-job-search/docs/adr/0003-nguoi-dung-sua-cv.md`.
