export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setUser = (user) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {}
  }
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem("user");
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
};

export const clearAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
