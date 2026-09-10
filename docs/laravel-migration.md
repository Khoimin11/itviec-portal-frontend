# Checklist chuyển frontend sang Laravel

- [x] 1. Đọc cấu trúc và xác định React/NestJS.
- [x] 2. Loại bỏ tích hợp backend cũ và server runtime không dùng.
- [x] 3. Chuẩn hóa Axios/API layer, token, lỗi và multipart upload.
- [x] 4. Tạo VITE_API_URL và chuyển các service sang Laravel.
- [x] 5. Kiểm tra API client, TypeScript và production build.

## Phân loại

| Thành phần | Vai trò | Xử lý |
| --- | --- | --- |
| app/pages, app/components, app/layouts, public | UI, CSS, ảnh, icon | Giữ |
| app/routes, app/routes.ts, app/root.tsx | React Router, metadata, provider | Giữ |
| app/hooks, app/stores, app/contexts | React Query, Zustand, trạng thái và quyền ở UI | Giữ |
| app/types, app/constants, app/locales, app/i18n | Kiểu dữ liệu, nội dung, bản dịch | Giữ |
| app/services, app/utils/axiosCustom.ts | Hợp đồng HTTP và tích hợp backend cũ | Chuyển sang API client Laravel |
| /auth/refresh và VITE_BASE_URL | Cơ chế refresh token/cấu hình backend cũ | Bỏ |
| location-pb4e.onrender.com | API địa phương ngoài dự án; chưa xác định framework | Chuyển sang /api/provinces |
| @react-router/serve, start trỏ build/server, Docker Node runtime | Server phục vụ SSR không dùng khi ssr:false | Bỏ, phục vụ build/client tĩnh |
| @react-router/node | Công cụ React Router cần cho build | Giữ; không phải NestJS |
| isbot | Entry server mặc định của React Router dùng khi build/prerender SPA | Giữ sau khi kiểm chứng bằng build; không phải backend nghiệp vụ |

Không tìm thấy @nestjs/*, controller/module/provider NestJS, Prisma hoặc TypeORM trong frontend. Các tên endpoint, kiểu camelCase và role không phải phụ thuộc framework; giữ chúng làm hợp đồng cho Laravel để tránh viết lại UI.

Backend bên cạnh là skeleton Laravel 13, chưa có routes/api.php tại thời điểm kiểm tra. Checklist này chuẩn bị frontend; không triển khai database, controller, authentication hoặc nghiệp vụ Laravel.

## API layer sau chuyển đổi

`Component / React Query → app/services → app/api/index.ts → app/api/client.ts → VITE_API_URL`

- Axios chỉ được tạo trong `app/api/client.ts`. Các service trả về `Promise<IResponse<T>>`; kiểu này dùng chung `ApiResponse<T>`.
- `app/api/index.ts` đọc URL, token từ localStorage và xóa phiên khi token hiện tại nhận 401. Không còn request `/auth/refresh`, refresh cookie hoặc redirect bằng timer trong interceptor.
- Giữ cơ chế Bearer token để tương thích login hiện tại. Laravel có thể cấp Sanctum API token và trả trong trường `accessToken`. Chưa chuyển sang Sanctum cookie/session; nếu chọn mô hình cookie sau này phải đổi đồng bộ CSRF, credentials và UI lưu token.
- `Accept: application/json`, timeout 15 giây, array query dạng `levels[]=Junior&levels[]=Senior`, từ khóa được Axios encode.
- HTTP 4xx/5xx và lỗi mạng reject bằng `ApiError`, gồm `status`, `message`, `errors`. Laravel 422 giữ các lỗi theo field. React Query dùng nhánh lỗi; MutationCache hiển thị thông báo. Các handler gọi service trực tiếp có catch riêng, không chạy tiếp logic thành công khi thất bại.
- 401 của request cũ không xóa một token mới đã đăng nhập trong lúc request đang chạy.
- FormData PUT/PATCH được gửi bằng POST cùng `_method=PUT/PATCH`; không sửa FormData gốc. Browser tự tạo multipart boundary. JSON PUT/PATCH giữ nguyên method.
- UserAuthentication kiểm tra `/auth/account` khi tải trang, không còn bỏ qua lần chạy đầu tiên. Route công khai được so khớp chính xác thay vì mọi URL đều khớp tiền tố `/`.

## Hợp đồng phản hồi Laravel

Giữ tên camelCase của các trường trong `app/types` qua API Resource/DTO Laravel. Tên bảng/cột database có thể dùng snake_case độc lập.

Phản hồi thành công nên theo mẫu sau để tương thích toàn bộ UI:

```json
{
  "isSuccess": true,
  "message": "Thành công",
  "data": { "id": 1 }
}
```

Login `/api/auth/login` và Google login `/api/auth/login-google` cần trả:

```json
{
  "isSuccess": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "<token do Laravel cấp>",
    "user": {
      "id": 1,
      "username": "Nguyen",
      "email": "user@example.com",
      "phoneNumber": "",
      "loginType": "EMAIL",
      "role": "APPLICANT",
      "avatar": ""
    }
  }
}
```

UI dùng role `APPLICANT`, `COMPANY`, `ADMIN`. Laravel phải kiểm tra quyền ở backend; route guard React chỉ phục vụ giao diện. Không tin role gửi từ client. Logout phải thu hồi token ở Laravel.

Các danh sách có phân trang như `/api/job` và `/api/company/all-job`:

```json
{
  "isSuccess": true,
  "message": "",
  "data": {
    "data": [],
    "pagination": { "page": 1, "limit": 10, "totalItems": 0, "totalPages": 0 }
  }
}
```

Cursor pagination của review dùng `{ "totalItems": 0, "next": null, "limit": 10 }`. API tỉnh/thành `/api/provinces?name=...` dùng `data: { "data": [{ "code": 1, "name": "Hà Nội" }] }` trong envelope trên để giữ cấu trúc các dropdown hiện có. `/api/job/quantity` trả số trong `data`; API toggle như wishlist/follow trả boolean. Các mutation sửa/xóa cần trả đối tượng/ID/boolean theo kiểu service vì UI dùng giá trị đó để cập nhật store; không đổi tất cả sang 204.

Client cũng đọc được resource đơn dạng `{ "data": ... }` và raw JSON. Không tự đoán/chuyển đổi Laravel paginator mặc định `{ data, links, meta }` sang pagination của UI; controller/resource cần trả đúng envelope lồng bên trên.

Lỗi validation dùng định dạng Laravel chuẩn với HTTP 422:

```json
{
  "message": "The given data was invalid.",
  "errors": { "email": ["Email đã được sử dụng."] }
}
```

Không trả HTTP 200 cho lỗi. API client vẫn reject các response cũ có `isSuccess: false` để tránh gọi callback thành công.

## Cấu hình Laravel cần làm tiếp

- [ ] Cài/bật API routing trong backend, triển khai các route ở [api-endpoints.md](api-endpoints.md). Laravel tự thêm prefix `/api`; không thêm lần nữa vào từng route.
- [ ] Cài authentication phù hợp với Bearer contract, endpoint account/logout, validation và policy/authorization.
- [ ] Cấu hình CORS cho origin FE thực tế (local mặc định `http://localhost:5173`, preview `http://localhost:4173`); cho phép `Accept`, `Authorization`, `Content-Type`, các HTTP method và preflight OPTIONS.
- [ ] Xây database, model, Resource và response pagination theo `app/types`/`app/services`.
- [ ] Thiết lập upload/storage và trả URL file truy cập được từ browser.
- [ ] Thiết kế email verification và reset password an toàn. Form reset hiện tại gửi email + password; khi dùng password broker Laravel phải bổ sung token từ link email vào frontend và endpoint, không cho đổi mật khẩu chỉ bằng email.
- [ ] Thiết lập Google OAuth client ID và xác minh Google credential tại Laravel nếu dùng chức năng này.
- [ ] Kiểm thử tích hợp thực tế: login, 401, validation, CRUD, search, phân trang, upload và quyền giữa các tài khoản.

Các mục này là công việc BE tiếp theo; chưa đánh dấu API nghiệp vụ đã hoạt động.

## Kết quả kiểm tra

- `npm run test:api`: 9/9 đạt, dùng Axios adapter giả lập, không gọi API nghiệp vụ thật.
- `npm run typecheck`: đạt. Đã sửa lỗi import Loading, kiểu RegisterEmployer, state Option[] và bỏ ba prop onChange thừa của InputBase (component đã xử lý định dạng lương bên trong).
- `npm run build`: đạt, xuất `build/client`. URL `http://localhost:8000/api` có trong bundle.
- `npm ls --all`: đạt, không có xung đột dependency.
- Preview local: `/` và `/employer/login` cùng HTTP 200, route lồng trả đúng HTML SPA fallback.
- `@react-router/serve` đã được gỡ; `isbot` được giữ vì build mặc định yêu cầu nó. Lần thử gỡ isbot khiến React Router tự cài lại; đã khôi phục dependency build và xác minh lại.
- Build còn cảnh báo chunk lớn/import không dùng. npm vẫn báo 27 cảnh báo bảo mật sau khi gỡ server runtime; chưa thực hiện đợt nâng cấp bảo mật ngoài phạm vi chuyển API.
- Chưa kiểm thử Docker hoặc tích hợp nghiệp vụ với Laravel vì backend chưa có endpoint.

## Tài liệu đối chiếu

- [React Router SPA](https://reactrouter.com/how-to/spa): giữ `ssr:false`, triển khai thư mục `build/client` và fallback về index.html.
- [Axios request config](https://axios-http.com/docs/req_config): baseURL, headers, timeout, params và credentials.
- [Laravel Sanctum](https://laravel.com/docs/13.x/sanctum): token API và lựa chọn session cookie cho SPA.
- [Laravel validation](https://laravel.com/docs/13.x/validation): phản hồi JSON 422.
