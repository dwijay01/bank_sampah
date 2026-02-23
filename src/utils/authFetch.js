export default async function authFetch(url, options = {}) {
    const token = localStorage.getItem('auth_token');

    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type if there's a body and it's not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    let data;
    try {
        data = await response.json();
    } catch (err) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return null;
    }

    if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan sistem');
    }

    return data;
}
