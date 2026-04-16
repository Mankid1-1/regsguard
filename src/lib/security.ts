/**
 * Enhanced Security Measures
 * CSRF protection, input validation, and security utilities
 */

import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

// CSRF Protection
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly COOKIE_NAME = 'csrf-token';
  private static readonly HEADER_NAME = 'x-csrf-token';

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return randomBytes(CSRFProtection.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Validate CSRF token against cookie
   */
  static validateToken(request: Request): boolean {
    const cookieToken = this.getCookieToken(request);
    const headerToken = this.getHeaderToken(request);

    if (!cookieToken || !headerToken) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(cookieToken, headerToken);
  }

  /**
   * Get CSRF token from cookie
   */
  private static getCookieToken(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies[CSRFProtection.COOKIE_NAME] || null;
  }

  /**
   * Get CSRF token from header
   */
  private static getHeaderToken(request: Request): string | null {
    return request.headers.get(CSRFProtection.HEADER_NAME);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Set CSRF token cookie
   */
  static setCookie(token: string): string {
    return `${CSRFProtection.COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`;
  }
}

// Input Validation Schemas
export const validationSchemas = {
  // User Input Validation
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,'&]+$/, 'Business name contains invalid characters'),

  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email address too long'),

  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long'),

  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address too long')
    .regex(/^[a-zA-Z0-9\s\-.,'#]+$/, 'Address contains invalid characters'),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'City contains invalid characters'),

  state: z.enum(['MN', 'WI'], 'State must be MN or WI'),

  zip: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),

  licenseNumber: z.string()
    .min(3, 'License number must be at least 3 characters')
    .max(50, 'License number too long')
    .regex(/^[a-zA-Z0-9\-]+$/, 'License number contains invalid characters'),

  // Document Validation
  documentTitle: z.string()
    .min(1, 'Document title is required')
    .max(200, 'Document title too long'),

  documentCategory: z.enum([
    'TAX', 'PERMIT', 'LIEN_WAIVER', 'INSURANCE', 'CONTRACT', 
    'CHANGE_ORDER', 'INVOICE', 'SAFETY', 'COMPLIANCE', 'PROPOSAL', 
    'CERTIFICATE', 'OTHER'
  ], 'Invalid document category'),

  // Project Validation
  projectName: z.string()
    .min(1, 'Project name is required')
    .max(200, 'Project name too long'),

  contractAmount: z.number()
    .min(0, 'Contract amount must be positive')
    .max(10000000, 'Contract amount seems too high'),

  // API Key Validation
  apiKeyName: z.string()
    .min(1, 'API key name is required')
    .max(100, 'API key name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'API key name contains invalid characters'),
};

// Security Headers
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://checkout.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Input Sanitization
export class InputSanitizer {
  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(input: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Sanitize SQL input (parameterized queries should be used instead)
   */
  static sanitizeSql(input: string): string {
    return input.replace(/['"\\;]/g, '');
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(input: string): string {
    return input
      .replace(/[^\w\-_.]/g, '')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  /**
   * Sanitize user input for display
   */
  static sanitizeForDisplay(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if request is allowed
   */
  static isAllowed(
    identifier: string, 
    limit: number, 
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < now) {
        this.requests.delete(key);
      }
    }

    const current = this.requests.get(identifier);
    
    if (!current || current.resetTime < now) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    if (current.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    
    return {
      allowed: true,
      remaining: limit - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Generate rate limit identifier from request
   */
  static getIdentifier(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create hash of IP + user agent for fingerprinting
    const identifier = `${ip}:${userAgent}`;
    return createHash('sha256').update(identifier).digest('hex');
  }
}

// Security Utilities
export class SecurityUtils {
  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Hash password securely
   */
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    const hash = createHash('sha256');
    hash.update(password + process.env.PASSWORD_SALT || 'default-salt');
    return hash.digest('hex');
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return this.generateSecureToken(64);
  }

  /**
   * Check if request is from a bot
   */
  static isBot(request: Request): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    fileName: string, 
    fileSize: number, 
    mimeType: string
  ): { valid: boolean; error?: string } {
    // File size limit (10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(mimeType)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // File name validation
    const sanitizedName = InputSanitizer.sanitizeFileName(fileName);
    if (sanitizedName !== fileName) {
      return { valid: false, error: 'Invalid file name' };
    }

    return { valid: true };
  }
}

// Middleware for CSRF protection
export function csrfProtectionMiddleware(request: Request): Response | null {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  // Skip CSRF for API endpoints that have their own auth
  if (request.url.includes('/api/webhooks/') || request.url.includes('/api/cron/')) {
    return null;
  }

  // Validate CSRF token
  if (!CSRFProtection.validateToken(request)) {
    return new Response(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}
