import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '../types'

export function decodeAccessToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token)
}
