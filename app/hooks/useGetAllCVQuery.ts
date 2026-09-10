import { keepPreviousData, useQuery } from "@tanstack/react-query";
import companyService, {
  type GetAllCVResonse,
} from "~/services/companyService";

export const useGetAllCVQuery = (params: any) => {
  const { data, isPending, isSuccess } = useQuery({
    queryKey: ["all-cv", params],
    queryFn: () => companyService.getAllCV(params),
    select: ({ data }) => data as GetAllCVResonse,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });

  return { data, isPending, isSuccess };
};
