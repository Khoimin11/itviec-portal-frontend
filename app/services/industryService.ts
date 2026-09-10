import api from "~/api";

const industryService = {
  getAll: (params?: any): Promise<IResponse<Industry[]>> => {
    return api.get("/industry", { params });
  },
};

export default industryService;
