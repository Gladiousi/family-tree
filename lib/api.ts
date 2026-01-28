const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://familytree-backend-k4i5.onrender.com';
const REQUEST_TIMEOUT = 30000;

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

function fetchWithTimeout(url: string, options: RequestInit, timeout: number = REQUEST_TIMEOUT): Promise<Response> {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Превышено время ожидания запроса')), timeout)
        ),
    ]);
}

function handleApiError(error: any, path: string, method: string): Error {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return new Error('Ошибка подключения к серверу. Проверьте интернет-соединение.');
    }
    
    if (error.message === 'Превышено время ожидания запроса') {
        return new Error('Сервер не отвечает. Попробуйте позже.');
    }
    
    if (error.message) {
        return error;
    }
    
    return new Error(`Ошибка ${method} ${path}`);
}

async function safeJsonParse<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
        return null as T;
    }
    
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error('Неверный формат ответа от сервера');
    }
}

export const api = {
    async get<T>(path: string): Promise<T> {
        const token = getToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
            const res = await fetchWithTimeout(`${API_URL}${path}`, { headers });
            
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            
            if (!res.ok) {
                const error = await safeJsonParse<{ detail?: string; message?: string }>(res).catch(() => ({ 
                    detail: `GET ${path}: ${res.status}` 
                }));
                const errorMessage = 'detail' in error ? error.detail : ('message' in error ? error.message : `Ошибка: ${res.status}`);
                throw new Error(errorMessage || `Ошибка: ${res.status}`);
            }
            
            return await safeJsonParse<T>(res);
        } catch (error: any) {
            throw handleApiError(error, path, 'GET');
        }
    },

    async post<T>(path: string, body: any): Promise<T> {
        const token = getToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
            const res = await fetchWithTimeout(`${API_URL}${path}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            
            if (!res.ok) {
                const err = await safeJsonParse<any>(res).catch(() => ({}));
                const firstError = Object.values(err)[0];
                const errorMessage = err.detail || err.message || 
                    (Array.isArray(firstError) ? firstError[0] : firstError) || 
                    'Ошибка выполнения запроса';
                throw new Error(String(errorMessage));
            }
            
            return await safeJsonParse<T>(res);
        } catch (error: any) {
            throw handleApiError(error, path, 'POST');
        }
    },

    async patch<T>(path: string, body: any, isFormData: boolean = false): Promise<T> {
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        if (!isFormData) headers['Content-Type'] = 'application/json';

        try {
            const res = await fetchWithTimeout(`${API_URL}${path}`, {
                method: 'PATCH',
                headers,
                body: isFormData ? body : JSON.stringify(body),
            });
            
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            
            if (!res.ok) {
                const error = await safeJsonParse<any>(res).catch(() => ({ 
                    detail: `PATCH ${path}: ${res.status}` 
                }));
                const firstError = Object.values(error)[0];
                const errorMessage = error.detail || error.message || 
                    (Array.isArray(firstError) ? firstError[0] : firstError) || 
                    `Ошибка: ${res.status}`;
                throw new Error(String(errorMessage));
            }
            
            return await safeJsonParse<T>(res);
        } catch (error: any) {
            throw handleApiError(error, path, 'PATCH');
        }
    },

    async delete<T>(path: string, body?: any): Promise<T> {
        const token = getToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
            const res = await fetchWithTimeout(`${API_URL}${path}`, {
                method: 'DELETE',
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            
            if (!res.ok) {
                const error = await safeJsonParse<{ detail?: string; message?: string }>(res).catch(() => ({ 
                    detail: `DELETE ${path}: ${res.status}` 
                }));
                const errorMessage = 'detail' in error ? error.detail : ('message' in error ? error.message : `Ошибка: ${res.status}`);
                throw new Error(errorMessage || `Ошибка: ${res.status}`);
            }
            
            if (res.status === 204) return null as T;
            return await safeJsonParse<T>(res);
        } catch (error: any) {
            throw handleApiError(error, path, 'DELETE');
        }
    },

    async uploadFile<T>(path: string, file: File, fileType: 'photo' | 'video'): Promise<T> {
        const token = getToken();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
            const res = await fetchWithTimeout(`${API_URL}${path}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            
            if (res.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            
            if (!res.ok) {
                const error = await safeJsonParse<any>(res).catch(() => ({ 
                    detail: `UPLOAD ${path}: ${res.status}` 
                }));
                const errorMessage = error.detail || error.message || `Ошибка загрузки файла: ${res.status}`;
                throw new Error(String(errorMessage));
            }
            
            return await safeJsonParse<T>(res);
        } catch (error: any) {
            throw handleApiError(error, path, 'UPLOAD');
        }
    },
};
