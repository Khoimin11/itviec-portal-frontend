import { useQuery } from "@tanstack/react-query";
import companyService from "~/services/companyService";

export const useCompanyQuery = (param: string | number, ownProfile = false) => {
  const { data, isPending, isSuccess, isError, error, refetch } = useQuery({
    queryKey: [ownProfile ? "company-profile" : "company", param],
    queryFn: () => ownProfile ? companyService.getProfile() : companyService.getDetail(param),
    select: ({ data }) => data as Company,
    enabled: !!param,
  });

  return { data, isPending, isSuccess, isError, error, refetch };
};
