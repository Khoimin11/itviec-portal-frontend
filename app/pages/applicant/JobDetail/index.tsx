import { ApiError } from "~/api/client";
import { JobDetailContainer, JobDetailWrapper } from "./styled";
import { useEffect } from "react";
import JobEmployer from "./JobEmployer";
import JobInfo from "./JobInfo";
import Breadcrumb from "~/components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useJobStore } from "~/stores/jobStore";
import Loading from "~/components/Loading";
import { useJobQuery } from "~/hooks/useJobQuery";

const JobDetail = () => {
  const { t } = useTranslation(["search"]);
  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  const { slug } = useParams();
  const { handleSaveJobDetail } = useJobStore();
  const { data, isPending, isSuccess, isError, error, refetch } = useJobQuery(slug + "");

  useEffect(() => {
    if (isSuccess) {
      handleSaveJobDetail(data as Job);
    }
  }, [data, isSuccess]);

  if (isPending) return <Loading />;
  if (isError || !data) return <JobDetailWrapper><JobDetailContainer><div role="alert"><p>{error instanceof ApiError && error.status === 404 ? "Không tìm thấy việc làm." : "Không tải được thông tin việc làm."}</p><button type="button" onClick={() => refetch()}>Thử lại</button></div></JobDetailContainer></JobDetailWrapper>;

  return (
    <JobDetailWrapper>
      <JobDetailContainer>
        <JobInfo jobDetail={data} />
        <JobEmployer jobDetail={data} />
      </JobDetailContainer>
      <Breadcrumb
        primaryLinkLabel={t("All IT jobs")}
        primaryLinkUrl="/it-jobs"
        secondaryLinkLabel={data.title}
        secondaryLinkUrl={"/job/" + data.slug}
      />
    </JobDetailWrapper>
  );
};

export default JobDetail;
