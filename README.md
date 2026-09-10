# ITviec Portal Frontend

React 19 + TypeScript + React Router 7 (SPA). Backend dự kiến: Laravel trong `../itviec-portal-backend`.

## Chạy local

Sử dụng Node.js 24 LTS và npm. Khi clone mới, sao chép `.env.example` thành `.env` (không ghi đè nếu đã có cấu hình riêng):

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

`.env`:

```dotenv
VITE_API_URL=http://localhost:8000/api
VITE_CLIENT_ID=
```

`VITE_API_URL` là URL API mà trình duyệt truy cập, gồm prefix `/api`. Đổi giá trị nếu Laravel chạy host/port khác. Khởi động lại Vite sau khi sửa env. Biến `VITE_*` được đưa vào bundle công khai; không đặt secret trong đó. `VITE_CLIENT_ID` là Google OAuth client ID công khai, chỉ cần khi cấu hình Google login.

Laravel có thể chạy bằng `php artisan serve --host=localhost --port=8000` tại thư mục backend. Backend hiện chưa có các API nghiệp vụ, nên giao diện có thể hiển thị nhưng các request vẫn lỗi cho tới khi triển khai route/controller và CORS. Chi tiết ở checklist bên dưới.

## Kiểm tra và build

```powershell
npm run test:api
npm run typecheck
npm run build
npm start
```

`npm start` chỉ preview local từ `build/client` (mặc định port 4173). Production phục vụ `build/client` bằng web server tĩnh với fallback về `index.html`; không có Node/NestJS backend trong frontend.

Dockerfile dùng Node để build và Nginx để phục vụ file tĩnh:

```powershell
docker build --build-arg VITE_API_URL=https://api.example.com/api -t itviec-frontend .
docker run --rm -p 8080:80 itviec-frontend
```

Env Vite được chốt lúc build, không đổi bằng env runtime của container Nginx. URL API phải truy cập được từ trình duyệt người dùng. Docker image chưa được kiểm thử trong lần chuyển đổi này.

## Tài liệu chuyển Laravel

- [Checklist, phân loại React/backend và hợp đồng response](docs/laravel-migration.md)
- [72 endpoint Laravel cần triển khai](docs/api-endpoints.md)
- API client: `app/api/client.ts`; cấu hình URL/session: `app/api/index.ts`; service nghiệp vụ: `app/services`.

Giữ `@react-router/node` và `isbot` vì React Router 7.1.3 dùng entry server mặc định để build/prerender SPA. Đây là công cụ build, không phải NestJS. Đã bỏ `@react-router/serve` và cấu hình chạy server SSR cũ.
