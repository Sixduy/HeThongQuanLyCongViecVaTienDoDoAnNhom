# API dự kiến (REST)

Base: `/api`

## Auth
- `POST /auth/login`
- `POST /auth/logout` (nếu dùng blacklist/session; JWT thuần có thể bỏ)
- `GET /auth/me`

## Users (Admin)
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/active`

## Projects, Topics Bank & Groups (Lớp học phần & Phân nhóm)
- `GET /project?projectId=:id` (Lấy thông tin đồ án và nhóm đang mở Workspace)
- `GET /topics` (Lấy danh sách ngân hàng đề tài lớp học phần, quy mô Cá nhân 1 SV / Nhóm 2-3 SV và trạng thái đăng ký)
- `POST /topics` (Giảng viên tạo đề tài mới trong lớp học phần)
- `POST /topics/:id/register-solo` (Sinh viên nhận đề tài cá nhân 1 người về cho mình)
- `POST /topics/:id/register-team` (Sinh viên tạo nhóm, đặt tên nhóm, chỉ định Nhóm trưởng, chọn thành viên và đăng ký đề tài nhóm)
- `POST /topics/:id/reset` (Đặt lại trạng thái đề tài trống để phục vụ trình diễn demo)
- `GET /team?projectId=:id` (Lấy danh sách thành viên và vai trò của nhóm hiện tại)

## Milestones
- `GET /projects/:id/milestones`
- `POST /projects/:id/milestones`
- `PATCH /milestones/:id`
- `DELETE /milestones/:id`

## Tasks
- `GET /projects/:id/tasks`
- `POST /projects/:id/tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/progress`
- `POST /tasks/:id/lock-progress`
- `POST /tasks/:id/unlock-progress`

## Comments & files
- `GET /tasks/:id/comments`
- `POST /tasks/:id/comments`
- `POST /tasks/:id/attachments`
- `GET /attachments/:id/download`

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/remind` (GVHD gửi nhắc trực tiếp)

> Chi tiết body/response chốt khi implement; file này chỉ là danh mục endpoint.
