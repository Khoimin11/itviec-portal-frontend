import api from "~/api";

const applicantService = {
  getDetailByUser: (userId: number): Promise<IResponse<Applicant>> => {
    return api.get(`/applicant/${userId}`);
  },
  uploadCV: (body: FormData): Promise<IResponse<Applicant>> => {
    return api.post(`/applicant/upload/cv`, body);
  },
  updatePeronalInfomation: (
    body: ApplicantPersonal
  ): Promise<IResponse<User>> => {
    return api.patch(`/applicant/personal`, body);
  },
  updateGeneralInfomation: (
    body: ApplicantGeneral
  ): Promise<IResponse<ApplicantGeneral>> => {
    return api.patch(`/applicant/general`, body);
  },
  updateContactInfomation: (
    body: FormData
  ): Promise<IResponse<ApplicantContact>> => {
    return api.patch(`/applicant/contact`, body);
  },
  updateCoverLetter: (coverLetter: string): Promise<IResponse<string>> => {
    return api.patch(`/applicant/cover-letter`, { coverLetter });
  },
  updateAboutMe: (aboutMe: string): Promise<IResponse<string>> => {
    return api.patch(`/applicant/about-me`, { aboutMe });
  },
  getEducations: (): Promise<IResponse<ApplicantEducation[]>> => {
    return api.get(`/applicant/educations`);
  },
  createEducation: (
    body: ApplicantEducation
  ): Promise<IResponse<ApplicantEducation>> => {
    return api.post(`/applicant/education`, body);
  },
  updateEducation: (
    id: number,
    body: ApplicantEducation
  ): Promise<IResponse<ApplicantEducation>> => {
    return api.put(`/applicant/education/${id}`, body);
  },
  deleteEducation: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/education/${id}`);
  },
  getExperiences: (): Promise<IResponse<ApplicantExperience[]>> => {
    return api.get(`/applicant/experiences`);
  },
  createExperience: (
    body: ApplicantExperience
  ): Promise<IResponse<ApplicantExperience>> => {
    return api.post(`/applicant/experience`, body);
  },
  updateExperience: (
    id: number,
    body: ApplicantExperience
  ): Promise<IResponse<ApplicantExperience>> => {
    return api.put(`/applicant/experience/${id}`, body);
  },
  deleteExperience: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/experience/${id}`);
  },
  getProjects: (): Promise<IResponse<ApplicantProject[]>> => {
    return api.get(`/applicant/projects`);
  },
  createProject: (
    body: ApplicantProject
  ): Promise<IResponse<ApplicantProject>> => {
    return api.post(`/applicant/project`, body);
  },
  updateProject: (
    id: number,
    body: ApplicantProject
  ): Promise<IResponse<ApplicantProject>> => {
    return api.put(`/applicant/project/${id}`, body);
  },
  deleteProject: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/project/${id}`);
  },
  getCertificates: (): Promise<IResponse<ApplicantCertificate[]>> => {
    return api.get(`/applicant/certificates`);
  },
  createCertificate: (
    body: ApplicantCertificate
  ): Promise<IResponse<ApplicantCertificate>> => {
    return api.post(`/applicant/certificate`, body);
  },
  updateCertificate: (
    id: number,
    body: ApplicantCertificate
  ): Promise<IResponse<ApplicantCertificate>> => {
    return api.put(`/applicant/certificate/${id}`, body);
  },
  deleteCertificate: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/certificate/${id}`);
  },
  getAwards: (): Promise<IResponse<ApplicantAward[]>> => {
    return api.get(`/applicant/awards`);
  },
  createAward: (body: ApplicantAward): Promise<IResponse<ApplicantAward>> => {
    return api.post(`/applicant/award`, body);
  },
  updateAward: (
    id: number,
    body: ApplicantAward
  ): Promise<IResponse<ApplicantAward>> => {
    return api.put(`/applicant/award/${id}`, body);
  },
  deleteAward: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/award/${id}`);
  },
  createSkills: ({
    skills,
  }: {
    skills: ApplicantSkill[];
  }): Promise<IResponse<ApplicantSkill[]>> => {
    return api.post(`/applicant/skills`, { skills });
  },
  getSkills: (): Promise<IResponse<ApplicantSkill[]>> => {
    return api.get(`/applicant/skills`);
  },
  deleteSkill: (id: number): Promise<IResponse<number>> => {
    return api.delete(`/applicant/skill/${id}`);
  },
  getSavedJobs: (params: {}): Promise<IResponse<MyJob[]>> => {
    return api.get(`/applicant/saved-jobs`, { params });
  },
  getRecentViewedJobs: (params: {}): Promise<
    IResponse<MyJobWithPagination>
  > => {
    return api.get(`/applicant/resent-viewed-jobs`, { params });
  },
  getAppliedJobs: (params: {}): Promise<IResponse<MyJobWithPagination>> => {
    return api.get(`/applicant/applied-jobs`, { params });
  },
};

export default applicantService;
