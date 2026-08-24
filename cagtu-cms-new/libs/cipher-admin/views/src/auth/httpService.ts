import { urls } from '@cagtu-cms/data-access';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

axios.defaults.baseURL = process.env['NX_CIPHER_API_URL'];

// axios.interceptors.response.use(
//     (res) => res,
//     (error) => {
//         const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;
//         if (!expectedError) {
//             showNotification({
//                 title: 'Uh oh! something went wrong',
//                 message: 'Sorry! There was a problem with your request.',
//                 color: 'red',
//             });
//         }

//         return Promise.reject(error);
//     }
// );

axios.interceptors.request.use(
    (config) => {
        const access = localStorage.getItem('access');
        if (access && config.url !== '/user/login/') {
            config.headers = {
                ...(config.headers as any),
                Authorization: `Bearer ${access}`,
            };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const response = await fetch(`${process.env['NX_CIPHER_API_URL']}${urls.auth_refresh}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
                    });
                    const data: any = await response.json();
                    if (data.access && data.refresh) {
                        localStorage.setItem('access', data.access);
                        localStorage.setItem('refresh', data.refresh);
                    } else {
                        throw new Error('Session time out. Please login again.');
                    }

                    return axios(originalConfig);
                } catch (_error) {
                    // Logging out the user by removing all the tokens from local
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Session time out. Please login again.',
                        color: 'red',
                    });
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');

                    // Redirecting the user to the login page
                    window.location.href = '/';
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

// const setJwt = (jwt: string) => {
//     axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwt;
// };

const http = {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    patch: axios.patch,
    // setJwt,
};

export default http;
