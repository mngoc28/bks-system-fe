import React from 'react';

type PartnerSectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export const PartnerSectionCard: React.FC<PartnerSectionCardProps> = ({ children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5 ${className}`}>
    {children}
  </section>
);

type PartnerSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export const PartnerSectionHeader: React.FC<PartnerSectionHeaderProps> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

type HorizontalChipScrollerProps = {
  children: React.ReactNode;
  className?: string;
};

export const HorizontalChipScroller: React.FC<HorizontalChipScrollerProps> = ({
  children,
  className = '',
}) => (
  <div className={`-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
    <div className="flex w-max min-w-full gap-2 pb-1">{children}</div>
  </div>
);
