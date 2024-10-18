# CLEM-ICO-Backend

## Requirements
- **Python Version**: 3.10.4
- **Node Version**: 16

## API Documentation

### 1. User Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| POST   | `/api/v1/user/login`                  | User login                  |
| POST   | `/api/v1/user/signup`                 | User registration           |
| PATCH  | `/api/v1/user/verifyOTP`              | Verify OTP                  |
| PUT    | `/api/v1/user/resendOTP`              | Resend OTP                  |
| POST   | `/api/v1/user/forgotPassword`         | Forgot password             |
| GET    | `/api/v1/user/viewChangleyStatus`     | View Changley Status        |
| GET    | `/api/v1/user/profile`                | View user profile           |

### 2. KYC Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| GET    | `/api/v1/kyc/viewKyc`                 | View KYC                    |
| POST   | `/api/v1/kyc/addKYC`                  | Add new KYC                 |
| POST   | `/api/v1/kyc/editKYC`                 | Edit KYC details            |
| PUT    | `/api/v1/kyc/editProfile`             | Edit user profile           |

#### KYC Admin Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| GET    | `/api/v1/admin/listkyc`               | List all KYC requests       |
| GET    | `/api/v1/admin/viewkyc/:id`           | View specific KYC           |
| PUT    | `/api/v1/admin/approveRejectKyc`      | Approve or reject KYC       |

### 3. Contact Us Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| GET    | `/api/v1/contactUs/contactUsView`     | View contact us messages    |
| POST   | `/api/v1/contactUs/contactUs`         | Add a contact us message    |
| GET    | `/api/v1/contactUs/contactUs/:id`     | View specific contact us message |

### 4. Newsletter Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| POST   | `/api/v1/subscribe-newsletter`        | Subscribe to newsletter     |

### 5. Admin Endpoints

| Method | Endpoint                               | Description                 |
|--------|----------------------------------------|-----------------------------|
| PUT    | `/api/v1/admin/updateAdminProfile`    | Update admin profile        |
| PATCH  | `/api/v1/admin/changePassword`        | Change admin password       |
| GET    | `/api/v1/admin/adminProfile`          | View admin profile          |
| DELETE | `/api/v1/admin/deleteUser`            | Delete a user               |
| GET    | `/api/v1/admin/listUser`              | List all users              |
| GET    | `/api/v1/admin/viewUser`              | View specific user          |
| POST   | `/api/v1/admin/resetPassword`         | Reset user password         |
| PUT    | `/api/v1/admin/blockUnblockUser`      | Block/Unblock a user        |
| POST   | `/api/v1/admin/login`                 | Admin login                 |
| POST   | `/api/v1/admin/forgotPassword`        | Admin forgot password       |
| POST   | `/api/v1/admin/verifyOTP`             | Admin verify OTP            |
| PUT    | `/api/v1/admin/resendOTP`             | Admin resend OTP            |
| GET    | `/api/v1/admin/subscribeView`         | View subscriptions          |
| POST   | `/api/v1/admin/subscribeList`         | List all subscriptions      |
| GET    | `/api/v1/admin/dashboard`             | View dashboard stats        |

---

