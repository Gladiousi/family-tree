export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
        div.textContent = input;
        return div.innerHTML;
    }
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

export function isValidUsername(username: string): boolean {
    if (!username || typeof username !== 'string') return false;
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username.trim());
}

export function isValidPassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}

export function truncateString(str: string, maxLength: number): string {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

export function sanitizeTextField(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';
    const sanitized = sanitizeString(input);
    return truncateString(sanitized, maxLength);
}

export function isValidId(id: string | number): boolean {
    if (!id) return false;
    if (typeof id === 'number') return id > 0;
    if (typeof id !== 'string') return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return true;
    
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}

export const tokenStorage = {
    set: (token: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('token', token);
        } catch (error) {
            console.error('Ошибка сохранения токена:', error);
        }
    },
    
    get: (): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem('token');
        } catch (error) {
            console.error('Ошибка получения токена:', error);
            return null;
        }
    },
    
    remove: (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Ошибка удаления токена:', error);
        }
    },
};

class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    
    canMakeRequest(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        
        const recentRequests = requests.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return false;
        }
        
        recentRequests.push(now);
        this.requests.set(key, recentRequests);
        return true;
    }
    
    reset(key: string): void {
        this.requests.delete(key);
    }
}

export const rateLimiter = new RateLimiter();