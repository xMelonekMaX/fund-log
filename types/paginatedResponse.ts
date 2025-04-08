export interface IPaginatedResponse<T> {
  data: T;
  hasMore: boolean;
  total: number;
}
