import { ManageCVTable, ManageCVWrapper } from "./styled";
import { useTranslation } from "react-i18next";
import { ChevronDown, Edit, Eye, Play, Trash2 } from "feather-icons-react";
import { useGetAllCVQuery } from "~/hooks/useGetAllCVQuery";
import { useMemo, useState } from "react";
import { formatTime } from "~/utils/formatTime";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import FilterBox from "~/components/FilterBox";

const ManageCV = () => {
  const { t } = useTranslation(["apply"]);
  const [sortValue, setSortValue] = useState<string[]>([]);
  const [statusValue, setStatusValue] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const { data, isPending, isError, refetch } = useGetAllCVQuery();
  const CVApplications = useMemo(() => {
    const rows = (data ?? []).filter((item) => {
      const status = item.deletedAt ? "deleted" : new Date(item.jobEndDate).getTime() < Date.now() ? "expired" : item.status;
      return !statusValue.length || statusValue.includes(status);
    });
    return rows.sort((a, b) => {
      for (const sort of sortValue) {
        const [field, direction] = sort.split(":");
        const key = (field === "title" ? "jobTitle" : field) as "jobTitle" | "fullName" | "phoneNumber" | "createdAt" | "updatedAt";
        const result = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true });
        if (result) return direction === "DESC" ? -result : result;
      }
      return 0;
    });
  }, [data, sortValue, statusValue]);
  const handleGetValueSort = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const combinedValue = name + value;
    if (selectedValue === value) {
      setSelectedValue(null);
      setSortValue((prev) => prev.filter((item) => item !== combinedValue));
    } else {
      setSelectedValue(value);
      setSortValue((prev) => {
        const filtered = prev.filter((item) => !item.startsWith(name));
        if (selectedValue === value) return filtered;
        return [...filtered, combinedValue];
      });
    }
  };

  const handleGetValueStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStatusValue((prev) => {
      const exits = prev.find((item) => item === value);
      if (exits) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  return (
    <ManageCVWrapper>
      {isPending ? (
        <Skeleton style={{ minHeight: "8.76rem", marginBottom: "2rem" }} />
      ) : (
        <div className="heading">
          <h2>{t("Manage CV", { ns: "header" })}</h2>
        </div>
      )}
      {isPending ? (
        <Skeleton
          count={8}
          style={{ minHeight: "6.48rem", marginBottom: "1.6rem" }}
        />
      ) : (
        <ManageCVTable>
          <table>
            <thead>
              <tr>
                <th>{t("No.", { ns: "search" })}</th>
                <th style={{ width: "20%" }}>
                  <div className="space-between">
                    {t("Job title", { ns: "search" })}
                    <div className="ic-sort">
                      <label>
                        <input
                          type="checkbox"
                          name="title"
                          value=":ASC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("title:ASC")}
                        />
                        <Play fill="#414042" />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="title"
                          value=":DESC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("title:DESC")}
                        />
                        <Play fill="#414042" />
                      </label>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="space-between">
                    {t("Full name", { ns: "auth" })}
                    <div className="ic-sort">
                      <label>
                        <input
                          type="checkbox"
                          name="fullName"
                          value=":ASC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("fullName:ASC")}
                        />
                        <Play fill="#414042" />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="fullName"
                          value=":DESC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("fullName:DESC")}
                        />
                        <Play fill="#414042" />
                      </label>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="space-between">
                    {t("Phone number", { ns: "auth" })}
                    <div className="ic-sort">
                      <label>
                        <input
                          type="checkbox"
                          name="phoneNumber"
                          value=":ASC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("phoneNumber:ASC")}
                        />
                        <Play fill="#414042" />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="phoneNumber"
                          value=":DESC"
                          hidden
                          onChange={handleGetValueSort}
                          checked={sortValue.includes("phoneNumber:DESC")}
                        />
                        <Play fill="#414042" />
                      </label>
                    </div>
                  </div>
                </th>
                <th style={{ width: "20%" }}>
                  <div className="space-between">
                    {t("Time.label", { ns: "search" })}
                    <FilterBox>
                      <>
                        <div className="space-between space-top">
                          {t("Apply")}
                          <div className="ic-sort">
                            <label>
                              <input
                                type="checkbox"
                                name="createdAt"
                                value=":ASC"
                                hidden
                                onChange={handleGetValueSort}
                                checked={sortValue.includes("createdAt:ASC")}
                              />
                              <Play fill="#414042" />
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                name="createdAt"
                                value=":DESC"
                                hidden
                                onChange={handleGetValueSort}
                                checked={sortValue.includes("createdAt:DESC")}
                              />
                              <Play fill="#414042" />
                            </label>
                          </div>
                        </div>
                        <div className="space-between space-top">
                          {t("Updated at", { ns: "search" })}
                          <div className="ic-sort">
                            <label>
                              <input
                                type="checkbox"
                                name="updatedAt"
                                value=":ASC"
                                hidden
                                onChange={handleGetValueSort}
                                checked={sortValue.includes("updatedAt:ASC")}
                              />
                              <Play fill="#414042" />
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                name="updatedAt"
                                value=":DESC"
                                hidden
                                onChange={handleGetValueSort}
                                checked={sortValue.includes("updatedAt:DESC")}
                              />
                              <Play fill="#414042" />
                            </label>
                          </div>
                        </div>
                      </>
                    </FilterBox>
                  </div>
                </th>
                <th className="space-between">
                  {t("Status", { ns: "search" })}{" "}
                  <FilterBox>
                    <>
                      <label className="label" htmlFor="pending">
                        <input
                          type="checkbox"
                          id="pending"
                          name="status"
                          value="pending"
                          hidden
                          className="input"
                          onChange={handleGetValueStatus}
                          checked={statusValue.includes("pending")}
                        />
                        <span className="text">
                          {t("Pending", { ns: "profile" })}
                        </span>
                      </label>
                      <label className="label" htmlFor="accepted">
                        <input
                          type="checkbox"
                          id="accepted"
                          name="status"
                          value="accepted"
                          hidden
                          className="input"
                          onChange={handleGetValueStatus}
                          checked={statusValue.includes("accepted")}
                        />
                        <span className="text">
                          {t("Accepted", { ns: "profile" })}
                        </span>
                      </label>
                      <label className="label" htmlFor="reject">
                        <input
                          type="checkbox"
                          id="reject"
                          name="status"
                          value="reject"
                          hidden
                          className="input"
                          onChange={handleGetValueStatus}
                          checked={statusValue.includes("reject")}
                        />
                        <span className="text">
                          {t("Reject", { ns: "profile" })}
                        </span>
                      </label>
                      <label className="label" htmlFor="expired">
                        <input
                          type="checkbox"
                          id="expired"
                          name="status"
                          value="expired"
                          hidden
                          className="input"
                          onChange={handleGetValueStatus}
                          checked={statusValue.includes("expired")}
                        />
                        <span className="text">
                          {t("Expired", { ns: "profile" })}
                        </span>
                      </label>
                      <label className="label" htmlFor="deleted">
                        <input
                          type="checkbox"
                          id="deleted"
                          name="status"
                          value="deleted"
                          hidden
                          className="input"
                          onChange={handleGetValueStatus}
                          checked={statusValue.includes("deleted")}
                        />
                        <span className="text">
                          {t("Deleted", { ns: "search" })}
                        </span>
                      </label>
                    </>
                  </FilterBox>
                </th>
                <th>{t("Actions", { ns: "search" })}</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={7} style={{ textAlign: "center" }}>
                  {t("Unable to load CVs")} <button type="button" onClick={() => refetch()}>{t("Retry")}</button>
                </td></tr>
              ) : CVApplications.length > 0 ? (
                CVApplications.map((application, index) => (
                  <tr key={application.id}>
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      <p>{application.jobTitle}</p>
                    </td>
                    <td>
                      <p>{application.fullName}</p>
                    </td>
                    <td>
                      <p>{application.phoneNumber}</p>
                    </td>
                    <td style={{ width: "20%" }}>
                      <div className="time">
                        <div className="time-label">
                          <span className="col-5">{t("Apply")}:</span>
                          <span className="col-7 time-value">
                            {formatTime(application.createdAt + "")}
                            <ChevronDown
                              color="#121212"
                              style={{ marginLeft: "4px" }}
                            />
                          </span>
                        </div>
                        <div className="time-detail">
                          {application.deletedAt && (
                            <p>
                              <span className="col-5">
                                {t("Deleted at", { ns: "search" })}:
                              </span>
                              <span className="col-7 time-value">
                                {formatTime(application.deletedAt + "", true)}
                              </span>
                            </p>
                          )}
                          <p>
                            <span className="col-5">
                              {t("Updated at", { ns: "search" })}:
                            </span>
                            <span className="col-7 time-value">
                              {formatTime(application.updatedAt + "", true)}
                            </span>
                          </p>
                          <p>
                            <span className="col-5">{t("Apply")}:</span>
                            <span className="col-7 time-value">
                              {formatTime(application.createdAt + "", true)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {application.deletedAt ? (
                        <div className="status deleted">
                          {t("Deleted", { ns: "search" })}
                        </div>
                      ) : new Date(application.jobEndDate).getTime() <
                        Date.now() ? (
                        <div className="status expired">
                          {t("Expired", { ns: "profile" })}
                        </div>
                      ) : (
                        <div className={`status ${application.status}`}>
                          {t(
                            application.status === "pending"
                              ? "Pending"
                              : application.status === "accepted"
                              ? "Accepted"
                              : application.status === "reject"
                              ? "Reject"
                              : "",
                            { ns: "profile" }
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="icons">
                        <Eye color="#0ab305" aria-disabled="true" />
                        {application.status !== "accepted" &&
                          application.status !== "reject" && (
                            <Edit color="#ed1b2f" aria-disabled="true" />
                          )}
                        {!application.deletedAt && (
                          <Trash2 color="#414042" aria-disabled="true" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div style={{ textAlign: "center" }}>{t("No CV yet")}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ManageCVTable>
      )}
    </ManageCVWrapper>
  );
};

export default ManageCV;
