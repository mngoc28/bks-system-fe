import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InlineSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
};

const InlineSheet: React.FC<InlineSheetProps> = ({
  open,
  title,
  onClose,
  children,
  footer,
  widthClassName = 'max-w-2xl',
}) => {
  useEffect(() => {
    if (!open) return;

    // Tính bề rộng scrollbar để bù trừ khi ẩn nó
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  if (!open) return null;

  const sheet = (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <section className={`size-full ${widthClassName} flex flex-col bg-white shadow-2xl duration-200 animate-in slide-in-from-right`}>
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X size={18} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

        {footer ? <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">{footer}</footer> : null}
      </section>
    </div>
  );

  return createPortal(sheet, document.body);
};

export default InlineSheet;
