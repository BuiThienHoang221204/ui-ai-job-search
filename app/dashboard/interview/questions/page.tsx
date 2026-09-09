import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { QuestionBankBrowser } from "@/components/question-bank/question-bank-browser";
import { questionBankService } from "@/services/question-bank";

export const metadata: Metadata = {
  title: "Ngân hàng câu hỏi",
};

export default async function QuestionBankPage() {
  const [facets, initial] = await Promise.all([
    questionBankService.facets(),
    questionBankService.list({ limit: 20 }),
  ]);

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        subtitle={`${facets.total.toLocaleString("vi-VN")} câu hỏi phỏng vấn, lọc theo ngành nghề và loại câu hỏi`}
      />
      <QuestionBankBrowser facets={facets} initial={initial} />
    </>
  );
}
