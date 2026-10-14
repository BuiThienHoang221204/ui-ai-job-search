# Làm việc trong `ui-ai-job-search`

Frontend Next.js (App Router) + Tailwind v4 + TanStack Query + zustand + react-hook-form. Backend nằm ở `../ai-job-search/server`. Hệ thiết kế đã chốt ở `design.md` — đọc trước khi đổi giao diện.

## Quy tắc bắt buộc khi viết component

**1. Code đơn giản, dễ đọc.** Logic thẳng, ít tầng, không trừu tượng hoá trước khi cần. Ba dòng lặp lại tốt hơn một helper khó hiểu. Cụ thể (chốt 2026-10-14 sau một đợt rà):

- **Hành động gắn với sự kiện người dùng, không với `useEffect` + `setTimeout`.** Đã sửa: tự lưu câu trả lời bằng effect hẹn giờ + `useCallback` + cờ `dirty` + hàm `toggle` phải phối hợp với nhau, dễ sinh lưu lặp khi danh tính hàm đổi. Nay `practice-question.tsx` lưu ở `onBlur` của ô nhập — bấm nút nào khác cũng làm ô mất focus nên không mất chữ.
- **Không ternary lồng**, kể cả trong biến hiển thị: gán bằng `if` trước `return`.
- **Chỉ tách hàm/component khi có lý do** (dùng ≥ 2 nơi, hoặc là một khái niệm có tên rõ). Hàm không dùng state của component thì đưa ra `lib/`, đừng khai trong thân component.
- **Không dùng mẹo để code ngắn hơn** (`flatMap` trả `[]`/`[x]`, ghép chuỗi rồi lọc theo hậu tố…): viết `filter` + `map` hoặc vòng lặp thường.

**2. Truyền ÍT props nhất có thể — lý tưởng là chỉ một `id`.** Component tự lấy dữ liệu nó cần qua custom hook thay vì nhận cả object từ cha rồi chuyền tiếp xuống.

- Dữ liệu từ server: **TanStack Query bọc trong custom hook**, mọi component gọi cùng hook — TanStack tự gộp theo key nên không tốn thêm request. Mẫu: `useJobDetail(jobId)` ở `app/dashboard/jobs/[id]/use-job-detail.ts` — thanh tab, khối điểm, nhận xét, đối chiếu đều chỉ nhận `jobId`.
- State giao diện dùng chung giữa các component anh em (modal đang mở, tab, bộ lọc): **zustand**. Mẫu: `useProfileUi` ở `hooks/use-profile.ts`, `useCvDraft` ở `hooks/use-cv-draft.ts`.
- Form: **react-hook-form** (`Controller` cho component tuỳ biến như `SelectMenu`).
- Ghi xong thì cập nhật cache (`queryClient.setQueryData`) hoặc `invalidateAfter(...)` ở `lib/query-keys.ts`, đừng giữ bản sao dữ liệu server trong `useState`.

**3. Tránh re-render thừa bằng cách đặt state ĐÚNG CHỖ, không phải rắc `memo`.** State đổi nhanh (stream từng mảnh, đếm giờ, ô đang gõ) phải nằm trong component NHỎ NHẤT dùng nó. Mẫu: `useJobScoring(jobId)` chỉ được gọi trong `MatchPanel`, nên mỗi mảnh stream của lượt chấm điểm chỉ render lại khối đó chứ không kéo cả trang. Chỉ dùng `memo`/`useMemo` khi đã thấy vấn đề thật.

**4. Tái sử dụng component có sẵn** trong `components/ui/` (`Card`, `SectionCard`, `Button`, `Badge`, `Progress`, `ProgressCircle`, `SelectMenu`, `Tabs`, `Modal`…) và `components/dashboard/`. Không tạo component mới khi một cái có sẵn làm được; ưu tiên sửa component đang có hơn thêm file. Không dùng thẻ HTML gốc (`<select>`…) khi đã có component tương ứng.

**5. Đặt file đúng chỗ.**

- **Type/interface dùng ở hơn một file → `types/`** (một file theo miền, export lại qua `types/index.ts`). Chỉ type nội bộ của đúng một file (ví dụ kiểu state của một store) mới được khai tại chỗ.
- **Hook (`useXxx`) → `hooks/`**, kể cả hook chỉ một trang dùng. Không để hook nằm trong `components/` hay cạnh trang trong `app/`. Mẫu: `hooks/use-job-detail.ts`, `hooks/use-cv-draft.ts`, `hooks/use-document-job.ts`.
- **Hàm thuần (không React) → `lib/`** kèm test ở `test/unit/lib/`. Mẫu: `lib/cv-checklist.ts`.
- **Mỗi component một file.** Trang lớn chia thư mục con theo trạng thái màn hình (ví dụ `cv-optimizer/home/`, `cv-optimizer/workspace/`), file gốc chỉ ghép các phần lại.
- **Component dùng ở nhiều trang → `components/`.** Mẫu: `components/dashboard/job-action-cards.tsx` dùng chung cho trang chi tiết tin và trang CV.
- **Không viết lớp bọc mỏng.** Component chỉ để gọi lại một component khác với vài props cố định thì viết thẳng ở chỗ dùng.

**6. Xoá code chết ngay.** Component, hàm, hằng không còn ai import thì xoá trong cùng thay đổi.

## Quy trình

- **Đổi giao diện: làm mockup HTML trước** trong `mockups/` (thư mục bị gitignore), mở cho người dùng xem, và **chỉ code khi được duyệt rõ ràng** ("ok triển khai", "làm đi").
- **Không commit / push** khi người dùng chưa yêu cầu.
- Trước khi coi là xong: `pnpm exec tsc --noEmit -p .`, `pnpm exec eslint <thư mục đã sửa>`, `pnpm exec vitest run`.
- **Chỉ chạy prettier trên file mình sửa.** Chạy cả thư mục sẽ định dạng lại (kể cả đổi xuống dòng CRLF) những file không liên quan — xem `git status` và `git checkout` các file đó.

## Cách viết

- Chữ hiển thị cho người dùng: tiếng Việt.
- Comment: chỉ một dòng `/** ... */` ngắn trên hàm/component có logic đáng giải thích. Không comment cho hằng, kiểu, JSX.
- Đọc DOM trong iframe thì không dùng `instanceof` (khác realm) — xem `../ai-job-search/CLAUDE.md`, mục bản xem trước CV.
