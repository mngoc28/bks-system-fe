import { Link } from "react-router-dom";
import { BreadcrumbProps } from "../type";

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  if (!items.length) return null;

  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link to={item.href} className="font-medium text-slate-600 transition-colors hover:text-sky-600">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-400" : "text-slate-500"}>{item.label}</span>
              )}
              {!isLast && <span aria-hidden="true" className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
