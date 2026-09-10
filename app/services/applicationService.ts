import api from "~/api";

export interface CreateApplicationPayload {
  slug: string;
  body: FormData;
}

const applicationService = {
  create: ({
    slug,
    body,
  }: CreateApplicationPayload): Promise<IResponse<Application>> => {
    return api.post(`/application/${slug}`, body);
  },
  delete: (id: number): Promise<IResponse<string>> => {
    return api.delete(`/application/${id}`);
  },
  getJobStatus: (params: {}): Promise<IResponse<MyJobStatusWithPagination>> => {
    return api.get(`/application/job-status`, { params });
  },
  changeStatus: (
    id: number,
    body: RequestChangeStatus
  ): Promise<IResponse<ApplicationStatus>> => {
    return api.patch(`/application/${id}/status`, body);
  },
};

export default applicationService;
