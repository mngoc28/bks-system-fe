import React, { useRef, useState, useEffect } from "react";
import { Eraser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, width = 400, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#0f172a"; // slate-900
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in event) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = (event as MouseEvent).clientX - rect.left;
      y = (event as MouseEvent).clientY - rect.top;
    }

    return { x: x * (canvas.width / rect.width), y: y * (canvas.height / rect.height) };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setIsEmpty(false);
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (!isEmpty) {
      onSave(canvasRef.current?.toDataURL() || "");
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSave("");
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="group relative cursor-crosshair overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="block h-auto w-full"
        />
        
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Ký tại đây</p>
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
           <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-200 bg-white text-slate-400 shadow-sm hover:text-rose-600" onClick={clear}>
              <Eraser className="size-4" />
           </Button>
        </div>
      </div>
      <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-tight text-slate-400">
         <span className="flex items-center gap-1"><RotateCcw className="size-3" /> Vẽ để ký trực tiếp</span>
         <span className={isEmpty ? "text-rose-400" : "text-emerald-500"}>
            {isEmpty ? "Chưa có chữ ký" : "Đã ghi nhận chữ ký"}
         </span>
      </div>
    </div>
  );
};

export default SignaturePad;
