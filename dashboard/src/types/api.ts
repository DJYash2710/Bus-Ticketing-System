export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiErrorBody {
  success: false
  message: string
}
