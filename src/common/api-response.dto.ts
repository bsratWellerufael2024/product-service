export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: number;
    detail: string;
  };

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: { code: number; detail: string },
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
