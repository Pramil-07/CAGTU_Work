// import auth from '../../services/authService';
import http from '../../services/httpService';

export class CipherAPI {
    uri: string;

    constructor(uri: string) {
        this.uri = `${uri}`;
    }

    list = async (query?: any) =>
        await http.get(this.uri, {
            params: query,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    listWithId = async (id: number, query?: any) =>
        await http.get(`${this.uri}${id}/`, {
            params: query,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    get = async (id: number | string) =>
        await http.get(`${this.uri}${id}/`, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    store = async (data: any, id?: number | string, params?: any,  headers?:any) => {
        if (id) {
            return await http.patch(`${this.uri}${id}/`, data, {
                params: params,
                headers: headers
                // headers: { Authorization: `Bearer ${auth.getJwt()}` },
            });
        }
        return await http.post(this.uri, data, {
            params: params,
            headers: headers
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    // to send id in the body instead of as part of the url
    storeOne = async (data: any, product?: number | string, params?: any, headers?: any) => {
        if (product) {
            // Include id in the payload instead of URL
            return await http.put(this.uri, { ...data, product }, {
                params: params,
                headers: headers
            });
        }
        return await http.post(this.uri, data, {
            params: params,
            headers: headers
        });
    };
    

    save = async (data: any, id?: number | string, params?: any) => {
        if (id) {
            return await http.patch(`${this.uri}${id}/`, data, {
                params: params,
                // headers: { Authorization: `Bearer ${auth.getJwt()}` },
            });
        }
        return await http.patch(`${this.uri}`, data, {
            params: params,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    storeWithUrl = async (url: string) => {
        return await http.post(
            url,
            {},
            {
                // headers: { Authorization: `Bearer ${auth.getJwt()}` },
            }
        );
    };

    storeWithIdAndData = async (data: any, id: number | string) => {
        return await http.post(`${this.uri}${id}/`, data, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    storeWithIdAndDataPutMethod = async (data: any, id: number | string) => {
        return await http.put(`${this.uri}${id}/`, data, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    storeWithId = async (id: string) => {
        return await http.post(
            `${this.uri}/${id}/`,
            {},
            {
                // headers: { Authorization: `Bearer ${auth.getJwt()}` },
            }
        );
    };

    delete = async (id: number | string) =>
        await http.delete(`${this.uri}${id}/`, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    deleteWithString = async (id: string) =>
        await http.delete(`${this.uri}${id}/`, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    remove = async (id: number) =>
        await http.patch(`${this.uri}${id}/`, {
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });

    multipleDelete = async (params?: any) => {
        return await http.delete(this.uri, {
            params: params,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    multipleDeleteWithUrl = async (url: string, params?: any) => {
        return await http.delete(url, {
            params: params,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };

    multiplePatchWithUrl = async (url: string, params?: any) => {
        return await http.patch(url, {
            params: params,
            // headers: { Authorization: `Bearer ${auth.getJwt()}` },
        });
    };
}

export default CipherAPI;
