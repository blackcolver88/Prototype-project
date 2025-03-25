import { FormSubmission } from "./FormSubmission";

export interface PaginatedSubmissionsResponse {
    data: FormSubmission[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }