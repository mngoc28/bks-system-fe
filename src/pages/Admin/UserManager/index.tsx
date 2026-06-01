import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE, ROUTERS } from "@/constant";
import type { AddUserFormData, UpdateUserProfileRequest, UserFilters, UserProfile } from "@/dataHelper/user.dataHelper";
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery, useResetPasswordMutation, useUpdateUserMutation } from "@/hooks/useUserQuery";
import { useUserStore } from "@/store/useUserStore";
import { Filter, UserPlus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AddUserDialog, DeleteConfirmDialog, EditUserDialog, ResetPasswordDialog, UserSearchSection, UsersEmptyState, UserCard, UserTable } from "./components";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";
import { ViewMode } from "@/components/LayoutToggle";

/**
 * User Management Page
 * A centralized administrative panel for managing platform users, including staff and partners, with capabilities for role assignment, account status control, and password resets.
 */
const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState(searchParams.get("q") || "");
  const [searchEmail, setSearchEmail] = useState(searchParams.get("email") || "");
  const [searchPhone, setSearchPhone] = useState(searchParams.get("phone") || "");
  const currentUserEmail = useUserStore((state) => state.userEmail);
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("userManager_viewMode");
    return (savedMode as ViewMode) || "table"; // Default to table as requested
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("userManager_viewMode", mode);
  };

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

  // filters state
  const [filters, setFilters] = useState<UserFilters>({
    q: searchParams.get("q") || "",
    email: searchParams.get("email") || "",
    role: searchParams.get("role") || "",
    phone: searchParams.get("phone") || "",
    status: searchParams.get("status") || "",
    created_at_from: searchParams.get("created_at_from") || "",
    created_at_to: searchParams.get("created_at_to") || "",
    page: Number(searchParams.get("page") || DEFAULT_PAGE),
    per_page: Number(searchParams.get("per_page") || DEFAULT_CARD_LIMIT),
    sort_field: undefined,
    sort_direction: undefined,
  });

  useEffect(() => {
    if (searchParams.get("source") === "dashboard") {
      setOpen(true);
    }
  }, [searchParams]);

  const { data: apiData, isLoading } = useGetAllUsersQuery(filters);

  const page = filters.page ?? DEFAULT_PAGE;
  const perPage = filters.per_page ?? DEFAULT_CARD_LIMIT;

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
    setFilters({ q: "", email: "", role: "", phone: "", status: "", created_at_from: "", created_at_to: "", page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: undefined, sort_direction: undefined });
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
    <div className="flex w-full flex-col gap-8 p-[24px_32px]">
      <PageBar
        subtitle={t("user.user_list_subtitle") || "Quản lý danh sách thành viên và quyền hạn truy cập."}
        showLayoutToggle={true}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-primary"
              onClick={() => setOpen((v) => !v)}
            >
              <Filter className="size-4" />
              {t("common.filter")}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-primary font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-primary/25"
              onClick={() => setAddUserOpen(true)}
            >
              <UserPlus className="size-4" />
              {t("user.add_user")}
            </Button>
          </div>
        }
      />

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
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <UsersEmptyState onOpenFilter={() => setOpen(true)} />
      ) : (
        <div className="flex flex-col gap-8">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((user: UserProfile) => (
                <UserCard
                  key={user.id}
                  user={user}
                  highlightTerms={{
                    q: filters.q || "",
                    email: filters.email || "",
                    phone: filters.phone || "",
                  }}
                  isCurrentUser={user.email === currentUserEmail}
                  onView={handleViewUser}
                  onEdit={askEdit}
                  onDelete={askDelete}
                  onResetPassword={askResetPassword}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <UserTable
                    users={filtered}
                    currentUserEmail={currentUserEmail || ""}
                    onView={handleViewUser}
                    onEdit={askEdit}
                    onDelete={askDelete}
                    onResetPassword={askResetPassword}
                    sortField={filters.sort_field}
                    sortDirection={filters.sort_direction}
                    toggleSort={(field: string) => {
                        const isAsc = sortField === field && sortDirection === "asc";
                        setSortField(field);
                        setSortDirection(isAsc ? "desc" : "asc");
                    }}
                    onViewModal={setSelectedImage}
                    selectedImage={selectedImage}
                    filters={filters}
                    highlightedId={null}
                />
            </div>
          )}
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
                perPageOptions={[12, 24, 48]}
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
