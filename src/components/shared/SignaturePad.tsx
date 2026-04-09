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
      <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-crosshair group">
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
          className="w-full h-auto block"
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ký tại đây</p>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm border-slate-200 text-slate-400 hover:text-rose-600" onClick={clear}>
              <Eraser className="h-4 w-4" />
           </Button>
        </div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-tight px-1">
         <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Vẽ để ký trực tiếp</span>
         <span className={isEmpty ? "text-rose-400" : "text-emerald-500"}>
            {isEmpty ? "Chưa có chữ ký" : "Đã ghi nhận chữ ký"}
         </span>
      </div>
    </div>
  );
};

export default SignaturePad;
