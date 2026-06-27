/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:dev-api-config' {
  export const API_BASE_URL: string
  export const LAN_HOST: string
}
