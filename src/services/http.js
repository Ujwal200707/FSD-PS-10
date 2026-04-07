import API from './api';

// Attach token automatically if present
export function attachAuthInterceptor(getToken) {
  API.interceptors.request.use(cfg => {
    const t = getToken && getToken();
    if (t) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${t}` };
    return cfg;
  });
}

export default API;
