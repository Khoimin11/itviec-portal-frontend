import api from "~/api";

interface SkillsPayload {
  id: string;
  name: string;
}

interface CompaniesPayload extends SkillsPayload {
  slug: string;
}

export interface SearchByKeywordResponse {
  skills: SkillsPayload[];
  companies: CompaniesPayload[];
}
const mainService = {
  searchByKeyword: (
    keyword: string
  ): Promise<IResponse<SearchByKeywordResponse>> => {
    return api.post("/search", undefined, { params: { keyword } });
  },
};

export default mainService;
