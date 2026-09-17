import { useParams } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { ApiError } from "~/api/client";
import Breadcrumb from "~/components/Breadcrumb";
import { useCompanyQuery } from "~/hooks/useCompanyQuery";
import Employer from "./Employer";
import Overview from "./Overview";
import JobListing from "./JobListing";
import { CompanyDetailWrapper, CompanyInfoContainer, CompanyInfoMain, Tabs } from "./styled";

const CompanyDetail = () => {
  const { slug = "" } = useParams();
  const { t } = useTranslation(["search"]);
  const [showReviews, setShowReviews] = useState(false);
  const { data: company, isPending, isError, error, refetch } = useCompanyQuery(slug);

  if (isError) {
    return (
      <CompanyDetailWrapper>
        <CompanyInfoContainer>
          <div role="alert">
            <p>{error instanceof ApiError && error.status === 404
              ? "Không tìm thấy công ty."
              : "Không tải được thông tin công ty."}</p>
            <button type="button" onClick={() => refetch()}>Thử lại</button>
          </div>
        </CompanyInfoContainer>
      </CompanyDetailWrapper>
    );
  }

  return (
    <CompanyDetailWrapper>
      {company ? <Employer key={company.id} data={company} jobs={company.jobs} /> : <Skeleton height={224} />}
      <CompanyInfoContainer>
        <CompanyInfoMain>
          {company ? (
            <>
              <Tabs>
                <ul>
                  <li><span className={!showReviews ? "active" : ""} onClick={() => setShowReviews(false)}>{t("Overview")}</span></li>
                  <li><span className={showReviews ? "active" : ""} onClick={() => setShowReviews(true)}>{t("Reviews")}</span></li>
                </ul>
              </Tabs>
              {showReviews
                ? <p>Tính năng đánh giá công ty chưa được triển khai.</p>
                : <Overview company={company} />}
            </>
          ) : (
            <><Skeleton height={72} /><Skeleton height={227.8} /></>
          )}
        </CompanyInfoMain>
        <JobListing jobs={company?.jobs ?? []} isPending={isPending} />
      </CompanyInfoContainer>
      <Breadcrumb
        primaryLinkLabel={t("For Employers", { ns: "header" })}
        primaryLinkUrl="/employer"
        secondaryLinkLabel={company?.companyName ?? ""}
        secondaryLinkUrl={company ? "/company/" + company.slug : ""}
      />
    </CompanyDetailWrapper>
  );
};

export default CompanyDetail;
