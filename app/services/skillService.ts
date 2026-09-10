import api from "~/api";

const skillService = {
  getAll: (params?: any): Promise<IResponse<Skill[]>> => {
    return api.get("/skill", { params });
  },
};

export default skillService;
