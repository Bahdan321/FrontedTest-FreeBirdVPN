import cookies from 'next-cookies';

export function setCookie(name: string, value: string, options: any = {}) {
    const cookieOptions = {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        ...options,
    };

    if (typeof window !== 'undefined') {
        const cookiestring = `${name}=${encodeURIComponent(value)}; path=${cookieOptions.path}; max-age=${cookieOptions.maxAge}`;
        document.cookie = cookiestring;
    }
}

export function getCookie(name: string): string | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${name}=`));

    if (cookie) {
        return decodeURIComponent(cookie.split('=')[1]);
    }

    return undefined;
}

export function removeCookie(name: string) {
    if (typeof window !== 'undefined') {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
}