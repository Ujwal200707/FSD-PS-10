# LMS Full-Stack Project

This workspace contains a React (Vite) frontend and a Spring Boot backend with MySQL.

Quick start (dev):

1. Start MySQL (if using local MySQL) and create database `lms_db`.

2. Start backend in STS or via terminal:

```bash
cd backend
mvn spring-boot:run
```

3. Start frontend dev server:

```bash
cd ..
npm install
npm run dev
```

API base used by frontend: `http://localhost:8080/api` (Vite proxy forwards `/api` to backend).

Run services locally (no Docker):

- Start MySQL (local) and create database `lms_db`.
- Start backend in STS or via terminal:

```bash
cd backend
mvn spring-boot:run
```

- Start frontend dev server:

```bash
cd ..
npm install
npm run dev
```

Sanity test examples (curl):

Register:

```bash
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"username":"alice","email":"a@a.com","password":"pass","role":"STUDENT"}'
```

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"pass"}'
```

Get courses:

```bash
curl http://localhost:8080/api/courses
```

Submit assignment (replace TOKEN):

```bash
curl -X POST http://localhost:8080/api/assignments/1/submit -H "Authorization: Bearer $TOKEN" -F "file=@/path/to/file.pdf"
```

Notes and next steps:
- The backend stores uploaded files under `backend/uploads`.
- JWT secret in `backend/src/main/resources/application.properties` should be changed for production.
- Email reset flow is mocked.
- You can copy the frontend `dist` to `backend/src/main/resources/static` to serve it from Spring Boot.

If you want, I can:
- Implement small React pages/forms to exercise these APIs.
- Wire token storage (localStorage) and axios auth interceptor in frontend.
- Run through a local test session and verify endpoints.

*** End README
