import React from "react";

type FilterPortalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const FilterPortal: React.FC<FilterPortalProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return <>{children}</>;
};

export default FilterPortal;
