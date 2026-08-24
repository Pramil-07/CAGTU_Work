import axios from 'axios';
import Cookies from 'js-cookie';
import { showNotification } from '@mantine/notifications';

// Create Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // http://192.168.0.189:8005/api/v1
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    Cookies.set('msaccessToken', accessToken, { secure: true, sameSite: 'strict' });
  }
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { secure: true, httpOnly: true, sameSite: 'strict' });
  }
};

const getAccessToken = () => Cookies.get('msaccessToken');
const getRefreshToken = () => Cookies.get('refreshToken');

// Store refresh token requests to prevent duplicate calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Add access token to headers
apiClient.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      const isLoginEndpoint = config.url?.includes('/login');
      const isRefreshEndpoint = config.url?.includes('/api/token/refresh');
      if (!isLoginEndpoint && !isRefreshEndpoint && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', {
        message: error.message,
        code: error.code,
        config: error.config,
      });
      return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 errors, refresh token, and notify user
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Log error for debugging
      console.error('Axios error:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // Handle 401 errors for non-login and non-refresh endpoints
      if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/login') &&
          !originalRequest.url?.includes('/api/token/refresh/')
      ) {
        // Check for refresh token before proceeding
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token found,redirecting to login', {
            cookies: { msaccessToken: getAccessToken(), refreshToken: getRefreshToken() },
          });
          // showNotification({
          //   id: 'refresh-token',
          //   title: 'Session Expired',
          //   message: "Login using your credentials!",
          //   color: 'red',
          //   autoClose: 3000,
          // });

          // Clear tokens and reset queue
          // processQueue(new Error('No refresh token'), null);
          // Cookies.remove('msaccessToken');
          // Cookies.remove('refreshToken');

          // Redirect to login and prevent further retries
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            console.log('Redirecting to /login');
            // window.location.href = '/login';
          }
          return Promise.reject(new Error('No refresh token available'));
        }

        if (isRefreshing) {
          // Queue request while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              })
              .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Show loading notification
        // const notificationId = 'refresh-token';
        // showNotification({
        //   id: notificationId,
        //   title: 'Session Update',
        //   message: 'Updating your session...',
        //   loading: true,
        //   autoClose: false,
        // });

        try {
          // Call refresh token endpoint with correct payload
          console.log('Attempting to refresh token with:', {
            refresh: refreshToken,
            url: `${process.env.NEXT_PUBLIC_API_REFRESH}/api/token/refresh/`,
          });
          const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_REFRESH}/api/token/refresh/`,
              { refresh: refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
          );

          const { access, refresh: newRefreshToken } = response.data;

          // Validate response
          if (!access) {
            throw new Error('Invalid response: No access token received');
          }

          // Save new tokens (replace msaccessToken)
          console.log('Saving new tokens:', { access, newRefreshToken });
          saveTokens(access, newRefreshToken);

          // Update notification on success
          // showNotification({
          //   id: notificationId,
          //   title: 'Session Updated',
          //   message: 'Your session has been updated. Reloading page...',
          //   color: 'green',
          //   autoClose: 2000,
          // });

          // Reload the current page
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              console.log('Reloading page after successful token refresh');
              window.location.reload();
            }, 1000); // Delay to allow notification to be seen
          }

          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;

          // Resolve queued requests
          processQueue(null, access);

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token error:', {
            message: refreshError.message,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
            headers: refreshError.response?.headers,
            request: {
              url: refreshError.config?.url,
              data: refreshError.config?.data,
            },
          });

          // Show failure notification
          // showNotification({
          //   id: notificationId,
          //   title: 'Session Expired',
          //   message: 'Your session has expired. Please log in again.',
          //   color: 'red',
          //   autoClose: 3000,
          // });

          // Clear tokens and reset queue
          // processQueue(refreshError, null);
          // Cookies.remove('msaccessToken');
          // Cookies.remove('refreshToken');

          // Redirect to login and prevent further retries
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            // console.log('Redirecting to /login after refresh failure');
            // window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
          console.log('Reset isRefreshing flag');
        }
      }

      // Show generic error notification for non-401 errors
      if (error.response?.status !== 401) {
        // showNotification({
        //   id: 'general-error',
        //   title: 'Error',
        //   message: error.response?.data?.message || 'An error occurred. Please try again.',
        //   color: 'red',
        //   autoClose: 3000,
        // });
        console.log("error",erro.response?.data?.message)
      }

      return Promise.reject(error);
    }
);

export default apiClient;