import { useQuery } from "@tanstack/react-query";
import companyService from "~/services/companyService";
import { useUserStore } from "~/stores/userStore";

export const useGetAllCVQuery = () => {
  const companyId = useUserStore((state) => state.user.id);
  return useQuery({
    queryKey: ["all-cv", companyId],
    queryFn: () => companyService.getAllCV(),
    select: ({ data }) => data,
    enabled: Boolean(companyId),
    staleTime: 30_000,
  });
};
