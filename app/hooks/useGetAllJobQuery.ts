import { useQuery } from "@tanstack/react-query";
import companyService from "~/services/companyService";
import { useUserStore } from "~/stores/userStore";

export const useGetAllJobQuery = () => {
  const companyId = useUserStore((state) => state.user.id);
  return useQuery({
    queryKey: ["all-job", companyId],
    queryFn: () => companyService.getAllJob(),
    select: ({ data }) => data,
    enabled: Boolean(companyId),
    staleTime: 30_000,
  });
};
