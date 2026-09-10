import api from "~/api";

export interface JobsPayload {
  pagination: Pagination;
  data: Job[];
}

const jobService = {
  getAll: (params: {}): Promise<IResponse<JobsPayload>> => {
    return api.get("/job", {
      params,
    });
  },
  getDetail: (slug: string): Promise<IResponse<Job>> => {
    return api.get(`/job/${slug}`);
  },

  getQuantity: (): Promise<IResponse<number>> => {
    return api.get("/job/quantity");
  },

  getByCompany: (param: string | number): Promise<IResponse<Job[]>> => {
    return api.get(`/job/company/${param}`);
  },

  wishlist: (jobId: number): Promise<IResponse<boolean>> => {
    return api.post(`/job/wishlist/${jobId}`);
  },

  create: (body: CompanyJob): Promise<IResponse<CompanyJob>> => {
    return api.post(`/job`, body);
  },

  update: (id: number, body: CompanyJob): Promise<IResponse<CompanyJob>> => {
    return api.put(`/job/${id}`, body);
  },
  delete: (id: number): Promise<IResponse<string>> => {
    return api.delete(`/job/${id}`);
  },
};

export default jobService;
