import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import type { AddUserFormData, UpdateUserProfileRequest, UserFilters, UserProfile } from "@/dataHelper/user.dataHelper";
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery, useResetPasswordMutation, useUpdateUserMutation } from "@/hooks/useUserQuery";
import { useUserStore } from "@/store/useUserStore";
import { Filter, UserPlus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AddUserDialog, DeleteConfirmDialog, EditUserDialog, ResetPasswordDialog, UserSearchSection, UsersEmptyState } from "./components";
import UserTable from "./components/UserTable";

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  type SortKey = "id" | "name" | "email" | "phone" | "role" | "status" | "created_at";
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
  const [searchQ, setSearchQ] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const currentUserEmail = useUserStore((state) => state.userEmail);

  // hook to clear highlight after 3s
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // hook to debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchQ, page: DEFAULT_PAGE }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQ]);

  // hook to debounce phone input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, phone: searchPhone, page: DEFAULT_PAGE }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchPhone]);

  // hook to debounce email input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, email: searchEmail, page: DEFAULT_PAGE }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchEmail]);

  // handle sort toggle
  const toggleSort = (key: SortKey) => {
    if (sortField === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(undefined);
        setSortDirection(undefined);
      }
    } else {
      setSortField(key);
      setSortDirection("asc");
    }
  };

  // filters state
  const [filters, setFilters] = useState<UserFilters>({
    q: "",
    email: "",
    role: "",
    phone: "",
    status: "",
    created_at_from: "",
    created_at_to: "",
    page: DEFAULT_PAGE,
    per_page: DEFAULT_LIMIT,
    sort_field: undefined,
    sort_direction: undefined,
  });

  const { data: apiData, isLoading } = useGetAllUsersQuery(filters);

  const page = filters.page ?? DEFAULT_PAGE;
  const perPage = filters.per_page ?? DEFAULT_LIMIT;

  // map api data to user profile
  const serverRows: UserProfile[] = React.useMemo(() => {
    const list: any[] = apiData?.data?.data ?? [];
    return list.map((item: any) => ({
      id: item.id ?? 0,
      email: item.email ?? "",
      name: item.name ?? "",
      role: item.role ?? "",
      phone: item.phone ?? "",
      status: item.status !== undefined && item.status !== null ? Number(item.status) : undefined,
      avatar: item.avatar ?? "",
      created_at: item.created_at ?? "",
      updated_at: item.updated_at ?? "",
    }));
  }, [apiData]);

  // filtered rows
  const filtered = useMemo(() => {
    return serverRows;
  }, [serverRows]);

  // update filters when sort changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      sort_field: sortField,
      sort_direction: sortDirection,
    }));
  }, [sortField, sortDirection]);

  // reset to first page when filters change
  useEffect(() => {
    setFilters((prev) => {
      if (prev.page === DEFAULT_PAGE) return prev;
      return { ...prev, page: DEFAULT_PAGE };
    });
  }, [filters.q, filters.email, filters.role, filters.phone, filters.status, filters.created_at_from, filters.created_at_to]);

  const totalItems = apiData?.data?.total ?? filtered.length;
  const totalPages = apiData?.data?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage));

  // handle reset filters
  const handleReset = () => {
    setSearchQ("");
    setSearchEmail("");
    setSearchPhone("");
    setFilters({ q: "", email: "", role: "", phone: "", status: "", created_at_from: "", created_at_to: "", page: DEFAULT_PAGE, per_page: DEFAULT_LIMIT, sort_field: undefined, sort_direction: undefined });
    setSortField(undefined);
    setSortDirection(undefined);
  };

  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteUserMutation();
  const deleteLoading = deleteMutation.isPending;

  // handle delete user
  const askDelete = (id: number) => {
    const target = serverRows.find((x) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserProfile | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();
  const resetPasswordLoading = resetPasswordMutation.isPending;

  // handle reset password
  const askResetPassword = (id: number) => {
    const target = serverRows.find((x) => x.id === id) || null;
    setResetPasswordTarget(target);
    setResetPasswordOpen(true);
  };

  // confirm reset password
  const confirmResetPassword = async (newPassword: string) => {
    if (!resetPasswordTarget) return;
    await resetPasswordMutation.mutateAsync({
      id: resetPasswordTarget.id,
      data: {
        new_password: newPassword,
        new_password_confirmation: newPassword
      }
    });
    setResetPasswordOpen(false);
    setResetPasswordTarget(null);
  };

  // Add User Dialog
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createUserMutation = useCreateUserMutation();
  const createUserLoading = createUserMutation.isPending;

  // Handle Add User
  const handleAddUser = async (data: AddUserFormData) => {
    setServerError(null);
    try {
      await createUserMutation.mutateAsync(data);
      setAddUserOpen(false);
    } catch (error: any) {
      // Handle email duplicate error from backend
      if (error?.response?.data?.errors?.email) {
        setServerError(error.response.data.errors.email[0]);
      } else if (error?.response?.data?.message) {
        setServerError(error.response.data.message);
      }
    }
  };

  // Edit User Dialog
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [editServerError, setEditServerError] = useState<string | null>(null);
  const updateUserMutation = useUpdateUserMutation();
  const updateUserLoading = updateUserMutation.isPending;

  const handleViewUser = (id: number) => {
    navigate(`${ROUTERS.USER_DETAIL}/${id}`);
  };

  const askEdit = (id: number) => {
    const target = serverRows.find((x) => x.id === id) || null;
    setEditTarget(target);
    setEditUserOpen(true);
  };

  // handle edit user
  const handleEditUser = async (data: UpdateUserProfileRequest) => {
    if (!editTarget) return;
    setEditServerError(null);
    try {
      await updateUserMutation.mutateAsync({
        id: editTarget.id,
        data: data,
      });
      setHighlightedId(editTarget.id);
      setEditUserOpen(false);
      setEditTarget(null);
    } catch (error: any) {
      // Handle email duplicate error from backend
      if (error?.response?.data?.errors?.email) {
        const emailError = error.response.data.errors.email;
        setEditServerError(Array.isArray(emailError) ? emailError[0] : String(emailError));
      } else if (error?.response?.data?.message) {
        setEditServerError(String(error.response.data.message));
      } else if (error?.message) {
        setEditServerError(String(error.message));
      } else {
        setEditServerError(t("user.update_user_failed"));
      }
    }
  };

  // Clear edit server error when dialog closes
  useEffect(() => {
    if (!editUserOpen) {
      setEditServerError(null);
    }
  }, [editUserOpen]);

  // Clear server error when dialog closes
  useEffect(() => {
    if (!addUserOpen) {
      setServerError(null);
    }
  }, [addUserOpen]);

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">{t("user.user_list")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700" onClick={() => setAddUserOpen(true)}>
            <UserPlus className="size-4" />
            {t("user.add_user")}
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-2 px-4 py-2" onClick={() => setOpen((v) => !v)}>
            <Filter className="size-4" />
            {t("user.filter_search")}
          </Button>
        </div>
      </div>

      <UserSearchSection
        open={open}
        searchQ={searchQ}
        setSearchQ={setSearchQ}
        searchEmail={searchEmail}
        setSearchEmail={setSearchEmail}
        searchPhone={searchPhone}
        setSearchPhone={setSearchPhone}
        filters={filters}
        setFilters={setFilters}
        onReset={handleReset}
        onClose={() => setOpen(false)}
      />

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.loading")}</div>
      ) : totalItems === 0 ? (
        <UsersEmptyState onOpenFilter={() => setOpen(true)} />
      ) : (
        <div className="flex flex-1 flex-col px-4">
          <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white">
            <UserTable
              users={filtered}
              currentUserEmail={currentUserEmail}
              highlightedId={highlightedId}
              onView={handleViewUser}
              onEdit={askEdit}
              onDelete={askDelete}
              onResetPassword={askResetPassword}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              onViewModal={setSelectedImage}
              selectedImage={selectedImage}
              filters={filters}
            />
          </div>
          {totalItems > 0 && (
            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                perPage={perPage}
                onPerPageChange={(pp) => {
                  setFilters((prev) => ({ ...prev, per_page: pp, page: DEFAULT_PAGE }));
                }}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      )}

      <DeleteConfirmDialog
        user={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
      <ResetPasswordDialog
        user={resetPasswordTarget}
        isOpen={resetPasswordOpen}
        isLoading={resetPasswordLoading}
        onClose={() => setResetPasswordOpen(false)}
        onConfirm={confirmResetPassword}
      />
      <AddUserDialog
        isOpen={addUserOpen}
        isLoading={createUserLoading}
        serverError={serverError}
        onClose={() => setAddUserOpen(false)}
        onSubmit={handleAddUser}
      />
      <EditUserDialog
        user={editTarget}
        isOpen={editUserOpen}
        isLoading={updateUserLoading}
        serverError={editServerError}
        onClose={() => setEditUserOpen(false)}
        onSubmit={handleEditUser}
      />
    </div>
  );
};

export default UserManagement;
