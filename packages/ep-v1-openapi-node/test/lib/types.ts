export interface ApiMeta {
  pagination: {
    pageNumber: number;
    count: number;
    pageSize: number;
    nextPage: number | null;
    totalPages: number;
  }
}