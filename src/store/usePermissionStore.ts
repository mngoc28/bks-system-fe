import { create } from "zustand";

type PermissionStore = {
  permissions: Set<string>;
  setPermissionStores: (perms: string[] | Set<string>) => void;
};

export const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: new Set(),
  setPermissionStores: (perms) =>
    set({
      permissions: perms instanceof Set ? perms : new Set(perms),
    }),
}));