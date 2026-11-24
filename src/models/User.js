const DEFAULT_USER = {
  id: null,
  email: "",
  hashed_password: null,
  user_type: "disabled",
  display_name: null,
  created_at: null,
  updated_at: null,
};

export function createUser(data = {}) {
  return {
    ...DEFAULT_USER,
    ...data,
    user_type: String(data.user_type ?? DEFAULT_USER.user_type).toLowerCase(),
  };
}
