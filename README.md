# DSV Internship Frontend

This is the backend API for the DSV Internship system, built with **NestJS** and **TypeScript**.

## Tech Stack

- **NestJS** (Node.js Framework)
- **TypeScript**
- **JWT** for authentication
- **MongoDB** for database
- **AWS S3** for file storage
- **Prettier** for code quality

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/trungnhDSV/dsv-intership-backend.git
cd dsv-intership-backend
```

### 2. Install dependencies

```bash
npm i
```

### 3. Environment Variables

Create a `.env.development` file in the root directory with the following fields:

| Variable                | Description                                                                                              | Example / How to set up                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PORT`                  | Port for the backend server to listen on.                                                                | `PORT=8080`                                                                                              |
| `GMAIL_USER`            | Gmail address used for sending system emails.                                                            | `GMAIL_USER=your.email@gmail.com`                                                                        |
| `GMAIL_PASS`            | Gmail App Password for the above email (not your regular password!).                                     | [Generate here](https://support.google.com/accounts/answer/185833)                                       |
| `APP_URL`               | The URL where your frontend is running.                                                                  | `APP_URL=http://localhost:3000`                                                                          |
| `MONGO_URI`             | MongoDB connection string (local or cloud/Atlas).                                                        | `MONGO_URI=mongodb://localhost:27017/dsv-internship`                                                     |
|                         |                                                                                                          | `MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dsv-internship?retryWrites=true&w=majority`  |
| `JWT_SECRET`            | Secret key for signing and verifying JWT tokens. Use a long, random string. Must be the same on frontend | [Generate](https://generate-random.org/string-generator?count=1&length=64) <br> `JWT_SECRET=your_secret` |
| `AWS_ACCESS_KEY_ID`     | AWS Access Key for S3 bucket (file upload).                                                              | [How to create IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)          |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key for S3 bucket.                                                                     |                                                                                                          |
| `AWS_REGION`            | AWS region where your S3 bucket is located.                                                              | `AWS_REGION=ap-southeast-1`                                                                              |
| `AWS_S3_BUCKET_NAME`    | The name of your S3 bucket for file uploads.                                                             | `AWS_S3_BUCKET_NAME=your_bucket_name`                                                                    |

---

#### **Sample `.env.development`**

```env
PORT=8080
GMAIL_USER=your.email@gmail.com
GMAIL_PASS=your_gmail_app_password
APP_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/dsv-internship

JWT_SECRET=your_super_long_random_secret

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### 4. Run application

```bash
npm run start:dev
```
