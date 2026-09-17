import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useModalStore } from "~/stores/modalStore";
import { schemaChangePassword } from "./schema";
import { useMutation } from "@tanstack/react-query";
import companyService from "~/services/companyService";
import { ApiError } from "~/api/client";
import { reportApiError } from "~/api/reportApiError";
import showToast from "~/utils/showToast";
import useValidation from "~/hooks/useValidation";
import Modal from "react-modal";
import { customStyles, ModalContainer, SettingsPassword } from "./styled";
import { X } from "feather-icons-react";
import InputFloating from "~/components/InputFloating";
import { useCallback } from "react";

const ChangePassword = () => {
  const { t } = useTranslation(["profile"]);
  const { modal, handleOpenModal, handleCloseModal } = useModalStore();

  const {
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
  } = useForm<IChangePassword>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schemaChangePassword(t)),
    mode: "onSubmit",
  });

  const closeModal = () => {
    if (changePasswordMutation.isPending) return;
    reset();
    handleCloseModal("change-password");
  };

  const changePasswordMutation = useMutation({
    mutationFn: (body: IChangePassword) => companyService.changePassword(body),
    onSuccess: ({ message }) => {
      showToast("success", String(message));
      reset();
      handleCloseModal("change-password");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const fields: (keyof IChangePassword)[] = ["currentPassword", "newPassword", "confirmPassword"];
        for (const field of fields) {
          const message = error.errors[field]?.[0];
          if (message) setError(field, { type: "server", message });
        }
      }
      reportApiError(error);
    },
  });

  const onSubmit: SubmitHandler<IChangePassword> = (data) => {
    if (!changePasswordMutation.isPending) changePasswordMutation.mutate(data);
  };

  const isValidCurrent = useValidation(watch("currentPassword"));
  const isValidNew = useValidation(watch("newPassword"));
  const isValidConfirm = useValidation(watch("confirmPassword"));

  return (
    <SettingsPassword>
      <button onClick={() => handleOpenModal("change-password")}>
        {t("Change Password")}
      </button>
      <Modal
        isOpen={modal["change-password"]}
        onRequestClose={closeModal}
        style={customStyles}
        ariaHideApp={false}>
        <ModalContainer onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-head">
            <h2>{t("Change Password")}</h2>
            <X onClick={closeModal} />
          </div>
          <div className="modal-body">
            <div className="form-group">
              <strong>{t("Note", { ns: "auth" })}:</strong>{" "}
              {t(
                "Password must be at least 12 characters, including at least 1 symbol (! @ # $ ...), 1 number, 1 UPPERCASE letter, 1 lowercase letter."
              )}
            </div>
            <div className="form-group">
              <InputFloating
                label={t("Current password")}
                type="password"
                name="currentPassword"
                required={false}
                value={watch("currentPassword")}
                error={
                  errors.currentPassword &&
                  t(errors.currentPassword.message + "")
                }
                className={
                  errors.currentPassword?.message ? "error" : isValidCurrent
                }
                onSetValue={useCallback(
                  (value: string) =>
                    setValue("currentPassword", value, {
                      shouldValidate: true,
                    }),
                  []
                )}
              />
            </div>
            <div className="form-group">
              <InputFloating
                label={t("New password")}
                type="password"
                name="newPassword"
                required={false}
                value={watch("newPassword")}
                error={errors.newPassword && t(errors.newPassword.message + "")}
                className={errors.newPassword?.message ? "error" : isValidNew}
                onSetValue={useCallback(
                  (value: string) =>
                    setValue("newPassword", value, { shouldValidate: true }),
                  []
                )}
              />
            </div>
            <div className="form-group">
              <InputFloating
                label={t("Re-enter new password")}
                type="password"
                name="confirmPassword"
                required={false}
                value={watch("confirmPassword")}
                error={
                  errors.confirmPassword &&
                  t(errors.confirmPassword.message + "")
                }
                className={
                  errors.confirmPassword?.message ? "error" : isValidConfirm
                }
                onSetValue={useCallback(
                  (value: string) =>
                    setValue("confirmPassword", value, {
                      shouldValidate: true,
                    }),
                  []
                )}
              />
            </div>
            <div className="modal-foot">
              <button type="submit" className="update" disabled={changePasswordMutation.isPending}>{t("Update")}</button>
              <button type="button" className="cancel" onClick={closeModal} disabled={changePasswordMutation.isPending}>
                {t("Cancel")}
              </button>
            </div>
          </div>
        </ModalContainer>
      </Modal>
    </SettingsPassword>
  );
};

export default ChangePassword;
