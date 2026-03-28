import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const useDownLoadPdf = () => {
  const handleDownloadPdf = async (ref: React.RefObject<HTMLDivElement>) => {
    const element = ref.current;

    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("document.pdf");
  };

  return { handleDownloadPdf };
};

export default useDownLoadPdf;
