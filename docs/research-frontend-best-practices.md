# Best practices frontend cho `ui-ai-job-search` — đối chiếu nguồn gốc

> Nghiên cứu ngày 2026-10-16. Phiên bản đối chiếu: **Next.js 16.x** (repo dùng `next@^16.2.12`), **React 19.2**, **TanStack Query v5.101**. Mỗi trang docs Next.js ghi `lastUpdated` riêng — chép lại ở chỗ cần. Chỉ trích nguồn gốc (nextjs.org, react.dev, tanstack.com, web.dev, developers.google.com); nguồn "senior" (bulletproof-react, TkDodo, Kent C. Dodds) chỉ dùng ở chỗ docs chính thức không nói.
>
> **Đã đọc trong repo trước khi viết phần "Áp dụng":** `CLAUDE.md`, `README.md`, `package.json`, `next.config.ts`, `eslint.config.mjs`, `app/layout.tsx`, `app/dashboard/layout.tsx`, `providers/session-provider.tsx`, `providers/query-provider.tsx`, `lib/query-keys.ts`, `lib/axios.ts`, `lib/job-metadata.ts`, `lib/public-job.ts`, `hooks/use-api-query.ts`, `hooks/use-async-data.ts`, `hooks/use-job-detail.ts`, `app/dashboard/jobs/page.tsx`, `app/dashboard/jobs/[id]/page.tsx` + `job-detail-view.tsx`, `app/salary/page.tsx`, `app/salary/[slug]/page.tsx`, `components/salary/salary-list.tsx`, `services/*`.
>
> **Lưu ý:** cây thư mục đang thay đổi trong lúc nghiên cứu — lần `ls` đầu còn thấy `utils/` ở gốc, lần sau `utils/` đã biến mất và các file tương ứng (`cn.ts`, `date.ts`, `salary.ts`…) nằm trong `lib/`. Phần dưới viết theo trạng thái sau cùng.

---

## 1. Cấu trúc thư mục

### (a) Khuyến nghị

- **Next.js không áp đặt cấu trúc.** Docs nêu ba chiến lược ngang hàng — để code ngoài `app/`, để trong thư mục cấp cao của `app/`, hoặc tách theo feature/route — và chốt: *"choose a strategy that works for you and your team and be consistent across the project"*. Tên `components`, `lib` *"have no special framework significance"*. — https://nextjs.org/docs/app/getting-started/project-structure (lastUpdated 2026-07-21)
- **Đặt file cạnh route là an toàn**: một segment chỉ thành route công khai khi có `page.js`/`route.js`, và *"only the content returned by page.js or route.js is sent to the client"*. — cùng trang, mục *Colocation*.
- **Private folder `_folder`** không bắt buộc cho colocation, nhưng hữu ích để *"Separating UI logic from routing logic"*, sắp xếp trong editor và *"Avoiding potential naming conflicts with future Next.js file conventions"*. — cùng trang, mục *Private folders*.
- **Route group `(group)`** để gom route theo khu vực/ý định và gắn layout riêng cho một nhóm route mà không đổi URL (kể cả nhiều root layout, hoặc `loading.tsx` chỉ cho một trang). — cùng trang, mục *Route groups*.
- **Feature-based (bulletproof-react):** phần lớn code sống trong `features/<x>/` (mỗi feature có thể có `api`, `components`, `hooks`, `stores`, `types`, `utils` — *"You don't need all of these folders for every feature"*); thư mục dùng chung `components`, `hooks`, `lib` (*"Reusable libraries preconfigured for the app"*), `stores`, `types`, `utils`. — https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
- **Kiến trúc một chiều: shared → features → app.** Feature không import feature khác; shared không import feature/app. Ép bằng ESLint `import/no-restricted-paths` (một zone mỗi feature + zone cấm `features → app` và `shared → features/app`). — cùng trang bulletproof-react.
- **Query key đặt cạnh feature** thay vì một file toàn cục, mỗi feature một key factory — ý kiến của TkDodo, ông nói rõ app nhỏ không cần. — https://tkdodo.eu/blog/effective-react-query-keys
- **Provider:** *"render providers as deep as possible in the tree"* để Next tối ưu phần tĩnh. — https://nextjs.org/docs/app/getting-started/server-and-client-components (lastUpdated 2026-10-05)
- **Chặn rò code server sang client** bằng `import 'server-only'` (lỗi lúc build). — cùng trang, mục *Preventing environment poisoning*.

### (b) Áp dụng cho repo này

Repo đang theo kiểu **type-based ở gốc + colocation theo route** (`app/dashboard/<trang>/*.tsx`), với quy ước riêng rất rõ trong `CLAUDE.md` (hook → `hooks/`, hàm thuần → `lib/`, type dùng chung → `types/`, API client → `services/`). Đây là một trong ba chiến lược Next.js chấp nhận; **không cần chuyển sang `features/`** ở quy mô hiện tại (~230 file TS/TSX).

Ưu tiên:

1. **(Nên làm, rẻ) Thêm luật import một chiều bằng ESLint.** Hiện `hooks/use-job-detail.ts` import `useSession` từ `providers/session-provider.tsx`; năm hook khác import `useToast` từ `components/ui/toast`. Nghĩa là `hooks → components` và `components → hooks` cùng tồn tại — chưa vòng, nhưng không có gì ngăn. Đề xuất thứ tự: `types` ← `lib` ← `services` ← `hooks` ← `components` ← `app`, ép bằng `no-restricted-imports` (có sẵn trong ESLint, không cần thêm plugin) hoặc `import/no-restricted-paths` như bulletproof-react. Để hai chỗ trên hợp lệ, chuyển phần context/hook của session (`SessionContext`, `useSession`) sang `hooks/use-session.ts` hoặc `lib/session-context.ts`, còn `SessionProvider` (có JSX spinner) giữ ở `components/`. Toast cũng vậy.
2. **(Nên làm) `lib/` đang gộp hai thứ khác nhau**: hàm thuần (`cv-checklist.ts`, `date.ts`) và code React/runtime (`query-client.tsx` là provider, `use-elapsed.ts` là hook — trái chính quy ước "hook → `hooks/`" của repo). Chuyển `hooks/use-elapsed.ts` → `hooks/`, và cân nhắc `providers/query-provider.tsx` → `components/providers/query-provider.tsx`.
3. **(Nên làm khi đụng SEO) Thêm `import 'server-only'`** vào các module chỉ chạy trên server: `lib/job-metadata.ts`, phần fetch của `services/salary.ts` và `services/question-bank.ts` (chúng đọc `BACKEND_URL` — biến không có tiền tố `NEXT_PUBLIC_`, lọt sang client sẽ thành chuỗi rỗng một cách im lặng).
4. **(Tuỳ chọn) Route group** khi tách khu công khai/riêng tư: ví dụ `app/(public)/salary`, `app/(auth)/login|register`, `app/dashboard/...`. Lợi ích thật nằm ở mục 2 và 5 (layout công khai không bọc `SessionProvider`).

**Không đổi:** `services/` (API client tách khỏi hook — đúng tinh thần `api/` của bulletproof-react); `lib/query-keys.ts` dạng factory tập trung kèm bảng `AFFECTED` — với một team nhỏ, một file trung tâm dễ tìm hơn key rải theo feature, và `invalidateAfter` là một quyết định tốt; colocation component theo trang (`cv-optimizer/home/`, `workspace/`).

---

## 2. Server Components vs Client Components

### (a) Khuyến nghị

- **Mặc định layout/page là Server Component.** Dùng Client Component khi cần state/event handler, effect, API trình duyệt, custom hook; dùng Server Component để fetch gần nguồn, giữ secret, *"Reduce the amount of JavaScript sent to the browser"*, cải thiện FCP và stream. — https://nextjs.org/docs/app/getting-started/server-and-client-components
- **Đẩy `"use client"` xuống lá**: *"add 'use client' at the top of the files that define your interactive components instead of marking large parts of your UI as Client Components."* Một file đã `"use client"` thì *"all of its imports and the components it directly renders are included in the client bundle"* — nhưng **không** áp cho Server Component truyền vào qua `children`/props. — cùng trang.
- **Interleaving:** truyền Server Component làm `children` của Client Component (ví dụ `<Modal><Cart /></Modal>`); nội dung server vẫn render sẵn trên server. — cùng trang.
- **`metadata`/`generateMetadata` chỉ chạy trong Server Component**; nếu trang cần tương tác, *"keep your page.tsx as a Server Component and move the Client Component logic to a separate file"*. — https://nextjs.org/docs/app/api-reference/functions/generate-metadata (lastUpdated 2026-08-19)
- **Cookie trên server:** `cookies()` là hàm **async**, đọc được trong Server Component, ghi chỉ trong Server Function/Route Handler; nó là Request-time API nên *"will opt a route into dynamic rendering"*; có `toString()` để chuyển tiếp. — https://nextjs.org/docs/app/api-reference/functions/cookies (lastUpdated 2026-06-09). Với Cache Components, phần đọc `cookies()` nên bọc trong `<Suspense>`. — https://nextjs.org/docs/app/getting-started/caching
- **Khi dữ liệu nằm ở backend riêng**, Next.js không bắt buộc fetch trên server: client fetching vẫn hợp lý cho *"Frequently polled data"* và dữ liệu phụ thuộc Web API trình duyệt, dùng SWR/React Query. — https://nextjs.org/docs/app/guides/backend-for-frontend (lastUpdated 2026-06-25)
- **TanStack Query + RSC (Advanced SSR guide):** server tạo QueryClient mới mỗi request, trình duyệt dùng singleton; đặt `staleTime > 0` để client không refetch ngay; prefetch trong Server Component rồi `dehydrate` → `<HydrationBoundary>`; từ v5.40 có thể stream query `pending` (thêm điều kiện vào `shouldDehydrateQuery`). Hai cảnh báo quan trọng: **đừng render dữ liệu của query trên server rồi lại dùng nó ở client** (hai bản dễ lệch nhau, React Query không revalidate được Server Component), và với app RSC mới *"start with your framework's data-fetching tools… This might be never, and that's fine."* — https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr. Trang này **không nói gì về cookie/auth**.
- **`loading.tsx`** bọc `page` trong `<Suspense>`, fallback được prefetch nên điều hướng tức thì; nhưng nếu **layout** đọc dữ liệu runtime thì `loading.tsx` không che được nó. Streaming là server-rendered nên *"it does not impact SEO"*; response stream luôn bắt đầu bằng `200`, gọi `notFound()` **trước** khi stream mới giữ được mã 404. — https://nextjs.org/docs/app/api-reference/file-conventions/loading (lastUpdated 2026-09-23)
- **`error.tsx`** phải là Client Component; từ **v16.3** prop `retry` ổn định (refetch + render lại), `reset` chỉ xoá trạng thái lỗi; không bắt lỗi của layout cùng segment — dùng `global-error.tsx` cho root layout. — https://nextjs.org/docs/app/api-reference/file-conventions/error (lastUpdated 2026-10-06)

### (b) Áp dụng cho repo này

Hiện trạng: 127/231 file là client; `app/layout.tsx` và `app/dashboard/layout.tsx` là Server Component (tốt); nhưng `SessionProvider` (client) gọi `/auth/me` trong `useEffect` và **trả về spinner cho tới khi có kết quả**. Hệ quả: HTML server của **mọi** trang dưới `/dashboard` — kể cả trang khách xem được `/dashboard/jobs/[id]` — chỉ chứa spinner. Không có `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx` nào trong `app/`.

Ưu tiên:

1. **(Cao) Giữ dữ liệu cần đăng nhập ở client — đừng chuyển dashboard sang fetch trên server.** Backend NestJS cấp cookie httpOnly và refresh qua `POST /auth/refresh` trong interceptor axios (`lib/axios.ts`). Muốn fetch trên server phải chuyển tiếp cookie (`(await cookies()).toString()`) **và** tự xử lý access token hết hạn: Server Component không ghi được cookie (docs `cookies()`), nên token refresh xong không đưa được về trình duyệt — phải thêm Route Handler hoặc `proxy.ts` làm refresh. Đó là một lớp phức tạp mới cho rất ít lợi ích ở trang riêng tư (không cần SEO, dữ liệu đổi liên tục, có polling/stream). TanStack cũng nói thẳng không bắt buộc. Kiến trúc hiện tại (client + TanStack Query) là đúng cho dashboard.
2. **(Cao) Trang CÔNG KHAI phải render nội dung trên server.** `/dashboard/jobs/[id]` khi khách xem: `page.tsx` đã là Server Component và đã fetch tin công khai trong `generateMetadata` (`lib/job-metadata.ts`), nhưng thân trang (`JobDetailView`, client) chỉ fetch sau khi `SessionProvider` xong. Hướng sửa có hai bước, bước nào cũng có giá trị riêng:
   - Tách trang khách khỏi `SessionProvider` (route group/layout riêng, hoặc đường công khai ngoài `/dashboard` như `/salary` đã làm), rồi trong `page.tsx` fetch `GET /api/public/jobs/:id` (cùng URL với `generateMetadata` — `fetch` được memo trong cùng một lần render, docs `generateMetadata`) và render phần mô tả tin bằng Server Component. Phần tương tác (lưu tin, chấm điểm, ứng tuyển) để Client Component lá.
   - Nếu muốn giữ `useJobDetail` cho phần client, dùng mẫu Advanced SSR: prefetch `keys.publicJob(id)` trên server → `HydrationBoundary`. Lưu ý cảnh báo "đừng render dữ liệu query trên server": chọn **một** chủ sở hữu cho mỗi mẩu dữ liệu.
3. **(Trung bình) Thêm `app/dashboard/error.tsx` và `app/global-error.tsx`.** Hiện lỗi render ở một trang làm sập cả cây. Dùng `retry` (Next ≥ 16.3; repo đang `^16.2.12` — kiểm bản đã cài, nếu < 16.3 thì là `unstable_retry`/`reset`).
4. **(Trung bình) `app/salary/[slug]/page.tsx` nên gọi `notFound()`** khi `loadSalaryPosition` trả `null` (hiện trang vẫn render với tiêu đề rỗng và mã 200 → soft 404), kèm `app/salary/[slug]/not-found.tsx`.
5. **(Thấp) Xem lại các `page.tsx` khai `"use client"` ở cấp trang** (`app/dashboard/page.tsx`, `applications/page.tsx`, `settings/page.tsx`, `login/page.tsx`, `register/page.tsx`): chúng không export được `metadata`. Tách thân trang ra `*-view.tsx` như `jobs/page.tsx` đã làm, để `page.tsx` khai được tiêu đề riêng và `robots`.

**Không đổi:** `QueryProvider` dùng `useState(() => new QueryClient())` — đúng mẫu "client singleton cho trình duyệt"; `SessionProvider` chặn render trước khi biết đăng nhập là có chủ đích bảo mật (không có `proxy.ts`), giữ cho khu riêng tư; `app/salary/*` là Server Component fetch backend — đúng mẫu.

---

## 3. Truyền dữ liệu & cache

### (a) Khuyến nghị — TanStack Query

- **Mặc định v5:** `staleTime` = `0`, `gcTime` = 5 phút (`Infinity` khi SSR) — https://tanstack.com/query/v5/docs/framework/react/reference/useQuery. Query stale tự refetch khi mount mới, focus lại cửa sổ, có mạng lại; lỗi được *"silently retried 3 times, with exponential backoff"*; kết quả *"structurally shared"*. — https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults
- **`staleTime` là núm nên chỉnh**, `gcTime` hiếm khi cần; **bọc `useQuery` trong custom hook**; **đừng chép dữ liệu query sang `useState`** (mất cập nhật nền). — https://tkdodo.eu/blog/practical-react-query
- **Key factory, key từ chung tới riêng** (`['todos','list',{filters}]`, `['todos','detail',id]`), filter đặt trong object cuối key, coi key như dependency array (đừng `refetch` với tham số mới). — https://tkdodo.eu/blog/effective-react-query-keys
- **Mutation trả về object mới thì `setQueryData`** thay vì refetch, và *không bao giờ* sửa object lấy từ cache tại chỗ. — https://tanstack.com/query/v5/docs/framework/react/guides/updates-from-mutation-responses. Khi không có dữ liệu trả về đủ, `invalidateQueries` theo tiền tố key.
- **Re-render:** tracked properties — component chỉ render lại khi thuộc tính **nó đọc** đổi; `select` để đăng ký một phần dữ liệu (*"will only re-render if the length of the todos changes"*), hàm `select` nên ổn định. — https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations
- **`isFetching` gồm cả refetch nền**, `isPending` = chưa có dữ liệu, `isLoading` = `isFetching && isPending`; `placeholderData: keepPreviousData` + `isPlaceholderData` cho phân trang. — https://tanstack.com/query/v5/docs/framework/react/reference/useQuery
- **Tránh waterfall:** prefetch trong event handler (hover/focus — cần `staleTime`, vì *"Prefetch only fires when data is older than the staleTime"*), prefetch ở component cha để làm phẳng waterfall (`usePrefetchQuery` khi dùng Suspense). — https://tanstack.com/query/v5/docs/framework/react/guides/prefetching

### (a) Khuyến nghị — cache của Next.js cho dữ liệu công khai

- **Next 16 có hai mô hình.** Mô hình mới là **Cache Components** (`cacheComponents: true`, kèm `partialPrefetching`), dùng `'use cache'` + `cacheLife(...)` (*"We recommend pairing every cache directive with a cacheLife"*) + `cacheTag`/`revalidateTag`/`updateTag`; dữ liệu không cache hoặc đọc `cookies()` phải nằm trong `<Suspense>`. App mới tạo bằng `create-next-app` bật sẵn; *"Both features will be enabled everywhere in the next major release"*. Không bật thì dùng mô hình cũ (`fetch(..., { next: { revalidate } })`). — https://nextjs.org/docs/app/getting-started/caching (lastUpdated 2026-10-06); mô hình cũ: https://nextjs.org/docs/app/guides/caching-without-cache-components
- **Bot/crawler với PPR:** bot không xử lý được metadata stream sẽ được render động lúc request; nguồn dữ liệu lúc build phải còn sống lúc request, nếu không bot nhận 500. — cùng trang, mục *Bots and crawlers*.
- **Server Action** dùng cho **mutation**, luôn là POST, *"reachable via direct POST requests"* nên phải tự kiểm auth trong từng hàm; client gửi chúng **tuần tự**. — https://nextjs.org/docs/app/getting-started/mutating-data (lastUpdated 2026-10-06). *"Server Actions are queued. Using them for data fetching introduces sequential execution."* — https://nextjs.org/docs/app/guides/backend-for-frontend
- **Route Handler** là endpoint công khai; dùng làm BFF/proxy khi cần biến đổi/gộp dữ liệu, ẩn hệ thống nội bộ; **đừng gọi Route Handler của chính mình từ Server Component** (thừa một vòng HTTP, hỏng lúc build). — cùng trang BFF.

### (b) Áp dụng cho repo này

1. **(Cao, rẻ) Sửa `hooks/use-api-query.ts` — wrapper đang tự phá hai tối ưu của TanStack:**
   - `loading: enabled && query.isFetching` → mọi **refetch nền** (sau `invalidateAfter`, sau `refetchInterval`) đều bật lại cờ loading. Nếu nơi gọi hiện skeleton theo `loading`, trang chớp skeleton dù đã có dữ liệu. Nên tách: `loading = query.isPending && enabled` (lần đầu) và `refreshing = query.isFetching` (tuỳ chọn).
   - Wrapper luôn đọc `isError`, `data`, `error`, `isFetching`, `refetch` → tracked properties không còn tác dụng: mọi component dùng `useApiQuery` render lại ở mỗi lần đổi `isFetching`. Sửa cờ như trên là đủ giảm phần lớn.
   - `data: query.isError ? null : …` vứt dữ liệu cũ khi một lần refetch nền lỗi (TanStack giữ `data` cũ kèm `error`). Cân nhắc giữ `query.data`.
   - Giữ nguyên hình dạng trả về `AsyncData<T>` để không phải sửa 19 nơi gọi.
2. **(Trung bình) `providers/query-provider.tsx`:** `staleTime: 30_000` + `refetchOnWindowFocus: false` + retry chặn 4xx là lựa chọn hợp lý cho backend gọi AI đắt — **giữ**. Nếu áp mẫu Advanced SSR cho trang công khai, phải chuyển sang `getQueryClient()` (server: mới mỗi request; browser: singleton) — QueryClient tạo trong `useState` không dùng được trong Server Component.
3. **(Trung bình) Khoá key đầu (`keys.job(jobId)` = `['job', id]` vs `keys.jobLists()` = `['jobs','list']`; `['document', id]` vs `['documents', …]`)**: invalidate `['jobs']` không chạm chi tiết tin. Đây có thể là chủ ý (đang dùng `updateJobDetail` + `setQueryData`), nhưng nên ghi rõ trong `query-keys.ts`, hoặc gom về `['jobs','detail',id]` theo mẫu TkDodo để một tiền tố phủ cả nhánh.
4. **(Thấp) Prefetch khi hover** thẻ tin trong `job-list.tsx`/`matches/job-card.tsx` → `queryClient.prefetchQuery({ queryKey: keys.job(id), queryFn })`. `staleTime` 30s sẵn có giúp prefetch không bị bắn lặp. Chỉ làm sau khi đo được chi tiết tin chậm.
5. **(Thấp) Hợp nhất `hooks/use-async-data.ts`** (chỉ còn `document-source.tsx` dùng) vào TanStack Query để chỉ còn một cơ chế tải dữ liệu.
6. **(Quyết định) Cache Components:** chưa nên bật. Repo chỉ có ba chỗ fetch trên server (`services/salary.ts` revalidate 3600, `services/question-bank.ts` và `lib/job-metadata.ts` revalidate 300) — mô hình `next.revalidate` cũ vẫn chạy trong Next 16. Khi dựng lại trang tin công khai bằng Server Component (mục 2) thì đó là lúc hợp lý để thử `cacheComponents` + `'use cache'; cacheLife('minutes')` cho `getPublicJob(id)`.
7. **Không dùng Server Action / Route Handler làm lớp giữa cho API đã có.** Backend NestJS đã là API; `next.config.ts` đã có `rewrites` `/api/:path* → BACKEND_URL` (BFF mức tối thiểu, giữ cookie cùng origin). Thêm Server Action chỉ để gọi lại backend là thêm một chặng, phải tự chuyển tiếp cookie, và bị tuần tự hoá.

**Không đổi:** `invalidateAfter(action)` (một bảng ánh xạ hành động → nhóm key, dễ rà); `setQueryData` trong `updateJobDetail`/`afterSaveJob`; giữ state stream cục bộ trong `useJobScoring` (đúng *render optimizations*).

---

## 4. Hiệu năng

### (a) Khuyến nghị

- **Phân tích bundle:** từ v16.1 có Bundle Analyzer tích hợp Turbopack: `pnpm next analyze` (lọc theo route, client/server, xem chuỗi import), `--output` để lưu và so trước/sau. Webpack thì `@next/bundle-analyzer`. — https://nextjs.org/docs/app/guides/package-bundling (lastUpdated 2026-10-06)
- **`optimizePackageImports`** (vẫn gắn nhãn **Experimental**) cho thư viện xuất hàng trăm module như bộ icon; danh sách tối ưu sẵn **không có `@phosphor-icons/react`**. — https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports (lastUpdated 2025-12-19)
- **Việc nặng mà chỉ biến dữ liệu thành UI** (markdown, highlight, chart) nên chạy trong Server Component. — https://nextjs.org/docs/app/guides/package-bundling
- **Lazy load:** `next/dynamic` (= `React.lazy` + Suspense) cho Client Component chỉ hiện khi cần (modal); `ssr: false` chỉ dùng trong Client Component; thư viện ngoài nạp bằng `import()` ngay trong event handler. — https://nextjs.org/docs/app/guides/lazy-loading (lastUpdated 2026-03-10)
- **React Compiler:** ổn định trong Next từ **v16.0.0** (`reactCompiler: true` top-level, cần `babel-plugin-react-compiler`, build chậm hơn chút; có chế độ `compilationMode: 'annotation'` + `"use memo"`). — https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler (lastUpdated 2026-10-02). React: compiler *"is now stable"*; với code mới dựa vào compiler, `useMemo`/`useCallback` còn là *escape hatch* (ví dụ giữ ổn định dependency của effect); với code cũ *"leaving existing memoization in place… or carefully testing before removing"*. — https://react.dev/learn/react-compiler/introduction
- **Colocate state:** *"Localize your state"* — state càng gần chỗ dùng thì càng ít component render lại. — https://kentcdodds.com/blog/colocation
- **Virtualization** cho list/bảng rất dài (*"only rendering what is visible to the user"*). — https://web.dev/articles/virtualize-long-lists-react-window
- **Core Web Vitals:** LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1, đo ở **phân vị 75** tách mobile/desktop. Field data: CrUX, PageSpeed Insights, Search Console, thư viện `web-vitals`; Lighthouse là lab và **không đo được INP** (dùng TBT thay), lab *"is not a substitute for field measurement"*. — https://web.dev/articles/vitals
- **`useReportWebVitals`** (client component riêng, import vào root layout; callback phải giữ nguyên tham chiếu để không báo trùng; gửi bằng `navigator.sendBeacon`). — https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals (lastUpdated 2026-10-05)
- **`next/image`, `next/font`** tự lo resource hint (preload/preconnect) — *"Next.js in-built features such as next/font, next/image and next/script automatically handle relevant resource hints"*. — https://nextjs.org/docs/app/api-reference/functions/generate-metadata (mục *Resource hints*); chi tiết: https://nextjs.org/docs/app/getting-started/images và https://nextjs.org/docs/app/getting-started/fonts

### (b) Áp dụng cho repo này

1. **(Cao, 10 phút) Chạy `pnpm next analyze --output` một lần** để có số liệu nền trước khi tối ưu gì. Mọi mục dưới đây nên được xác nhận bằng con số đó.
2. **(Cao, rẻ) Thêm `experimental.optimizePackageImports: ['@phosphor-icons/react']`** vào `next.config.ts`. Phosphor không có trong danh sách mặc định, và ít nhất 10 file import từ entry gốc `@phosphor-icons/react` (số khác dùng `/ssr`). Xác nhận bằng analyzer trước/sau.
3. **(Trung bình) `next/dynamic` cho thứ nặng chỉ hiện khi bấm**: các modal (`profile/edit-modal.tsx` 313 dòng, `interview/add-position-modal.tsx`), `components/auth/google-sign-in-button.tsx` (`@react-oauth/google`, chỉ cần ở login/register). Ưu tiên theo kết quả analyzer.
4. **(Trung bình) Đo field data:** thêm `app/_components/web-vitals.tsx` dùng `useReportWebVitals`, gửi về một endpoint của backend (hoặc chỉ log ở bản đầu). Trang đáng theo dõi INP nhất là trình sửa CV (gõ thẳng lên iframe) và luồng stream chấm điểm.
5. **(Quyết định) React Compiler:** repo đã có quy ước "đặt state đúng chỗ, không rắc `memo`" (`CLAUDE.md` mục 3) — khớp với khuyến nghị của React. Bật `reactCompiler` là việc rủi ro thấp, nhưng nên chạy `compilationMode: 'annotation'` trước trên vài màn nặng, và đặt `enablePreserveExistingMemoizationGuarantees` tường minh như docs Next khuyên. **Không cần** thêm `memo` thủ công khi chưa thấy vấn đề.
6. **(Thấp) `<img>` thô** ở `components/jobs/company-logo.tsx` và `components/ads/affiliate-inline.tsx`: logo công ty đến từ nhiều domain portal → `next/image` buộc khai `remotePatterns` cho từng domain. Chỉ đáng đổi nếu logo là phần tử LCP; nếu giữ `<img>`, nhớ đặt `width`/`height` (hoặc khung kích thước cố định như hiện có — `size-11/13/16`) để tránh CLS.
7. **Virtualization: chưa cần.** Danh sách tin/đơn đã phân trang (`components/ui/pagination.tsx`, `matchPage(limit, offset)`).

**Không đổi:** `next/font/google` với `subsets: ['latin','vietnamese']` + `display: 'swap'` (đúng); ba script bootstrap theme/font-scale/sidebar trong `<head>` để tránh nháy giao diện — chủ ý, đừng chuyển sang effect; quy ước colocate state stream (`useJobScoring` chỉ trong `MatchPanel`).

---

## 5. SEO

### (a) Khuyến nghị

- **Metadata API:** `metadata` tĩnh hoặc `generateMetadata` (chỉ Server Component); `fetch` trong `generateMetadata` được memo dùng chung với page; nên đặt `metadataBase` ở root layout (đường dẫn tương đối trong metadata mà thiếu `metadataBase` là lỗi build); có `title.template`, `alternates.canonical`, `openGraph`, `robots`. Metadata merge **nông** — segment sau đặt `openGraph`/`robots` là **thay hẳn** của segment trước. Với bot chỉ đọc HTML (ví dụ `facebookexternalhit`), metadata chặn render và nằm trong `<head>`; với Googlebot có thể stream vào `<body>`. — https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- **File convention SEO:** `app/robots.ts`, `app/sitemap.ts`, `opengraph-image.(tsx|png)` / `twitter-image`. — https://nextjs.org/docs/app/getting-started/project-structure (mục *Metadata file conventions*); chi tiết: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots, https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap, https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- **JSON-LD:** render `<script type="application/ld+json">` thường (không `next/script`) trong page/layout, và thay `<` bằng `<` khi `JSON.stringify` để chống XSS; có thể gõ kiểu bằng `schema-dts`, kiểm bằng Rich Results Test. — https://nextjs.org/docs/app/guides/json-ld (lastUpdated 2026-03-02)
- **Google & JavaScript:** Googlebot crawl → xếp hàng render → index; SSR/pre-render *"is still a great idea"*; nếu HTML gốc có `noindex`, Google *"may skip rendering and JavaScript execution"* — đừng định gỡ `noindex` bằng JS. Soft 404 ở SPA: chuyển tới URL trả 404 thật hoặc thêm `noindex`. — https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- **Google JobPosting (đọc kỹ trước khi làm):** — https://developers.google.com/search/docs/appearance/structured-data/job-posting
  - Chỉ đặt trên trang **một tin**, *"must appear on the same page as the job description that job seekers can read in their browser"*; không đặt trên trang danh sách.
  - *"Users must be able to see the job posting details without the need to login."* Trang không được bị chặn bởi robots.txt, `noindex` hoặc đăng nhập.
  - Mọi thông tin trong markup phải hiển thị trên trang; mô tả phải đầy đủ (*"We don't allow job postings with incomplete job descriptions"*); phải có cách ứng tuyển.
  - Trang bên thứ ba: giữ nguyên tiêu đề như nhận từ nhà tuyển dụng; *"Only employers can provide baseSalary"*; `logo` chỉ hiển thị trên site của mình.
  - Tin hết hạn: `validThrough` trong quá khứ, hoặc 404/410, hoặc gỡ markup — *"Failure to take timely action on expired jobs may result in a manual action."* Google khuyên dùng **Indexing API** thay sitemap cho URL tin tuyển dụng.
- **Trang 404 khi stream** được Next chèn `<meta name="robots" content="noindex">`; muốn mã 404 thật thì gọi `notFound()` trước khi stream. — https://nextjs.org/docs/app/api-reference/file-conventions/loading

### (b) Áp dụng cho repo này

Hiện trạng: không có `robots.ts`, `sitemap.ts`, `metadataBase`, ảnh OG, JSON-LD. `lib/job-metadata.ts` đặt `robots: { index: false, follow: false }` cho **mọi** trang tin (kể cả khi đọc được tin) — tức tin tuyển dụng đang cố ý không được index. Trang `/salary` và `/salary/[slug]` không có `robots` → được index (đúng với chú thích "ngoài /dashboard để Google đọc được").

1. **(Cao, rẻ) `noindex` cho toàn khu riêng tư bằng metadata ở `app/dashboard/layout.tsx`** (file này là Server Component nên export được `metadata`): `robots: { index: false, follow: false }`. Hiện các trang dashboard dùng `"use client"` ở cấp trang kế thừa metadata gốc **không có** `noindex`. Trang khách cần index sau này thì đặt `robots` riêng ở `page.tsx` (metadata merge nông — segment con thay hẳn). **Đừng** chặn `/dashboard` bằng `Disallow` trong `robots.txt` nếu muốn `noindex` có tác dụng — Google phải crawl được trang mới đọc được thẻ `noindex`.
2. **(Cao, rẻ) Thêm `app/robots.ts` + `app/sitemap.ts`** cho phần công khai thật sự: `/salary`, `/salary/[slug]` (lấy danh sách slug từ `salaryService.positions()` đã có). Thêm `metadataBase` ở `app/layout.tsx` (cần biến môi trường URL site, ví dụ `NEXT_PUBLIC_SITE_URL`) và `alternates.canonical` cho `/salary/*` vì cùng nội dung có ở `/dashboard/salary/*` (`SalaryList basePath`).
3. **(Trung bình) Ảnh OG mặc định** (`app/opengraph-image.png` tĩnh là đủ) — link tin dán vào Zalo/Facebook hiện chỉ có tiêu đề + mô tả.
4. **(Quyết định của chủ dự án — CHƯA làm) JobPosting JSON-LD và index trang tin.** Về kỹ thuật cần: trang tin render nội dung trên server, không qua `SessionProvider` (mục 2.b.2), không `noindex`, mô tả đầy đủ hiển thị không cần đăng nhập, ẩn/404 tin hết hạn, `validThrough`. Nhưng có hai lực cản không phải kỹ thuật:
   - **Điều khoản portal**: `../ai-job-search/docs/adr/0006-dieu-khoan-portal.md` ghi gần như mọi portal cấm *hiển thị/sao chép* nội dung, và bước giảm rủi ro số (3) khi thương mại hoá là *không* hiển thị toàn văn mô tả. Đưa toàn văn tin quét được lên Google qua JobPosting là khuếch đại đúng tầng rủi ro đó. Trong khi đó Google lại *đòi* mô tả đầy đủ — hai yêu cầu đối nghịch.
   - **Hướng dẫn Google cho trang bên thứ ba**: không được tự cung cấp `baseSalary` (chỉ nhà tuyển dụng), giữ nguyên tiêu đề, và tin trùng giữa portal (`duplicateOfId` ở backend) cần một URL chuẩn.
   - `noindex` hiện tại là lựa chọn an toàn; giữ nó cho tới khi chủ dự án quyết.
5. **(Thấp) `notFound()` ở `/salary/[slug]`** (đã nêu ở mục 2) — tránh soft 404 ngay trên trang đang được index.

**Không đổi:** `generateMetadata` của trang tin đọc API công khai có `revalidate: 300` (đúng), OG title/description cho chia sẻ link; `app/manifest.ts`.

---

## 6. Chia nhỏ component

### (a) Khuyến nghị

- **Colocation:** *"Place code as close to where it's relevant as possible"*; *"Things that change together should be located as close as reasonable."* — https://kentcdodds.com/blog/colocation
- **Trước khi dùng context:** (1) *"Start by passing props"* — luồng dữ liệu tường minh; (2) *"Extract components and pass JSX as children"* — nếu prop chỉ đi xuyên qua tầng trung gian không dùng nó, thường là đã quên tách component (`<Layout><Posts posts={posts} /></Layout>`). — https://react.dev/learn/passing-data-deeply-with-context
- **bulletproof-react:** giữ mọi thứ gần chỗ dùng; *"Do not add multiple rendering functions inside your application"* (tách thành component); *"If your component is accepting too many props you might consider splitting it into multiple components"* hoặc dùng children/slot; trừu tượng hoá component dùng chung khi đã thấy lặp. — https://github.com/alan2207/bulletproof-react/blob/master/docs/components-and-styling.md
- **Container/presentational thời hooks:** custom hook đảm nhận phần "container" (lấy dữ liệu, key, transform), component trình bày nhận props — đó là lý do TkDodo khuyên bọc `useQuery` trong custom hook. — https://tkdodo.eu/blog/practical-react-query
- **Composition giữa server/client:** truyền Server Component qua `children` thay vì kéo cả cây thành client. — https://nextjs.org/docs/app/getting-started/server-and-client-components

### (b) Áp dụng cho repo này

Quy ước hiện tại ("truyền ít props nhất — lý tưởng chỉ một `id`", component tự gọi `useJobDetail(jobId)`) là một biến thể hợp lệ của container-in-hook: TanStack gộp request theo key nên không tốn thêm mạng. Nó lệch nhẹ so với lời khuyên "start by passing props" của react.dev, và cái giá là **phụ thuộc ẩn** (component chỉ chạy được bên trong `QueryProvider` + `SessionProvider`, khó dùng lại, khó test). Cân bằng đề xuất:

1. **(Giữ, ghi rõ ranh giới)** Quy tắc "chỉ nhận `id`" áp cho **component miền** (`app/dashboard/**`, `components/jobs/**, components/documents/**`); còn `components/ui/**` luôn nhận dữ liệu qua props, không gọi hook dữ liệu. Thêm một câu vào `CLAUDE.md` để quy tắc không lan xuống `ui/`.
2. **(Trung bình) Tách các file > ~250 dòng theo trạng thái màn hình**, như `cv-optimizer/home|workspace` đã làm: `jobs/jobs-view.tsx` (324), `interview/prep-detail.tsx` (364), `applications/page.tsx` (312, cũng là page `"use client"` — tách thân ra `applications-view.tsx`), `profile/edit-modal.tsx` (313). Tiêu chí là trách nhiệm, không phải số dòng.
3. **(Thấp) Dùng `children`/slot thay vì prop xuyên tầng** ở chỗ có layout bọc — `AppLayout` đã làm đúng (`sidebar={...}` + `children`). Áp mẫu này khi tách trang tin công khai: layout server tĩnh, slot client cho phần tương tác.
4. **(Thấp) `useSession()` bên trong `useJobDetail`** là ví dụ phụ thuộc ẩn: hook đổi key theo trạng thái đăng nhập. Ổn khi chỉ dùng dưới dashboard; nếu dựng trang tin công khai ngoài `SessionProvider` thì cần một hook riêng cho bản khách (hoặc truyền `signedIn` vào) — nếu không, `useSession` sẽ trả giá trị mặc định của context (`loading: true`, `user: null`).

**Không đổi:** "mỗi component một file", "chỉ tách khi có lý do", không ternary lồng, zustand cho UI state anh em (`useProfileUi`, `useCvDraft`), react-hook-form cho form — đều khớp các nguồn trên.

---

## Lộ trình ưu tiên

| # | Việc | File chính | Tác động | Công sức | Rủi ro |
|---|---|---|---|---|---|
| 1 | Sửa cờ `loading`/`data` trong `useApiQuery` (`isPending` vs `isFetching`, giữ data cũ khi refetch lỗi) | `hooks/use-api-query.ts` | Cao (bớt chớp skeleton, bớt re-render ở 19 hook) | Thấp | Thấp–TB (nơi gọi dựa vào `loading` khi refetch — rà bằng visual test) |
| 2 | `robots: noindex` cho `app/dashboard/layout.tsx`; thêm `robots.ts`, `sitemap.ts`, `metadataBase`, canonical cho `/salary/*` | `app/dashboard/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/layout.tsx` | Cao (SEO đúng ngay) | Thấp | Thấp |
| 3 | Chạy `pnpm next analyze`, thêm `optimizePackageImports` cho Phosphor | `next.config.ts` | TB–Cao (tuỳ số đo) | Thấp | Thấp (tính năng Experimental) |
| 4 | `error.tsx` cho dashboard + `global-error.tsx`; `notFound()` + `not-found.tsx` cho `/salary/[slug]` | `app/dashboard/error.tsx`, `app/global-error.tsx`, `app/salary/[slug]/` | TB | Thấp | Thấp |
| 5 | Luật import một chiều (ESLint) + chuyển `useSession`/toast context, `hooks/use-elapsed.ts` | `eslint.config.mjs`, `providers/session-provider.tsx`, `hooks/` | TB (chống nợ kiến trúc) | Thấp–TB | Thấp |
| 6 | `server-only` cho module đọc `BACKEND_URL` | `lib/job-metadata.ts`, `services/salary.ts`, `services/question-bank.ts` | TB | Rất thấp | Thấp |
| 7 | `useReportWebVitals` + endpoint nhận số liệu | `app/_components/web-vitals.tsx` | TB (có field data để quyết định) | Thấp–TB | Thấp |
| 8 | `next/dynamic` cho modal và nút Google | `profile/edit-modal.tsx`, `components/auth/google-sign-in-button.tsx`… | TB (theo số đo) | Thấp | Thấp |
| 9 | Tách `page.tsx` `"use client"` thành page server + `*-view.tsx`; tách các file > 300 dòng | `app/dashboard/{page,applications,settings}`, `jobs-view.tsx`, `prep-detail.tsx` | TB (metadata từng trang, dễ đọc) | TB | Thấp |
| 10 | Trang tin công khai render trên server, ra khỏi `SessionProvider` (có thể kèm `HydrationBoundary`) | `app/dashboard/jobs/[id]/*`, layout/route group mới | Cao **nếu** muốn SEO/chia sẻ link tốt | Cao | TB (đụng luồng khách/đăng nhập, cần visual test) |
| 11 | React Compiler (annotation mode trước) | `next.config.ts` | Thấp–TB | Thấp | TB (phụ thuộc mức tuân thủ Rules of React) |
| 12 | Cache Components (`cacheComponents` + `'use cache'`) cho dữ liệu công khai | `next.config.ts`, fetch công khai | Thấp–TB | TB | TB (đổi mô hình render toàn app) |
| 13 | JobPosting JSON-LD + bỏ `noindex` trang tin | `lib/job-metadata.ts`, trang tin | Cao về traffic | TB | **Cao** (ToS portal, chính sách Google cho trang bên thứ ba) — chỉ làm sau quyết định của chủ dự án |

## Câu hỏi mở cho chủ dự án

1. **Trang tin có nên được Google index không?** `noindex` hiện tại có phải vì ToS portal (theo `../ai-job-search/docs/adr/0006-dieu-khoan-portal.md`)? Nếu vẫn `noindex`, việc #10 chỉ còn lợi ích chia sẻ link/hiệu năng, có thể hạ ưu tiên.
2. **`NEXT_PUBLIC_API_URL` ở production trỏ tới đâu** — cùng origin qua `rewrites` `/api` của `next.config.ts`, hay thẳng domain backend? Câu trả lời quyết định cookie có đi cùng request server-side/SSR được không, và có cần `SameSite=None` không.
3. **URL công khai chính thức của trang tin**: giữ `/dashboard/jobs/[id]` (route khách trong khu dashboard) hay chuyển ra `/jobs/[id]` như `/salary`? Cần cho canonical, sitemap và việc tách khỏi `SessionProvider`.
4. **Có ngân sách/nơi để gửi Web Vitals** (endpoint backend, GA, Vercel Analytics) không? Không có field data thì các việc tối ưu hiệu năng chỉ dựa vào lab.
5. **Bản Next đang cài là 16.2 hay ≥ 16.3?** (`error.tsx` dùng `retry` hay `unstable_retry`; Bundle Analyzer cần ≥ 16.1.)
6. **Có muốn ép luật import bằng lint** (CI đỏ khi vi phạm) hay chỉ ghi quy ước trong `CLAUDE.md`?
