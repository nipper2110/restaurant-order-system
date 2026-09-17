import { useRef } from "react";
import { ImagePlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FoodImageUploadProps {
  previewUrl: string | null;
  error?: string;
  onFileSelect: (file: File) => void;
}

function FoodImageUpload({
  previewUrl,
  error,
  onFileSelect,
}: FoodImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 w-full">
      <h2 className="text-lg font-semibold text-white">Food Image</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/5"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Menu item preview"
            className="h-full w-full object-cover"
          />
        ) : null}

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-center transition-colors ${
            previewUrl
              ? "bg-black/50 opacity-0 hover:opacity-100"
              : "bg-transparent"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbbf24] text-black">
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-white">
            Upload food photo
          </span>
          <span className="text-xs text-white/50">JPG, PNG up to 5MB</span>
        </div>
      </button>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => inputRef.current?.click()}
        className="mt-4 w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
      >
        <ImagePlus className="h-4 w-4" />
        Choose Image
      </Button>
    </div>
  );
}

export default FoodImageUpload;
