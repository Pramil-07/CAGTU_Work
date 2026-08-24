import axios from 'axios';

axios.defaults.baseURL = process.env['NX_BUZZ_API_URL'];

axios.interceptors.response.use(
    (res) => res,
    (error) => {
        const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;
        if (!expectedError) {
            console.log('Sorry! There was a problem with your request.');
        }

        return Promise.reject(error);
    }
);

const setJwt = (jwt: string) => {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwt;
};

const http = {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    patch: axios.patch,
    setJwt,
};

export default http;
