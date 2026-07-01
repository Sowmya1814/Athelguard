// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api";

// ─── Helper ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("access_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Step 1: Login (email + password + role)
export const loginStep1 = async (email, password, role) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Step 2: Login TOTP verification
export const loginStep2 = async ({ user_id, nominee_id, totp_token, role }) => {
  const res = await fetch(`${BASE_URL}/auth/login/totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, nominee_id, totp_token, role }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Register User Step 1 (returns QR code + user_id)
export const registerUser = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/register/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Register User Step 2 (verify TOTP, activate account)
export const registerUserTotp = async (user_id, totp_token) => {
  const res = await fetch(`${BASE_URL}/auth/register/user/totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, totp_token }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Register Nominee Step 1 (via token from email)
export const registerNominee = async (token, emergency_code, password) => {
  const res = await fetch(`${BASE_URL}/auth/register/nominee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, emergency_code, password }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Register Nominee Step 2 (verify TOTP)
export const registerNomineeTotp = async (nominee_id, totp_token) => {
  const res = await fetch(`${BASE_URL}/auth/register/nominee/totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nominee_id, totp_token }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Forgot Password
export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// Reset Password
export const resetPassword = async (token, password) => {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
};

// ─── USER ─────────────────────────────────────────────────────────────────────

export const getUserProfile = async () => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const updateUserProfile = async (payload) => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const getVaultStatus = async () => {
  const res = await fetch(`${BASE_URL}/user/vault-status`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const handleNomineeAccessRequest = async (action) => {
  const res = await fetch(`${BASE_URL}/user/nominee/access`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ action }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// ─── VAULT ────────────────────────────────────────────────────────────────────

export const uploadTextToVault = async (title, content) => {
  const res = await fetch(`${BASE_URL}/vault/upload/text`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, content }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const uploadFileToVault = async (file, title) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await fetch(`${BASE_URL}/vault/upload/file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Do NOT set Content-Type here; browser sets it with boundary for multipart
    },
    body: formData,
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const listVaultItems = async () => {
  const res = await fetch(`${BASE_URL}/vault/items`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// export const getVaultItem = async (item_id) => {
//   const res = await fetch(`${BASE_URL}/vault/items/${item_id}`, {
//     headers: authHeaders(),
//   });
//   return res.json().then((data) => ({ ok: res.ok, data }));
// };

export const deleteVaultItem = async (item_id) => {
  const res = await fetch(`${BASE_URL}/vault/items/${item_id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// ─── NOMINEE ──────────────────────────────────────────────────────────────────

export const getNomineeProfile = async () => {
  const res = await fetch(`${BASE_URL}/nominee/profile`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const nomineeRequestAccess = async () => {
  const res = await fetch(`${BASE_URL}/nominee/request-access`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminListUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

export const adminDeleteUser = async (user_id) => {
  const res = await fetch(`${BASE_URL}/admin/users/${user_id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};





// ── ADD THESE to the bottom of your existing src/api/api.js ──────────────────

// Get full decrypted vault item (user)
export const getVaultItem = async (item_id) => {
  const res = await fetch(`${BASE_URL}/vault/items/${item_id}`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// Nominee: list vault (metadata only — requires approved access)
export const nomineeListVault = async () => {
  const res = await fetch(`${BASE_URL}/nominee/vault`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// Nominee: view + decrypt a single vault item
export const nomineeGetVaultItem = async (item_id) => {
  const res = await fetch(`${BASE_URL}/nominee/vault/${item_id}`, {
    headers: authHeaders(),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};

// Nominee: verify emergency code to unlock vault access
export const nomineeVerifyAccess = async (emergency_code) => {
  const res = await fetch(`${BASE_URL}/nominee/verify-access`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ emergency_code }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
};