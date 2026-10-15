import { documentsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";

export function useCvTemplates() {
  return useApiQuery(keys.cvTemplates(), () => documentsService.cvTemplates(), {
    errorMessage: "Không tải được danh sách mẫu",
    staleTime: Infinity,
  });
}
