import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp } from "lucide-react";

const SCROLL_TRIGGER = 240;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  // Show or hide the button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_TRIGGER);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top smoothly when button is clicked
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-lg shadow-slate-300/70 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:bg-primary hover:text-white hover:shadow-xl pointer-events-auto"
      aria-label={t("public.scrollToTop", { defaultValue: "Scroll to top" })}
    >
      <ChevronUp className="size-6 transition group-hover:-translate-y-0.5" />
    </button>
  );
};

export default ScrollToTopButton;
