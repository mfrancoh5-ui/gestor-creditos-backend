// src/app/core/auth/auth.storage.ts
export type AuthUser = {
  id: number
  email: string
  nombres: string
  rol: 'ADMIN' | 'COBRADOR' | 'VIEWER'
  activo?: boolean
}

export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

const K_ACCESS = 'accessToken'
const K_REFRESH = 'refreshToken'
const K_USER = 'user'

export const AuthStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(K_ACCESS)
  },

  setTokens(tokens: AuthTokens) {
    localStorage.setItem(K_ACCESS, tokens.accessToken)
    if (tokens.refreshToken) localStorage.setItem(K_REFRESH, tokens.refreshToken)
  },

  setUser(user: AuthUser) {
    localStorage.setItem(K_USER, JSON.stringify(user))
  },

  clear() {
    localStorage.removeItem(K_ACCESS)
    localStorage.removeItem(K_REFRESH)
    localStorage.removeItem(K_USER)
  },
}
