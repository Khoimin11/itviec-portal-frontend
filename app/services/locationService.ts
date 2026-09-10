import api from "~/api";

interface Province {
  code: number;
  name: string;
}

export interface ProvincesPayload {
  data: Province[];
}

const locationService = {
  getProvinces: (params: { name?: string }): Promise<IResponse<ProvincesPayload>> => {
    return api.get("/provinces", {
      params,
    });
  },
};

export default locationService;
