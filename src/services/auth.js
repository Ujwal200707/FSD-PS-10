import API from "./api";

// ✅ REGISTER
export async function register(payload) {
  const res = await API.post("/auth/register", payload);
  return res.data;
}

// ✅ LOGIN (CLEAN + CORRECT)
export async function login(payload) {
  const body = {
    username: payload.username || payload.email, // ✅ send email directly
    password: payload.password
  };

  const res = await API.post("/auth/login", body);
  return res.data;
}

// ✅ FORGOT PASSWORD
export async function forgotPassword(email) {
  const res = await API.post(
    "/auth/forgot-password?email=" + encodeURIComponent(email)
  );
  return res.data;
}