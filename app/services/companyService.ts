import api from "~/api";

export interface CreateReviewPayload {
  id: number;
  body: Review;
}

export interface GetReviewsResonse {
  data: Review[];
  pagination: CursorPagination;
}

export interface GetCompanyJobsResonse {
  data: CompanyJob[];
  pagination: Pagination;
}

export interface GetAllCVResonse {
  data: CVApplication[];
  pagination: Pagination;
}
export interface GetAllReviewResonse {
  data: Review[];
  pagination: Pagination;
}

const companyService = {
  getProfile: (): Promise<IResponse<Company>> => api.get("/company/profile"),
  getDetail: (param: string | number): Promise<IResponse<Company>> => {
    return api.get(`/company/${param}`);
  },
  getAll: (params: any): Promise<IResponse<Company[]>> => {
    return api.get(`/company`, { params });
  },
  follow: (id: number): Promise<IResponse<boolean>> => {
    return api.post(`/company/follow/${id}`);
  },
  createReview: ({
    id,
    body,
  }: CreateReviewPayload): Promise<IResponse<Review>> => {
    return api.post(`/company/review/${id}`, body);
  },
  getReviews: (
    id: number,
    params: any
  ): Promise<IResponse<GetReviewsResonse>> => {
    return api.get(`/company/review/${id}`, { params });
  },
  getAllJob: (params: any): Promise<IResponse<GetCompanyJobsResonse>> => {
    return api.get(`/company/all-job`, { params });
  },
  getAllCV: (params: any): Promise<IResponse<GetAllCVResonse>> => {
    return api.get(`/company/all-cv`, { params });
  },
  getAllReview: (params: any): Promise<IResponse<GetAllReviewResonse>> => {
    return api.get(`/company/all-review`, { params });
  },
  deleteReview: (id: number): Promise<IResponse<string>> => {
    return api.delete(`/company/review/${id}`);
  },
  changeStatusReview: (
    id: number,
    status: ReviewStatus
  ): Promise<IResponse<string>> => {
    return api.patch(`/company/review/${id}/status`, { status });
  },
  dashboard: (): Promise<IResponse<CompanyDashboard>> => {
    return api.get(`/company/dashboard`);
  },
};

export default companyService;
