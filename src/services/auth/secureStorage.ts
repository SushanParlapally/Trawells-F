/**
 * Secure storage utilities for sensitive data
 * Aligned with backend JWT token system
 * Provides encryption and expiration capabilities
 */

interface StorageOptions {
  encrypt?: boolean;
  expirationMinutes?: number;
  useSessionStorage?: boolean;
}

interface StoredData {
  value: string;
  timestamp: number;
  expirationTime?: number;
  encrypted?: boolean;
}

interface StorageData {
  [key: string]: string | number | boolean | object;
}

export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'travel_desk_secure_key';
  private static readonly PREFIX = 'td_secure_';

  /**
   * Store data securely with optional encryption and expiration
   */
  static setItem(
    key: string,
    value: string,
    options: StorageOptions = {}
  ): void {
    const {
      encrypt = true,
      expirationMinutes,
      useSessionStorage = false,
    } = options;
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const fullKey = this.PREFIX + key;

    let processedValue = value;
    if (encrypt) {
      processedValue = this.encrypt(value);
    }

    const data: StoredData = {
      value: processedValue,
      timestamp: Date.now(),
      encrypted: encrypt,
    };

    if (expirationMinutes) {
      data.expirationTime = Date.now() + expirationMinutes * 60 * 1000;
    }

    try {
      storage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  }

  /**
   * Retrieve data from secure storage
   */
  static getItem<T = string>(key: string, defaultValue?: T): T | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return defaultValue || null;

      const decryptedValue = this.decrypt(encryptedValue);
      const parsedValue: StorageData = JSON.parse(decryptedValue);

      return parsedValue as T;
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Remove item from secure storage
   */
  static removeItem(key: string, useSessionStorage = false): void {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const fullKey = this.PREFIX + key;
    storage.removeItem(fullKey);
  }

  /**
   * Check if item exists and is not expired
   */
  static hasItem(key: string, useSessionStorage = false): boolean {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const fullKey = this.PREFIX + key;

    try {
      const item = storage.getItem(fullKey);
      if (!item) return false;

      const data: StoredData = JSON.parse(item);

      if (data.expirationTime && Date.now() > data.expirationTime) {
        this.removeItem(key, useSessionStorage);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if item is expired
   */
  private static isExpired(key: string, useSessionStorage = false): boolean {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const fullKey = this.PREFIX + key;

    try {
      const item = storage.getItem(fullKey);
      if (!item) return true;

      const data: StoredData = JSON.parse(item);
      if (!data.expirationTime) return false;

      return Date.now() > data.expirationTime;
    } catch {
      return true;
    }
  }

  /**
   * Simple encryption using base64 and XOR (for basic obfuscation)
   * Note: This is not cryptographically secure, but provides basic protection
   * For production, consider using Web Crypto API for stronger encryption
   */
  private static encrypt(text: string): string {
    try {
      const key = this.ENCRYPTION_KEY;
      let encrypted = '';

      for (let i = 0; i < text.length; i++) {
        const textChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(textChar ^ keyChar);
      }

      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Fallback to unencrypted
    }
  }

  /**
   * Simple decryption using base64 and XOR
   */
  private static decrypt(encryptedText: string): string {
    try {
      const key = this.ENCRYPTION_KEY;
      const encrypted = atob(encryptedText);
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        const encryptedChar = encrypted.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  /**
   * Migrate existing localStorage items to secure storage
   */
  static migrateFromLocalStorage(
    keys: string[],
    options: StorageOptions = {}
  ): void {
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        this.setItem(key, value, options);
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clean up expired items
   */
  static cleanupExpired(useSessionStorage = false): number {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const keysToRemove: string[] = [];
    let cleanedCount = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        const originalKey = key.replace(this.PREFIX, '');
        if (this.isExpired(originalKey, useSessionStorage)) {
          keysToRemove.push(key);
          cleanedCount++;
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
    return cleanedCount;
  }
}

/**
 * Token-specific secure storage utilities
 * Aligned with backend JWT token system (no refresh tokens)
 */
export class TokenStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  /**
   * Store JWT token securely
   */
  static setToken(token: string, expirationMinutes?: number): void {
    SecureStorage.setItem(this.TOKEN_KEY, token, {
      encrypt: true,
      expirationMinutes,
    });
  }

  /**
   * Get JWT token
   */
  static getToken(): string | null {
    return SecureStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove JWT token
   */
  static removeToken(): void {
    SecureStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Store user data securely
   */
  static setUserData(userData: object, expirationMinutes?: number): void {
    SecureStorage.setItem(this.USER_KEY, JSON.stringify(userData), {
      encrypt: true,
      expirationMinutes,
    });
  }

  /**
   * Get user data
   */
  static getUserData<T = Record<string, unknown>>(): T | null {
    const userData = SecureStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as T;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Remove user data
   */
  static removeUserData(): void {
    SecureStorage.removeItem(this.USER_KEY);
  }

  /**
   * Clear all authentication data
   */
  static clearAll(): void {
    this.removeToken();
    this.removeUserData();
  }

  /**
   * Check if token exists and is not expired
   */
  static hasValidToken(): boolean {
    return SecureStorage.hasItem(this.TOKEN_KEY);
  }
}
