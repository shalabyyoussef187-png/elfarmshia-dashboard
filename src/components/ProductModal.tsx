import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  X, ChevronDown, Upload, Trash2, Check, Search, Star, Tag, Package,
  Crop as CropIcon, ImagePlus, FileText, AlertTriangle, Info, BookOpen,
} from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ─── Image Crop Tool ────────────────────────────────────────────────
type AspectRatio = "1:1" | "4:3" | "16:9" | "free";
const RATIOS: { label: string; value: AspectRatio; aspect?: number }[] = [
  { label: "1:1",  value: "1:1",  aspect: 1 },
  { label: "4:3",  value: "4:3",  aspect: 4 / 3 },
  { label: "16:9", value: "16:9", aspect: 16 / 9 },
  { label: "حر",   value: "free", aspect: undefined },
];

function centerAspectCrop(w: number, h: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h), w, h);
}

function ImageCropTool({ src, onCrop, onCancel }: { src: string; onCrop: (file: File, url: string) => void; onCancel: () => void }) {
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const currentRatio = RATIOS.find(r => r.value === ratio)!;

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (currentRatio.aspect) setCrop(centerAspectCrop(width, height, currentRatio.aspect));
  }

  useEffect(() => {
    if (imgRef.current && currentRatio.aspect) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, currentRatio.aspect));
    }
  }, [currentRatio.aspect]);

  const applyCrop = () => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width  = completedCrop.width  * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) return;
      onCrop(new File([blob], "cropped.jpg", { type: "image/jpeg" }), URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, width: "100%", maxWidth: 500, boxShadow: "0 25px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CropIcon size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>تعديل وقص الصورة</span>
          </div>
          <button type="button" onClick={onCancel} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {RATIOS.map(r => (
            <button key={r.value} type="button" onClick={() => setRatio(r.value)} style={{ flex: 1, padding: "5px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: ratio === r.value ? "1.5px solid var(--primary)" : "1.5px solid #e5e7eb", background: ratio === r.value ? "rgba(34,197,94,0.08)" : "#f9fafb", color: ratio === r.value ? "var(--primary)" : "#6b7280", transition: "all 0.15s" }}>
              {r.label}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", maxHeight: "55vh", overflow: "auto", borderRadius: 12, background: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)} aspect={currentRatio.aspect}>
            <img ref={imgRef} src={src} alt="crop" onLoad={onImageLoad} crossOrigin="anonymous" style={{ maxHeight: "55vh", maxWidth: "100%", objectFit: "contain" }} />
          </ReactCrop>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>إلغاء</button>
          <button type="button" onClick={applyCrop} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "var(--primary)", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} /> تطبيق القص
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Interfaces ────────────────────────────────────────────────────
interface Category { _id: string; name: string; }
interface Brand    { _id: string; name: string; }

export interface ProductForm {
  name: string;
  price: string;
  description: string;
  features: string;
  usageInstructions: string;
  warnings: string;
  productInfo: string;
  category: string;
  brand: string;
  isOffer: boolean;
  offerDiscountPercent: string;
  offerDiscountAmount: string;
  isBestSeller: boolean;
  isAvailable: boolean;
  quantity: string;
}

type Phase = "closed" | "open" | "closing";

const overlayStyle: Record<Phase, CSSProperties> = {
  closed:  { backgroundColor: "rgba(0,0,0,0)",    pointerEvents: "none", transition: "background-color 260ms cubic-bezier(0.4,0,0.2,1)" },
  open:    { backgroundColor: "rgba(0,0,0,0.42)", pointerEvents: "all",  transition: "background-color 260ms cubic-bezier(0.4,0,0.2,1)" },
  closing: { backgroundColor: "rgba(0,0,0,0)",    pointerEvents: "none", transition: "background-color 210ms cubic-bezier(0.4,0,1,1)" },
};
const modalStyle: Record<Phase, CSSProperties> = {
  closed:  { opacity: 0, transform: "scale(0.93) translateY(10px)", transition: "opacity 260ms cubic-bezier(0.4,0,0.2,1), transform 260ms cubic-bezier(0.34,1.56,0.64,1)" },
  open:    { opacity: 1, transform: "scale(1) translateY(0)",       transition: "opacity 260ms cubic-bezier(0.4,0,0.2,1), transform 260ms cubic-bezier(0.34,1.56,0.64,1)" },
  closing: { opacity: 0, transform: "scale(0.95) translateY(6px)",  transition: "opacity 210ms cubic-bezier(0.4,0,1,1), transform 210ms cubic-bezier(0.4,0,1,1)" },
};

// ─── Toggle Switch ──────────────────────────────────────────────────
function Toggle({ checked, onChange, color = "green" }: { checked: boolean; onChange: () => void; color?: "green" | "amber" }) {
  const bg = checked ? (color === "amber" ? "#f59e0b" : "#22c55e") : "#e5e7eb";
  return (
    <button type="button" onClick={onChange} role="switch" aria-checked={checked}
      className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
      style={{ backgroundColor: bg }}>
      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200" style={{ [checked ? "right" : "left"]: "2px" }} />
    </button>
  );
}

// ─── Portal Dropdown ────────────────────────────────────────────────
interface DropdownProps { label: string; value: string; options: { _id: string; name: string }[]; onChange: (val: string) => void; placeholder: string; }

function CustomDropdown({ label, value, options, onChange, placeholder }: DropdownProps) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const [rect, setRect]       = useState<DOMRect | null>(null);
  const triggerRef            = useRef<HTMLButtonElement>(null);
  const panelRef              = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);
  const filtered              = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const openDropdown          = () => { if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect()); setSearch(""); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { const t = e.target as Node; if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 60); }, [open]);

  useEffect(() => {
    if (!open) return;
    const upd = () => { if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect()); };
    window.addEventListener("resize", upd);
    window.addEventListener("scroll", upd, true);
    return () => { window.removeEventListener("resize", upd); window.removeEventListener("scroll", upd, true); };
  }, [open]);

  const estH    = Math.min(filtered.length * 44 + (options.length > 6 ? 60 : 0) + 12, 260);
  const spaceB  = rect ? window.innerHeight - rect.bottom - 8 : 999;
  const openUp  = rect ? spaceB < estH && rect.top > estH : false;
  const panelSt: CSSProperties = rect ? { position: "fixed", left: rect.left, width: rect.width, zIndex: 9999, ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }) } : {};

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 px-0.5">{label}</label>
      <button ref={triggerRef} type="button" onClick={openDropdown}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm bg-white transition-all duration-150 cursor-pointer ${open ? "border-green-400 ring-2 ring-green-100 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
        <span className={value ? "text-gray-800 font-medium" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && rect && createPortal(
        <div ref={panelRef} style={{ ...panelSt, animation: "ddIn 140ms cubic-bezier(0.34,1.4,0.64,1)" }} className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {options.length > 6 && (
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-50 transition-all">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث..." className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400" />
                {search && <button type="button" onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500 transition-colors"><X size={11} /></button>}
              </div>
            </div>
          )}
          <ul className="overflow-y-auto py-1.5" style={{ maxHeight: "210px", scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
            <li>
              <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }} className="w-full text-right px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2">
                <span className="text-xs">{placeholder}</span>
                {!value && <Check size={12} className="text-green-500 shrink-0" />}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="text-center py-5 text-xs text-gray-400">لا توجد نتائج</li>
            ) : filtered.map(opt => (
              <li key={opt._id}>
                <button type="button" onClick={() => { onChange(opt.name); setOpen(false); setSearch(""); }}
                  className={`w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${value === opt.name ? "bg-green-50 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                  <span>{opt.name}</span>
                  {value === opt.name && <Check size={13} className="text-green-500 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
          <style>{`
            @keyframes ddIn { from { opacity:0; transform: translateY(${openUp ? "6px" : "-6px"}) scale(0.97) } to { opacity:1; transform: translateY(0) scale(1) } }
            ul::-webkit-scrollbar { width: 4px } ul::-webkit-scrollbar-track { background: transparent }
            ul::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px } ul::-webkit-scrollbar-thumb:hover { background: #9ca3af }
          `}</style>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── Single Image Slot ──────────────────────────────────────────────
interface ImageSlotProps {
  slot: 1 | 2 | 3;
  label: string;
  currentUrl?: string;
  onFileSelected: (file: File, url: string) => void;
  onRemoveNew: () => void;
  onDeleteServer: (() => void) | null;
  newPreview: string | null;
}

function ImageSlot({ slot, label, currentUrl, onFileSelected, onRemoveNew, onDeleteServer, newPreview }: ImageSlotProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayUrl = newPreview || currentUrl || null;
  const isNew      = !!newPreview;
  const hasServer  = !!currentUrl && !isNew;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    if (fileRef.current) fileRef.current.value = "";
  };

  const slotColors: Record<number, string> = { 1: "var(--primary)", 2: "#6366f1", 3: "#f59e0b" };
  const color = slotColors[slot] || "var(--primary)";

  return (
    <>
      {cropSrc && createPortal(
        <ImageCropTool src={cropSrc} onCrop={(file, url) => { onFileSelected(file, url); setCropSrc(null); }} onCancel={() => setCropSrc(null)} />,
        document.body,
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: color, opacity: 0.85 }} />
          <label className="text-xs font-semibold text-gray-600">{label}</label>
          {slot !== 1 && <span className="text-[10px] text-gray-400 font-normal">(اختياري)</span>}
        </div>

        {displayUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 group bg-gray-50" style={{ aspectRatio: "4/3" }}>
            <img src={displayUrl} alt={label} className="w-full h-full object-cover" />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => setCropSrc(displayUrl)} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/95 text-gray-700 cursor-pointer shadow-md font-bold hover:bg-white transition-colors">
                <CropIcon size={11} /> تعديل
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/95 text-gray-700 cursor-pointer shadow-md font-bold hover:bg-white transition-colors">
                <Upload size={11} /> تغيير
              </button>
            </div>

            {/* Top-left badge */}
            <div className="absolute top-1.5 right-1.5 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md" style={{ background: color, opacity: 0.9 }}>
              {isNew ? "جديدة" : "محفوظة"}
            </div>

            {/* Delete button */}
            <button type="button"
              onClick={isNew ? onRemoveNew : (hasServer && onDeleteServer ? onDeleteServer : undefined)}
              className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm">
              <Trash2 size={10} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-green-50"
            style={{ aspectRatio: "4/3" }}>
            <ImagePlus size={18} />
            <span className="text-[10px] font-medium">رفع صورة</span>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </>
  );
}

// ─── Section Header ─────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-700 leading-none">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Textarea Field ──────────────────────────────────────────────────
function TextareaField({ label, placeholder, value, onChange, rows = 2 }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 px-0.5">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all hover:border-gray-300 resize-none leading-relaxed"
      />
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────
type ProductModalProps = {
  isEditing: boolean;
  form: ProductForm;
  categories: Category[];
  brands: Brand[];
  onChange: (form: ProductForm) => void;
  onSave: () => void;
  onClose: () => void;
  currentImageUrl?: string;
  currentImageUrl2?: string;
  currentImageUrl3?: string;
  onImageChange: (file: File | null) => void;
  onImageChange2: (file: File | null) => void;
  onImageChange3: (file: File | null) => void;
  onDeleteImage: (slot: 1 | 2 | 3) => void;
};

export default function ProductModal({
  isEditing, form, categories, brands, onChange, onSave, onClose,
  currentImageUrl, currentImageUrl2, currentImageUrl3,
  onImageChange, onImageChange2, onImageChange3, onDeleteImage,
}: ProductModalProps) {
  const [phase, setPhase]         = useState<Phase>("closed");
  const [preview1, setPreview1]   = useState<string | null>(null);
  const [preview2, setPreview2]   = useState<string | null>(null);
  const [preview3, setPreview3]   = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    if (phase === "closing") return;
    setPhase("closing");
    setTimeout(onClose, 220);
  };

  const save = () => {
    if (!form.name.trim() || !form.price) return;
    onSave();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4" style={overlayStyle[phase]}
      onClick={e => { if (e.target === e.currentTarget) close(); }} role="presentation">

      <div className="bg-white rounded-2xl w-full shadow-2xl flex flex-col max-h-[94vh]"
        style={{
          ...modalStyle[phase],
          willChange: "transform, opacity",
          maxWidth: "min(900px, 100%)",
        }}
        onClick={e => e.stopPropagation()}>

        {/* ── Sticky Header ── */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-light, #f0fdf4)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <Package size={15} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 leading-none">{isEditing ? "تعديل منتج" : "إضافة منتج"}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">جميع الحقول المُعلَّمة بـ * مطلوبة</p>
            </div>
          </div>
          <button type="button" onClick={close} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
          {/* Two-column layout on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-px md:divide-x md:divide-x-reverse md:divide-gray-100">

            {/* ════════ LEFT COLUMN ════════ */}
            <div className="flex flex-col gap-5 p-5">

              {/* ── Basic Info ── */}
              <div className="flex flex-col gap-3">
                <SectionHeader icon={<FileText size={13} className="text-gray-500" />} title="المعلومات الأساسية" subtitle="الاسم والسعر والكمية" />

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 px-0.5">اسم المنتج <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="مثال: بنادول 500mg"
                    value={form.name}
                    onChange={e => onChange({ ...form, name: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && save()}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all hover:border-gray-300" />
                </div>

                {/* Price + Quantity side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 px-0.5">السعر (ج.م) <span className="text-red-400">*</span></label>
                    <input type="number" min={0} step="any" placeholder="0"
                      value={form.price ?? ""}
                      onChange={e => onChange({ ...form, price: e.target.value })}
                      className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all hover:border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 px-0.5">الكمية في المخزن</label>
                    <input type="number" min={0} step={1} placeholder="0"
                      value={form.quantity}
                      onChange={e => onChange({ ...form, quantity: e.target.value })}
                      onBlur={e => { const v = e.target.value; if (v !== "") onChange({ ...form, quantity: String(Math.floor(Number(v))) }); }}
                      className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all hover:border-gray-300" />
                  </div>
                </div>

                {/* Category + Brand side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <CustomDropdown label="الفئة" placeholder="اختر الفئة" value={form.category} options={categories} onChange={val => onChange({ ...form, category: val })} />
                  <CustomDropdown label="الماركة" placeholder="اختر الماركة" value={form.brand} options={brands} onChange={val => onChange({ ...form, brand: val })} />
                </div>
              </div>

              {/* ── Description & Extra Info ── */}
              <div className="flex flex-col gap-3">
                <SectionHeader icon={<Info size={13} className="text-blue-500" />} title="الوصف والمعلومات" subtitle="اختياري — تظهر في صفحة المنتج" />
                <TextareaField label="الوصف" placeholder="وصف مختصر للمنتج..." value={form.description} onChange={v => onChange({ ...form, description: v })} rows={2} />
                <TextareaField label="المميزات" placeholder="مثال: فعّال خلال 30 دقيقة..." value={form.features} onChange={v => onChange({ ...form, features: v })} rows={2} />
                <TextareaField label="معلومات المنتج" placeholder="مثال: يحتوي على باراسيتامول 500mg..." value={form.productInfo} onChange={v => onChange({ ...form, productInfo: v })} rows={2} />
              </div>

              {/* ── Usage & Warnings ── */}
              <div className="flex flex-col gap-3">
                <SectionHeader icon={<AlertTriangle size={13} className="text-amber-500" />} title="التعليمات والتحذيرات" subtitle="اختياري" />
                <TextareaField label="طريقة الاستخدام" placeholder="مثال: قرصين كل 6 ساعات..." value={form.usageInstructions} onChange={v => onChange({ ...form, usageInstructions: v })} rows={2} />
                <TextareaField label="التحذيرات" placeholder="مثال: لا يُعطى للأطفال أقل من 12 سنة..." value={form.warnings} onChange={v => onChange({ ...form, warnings: v })} rows={2} />
              </div>
            </div>

            {/* ════════ RIGHT COLUMN ════════ */}
            <div className="flex flex-col gap-5 p-5 border-t border-gray-100 md:border-t-0">

              {/* ── Images ── */}
              <div className="flex flex-col gap-3">
                <SectionHeader icon={<BookOpen size={13} className="text-indigo-500" />} title="صور المنتج" subtitle="يمكن إضافة حتى 3 صور" />

                <div className="grid grid-cols-3 gap-2.5">
                  <ImageSlot
                    slot={1} label="الرئيسية"
                    currentUrl={currentImageUrl}
                    newPreview={preview1}
                    onFileSelected={(file, url) => { onImageChange(file); setPreview1(url); }}
                    onRemoveNew={() => { onImageChange(null); setPreview1(null); }}
                    onDeleteServer={isEditing ? () => onDeleteImage(1) : null}
                  />
                  <ImageSlot
                    slot={2} label="الثانية"
                    currentUrl={currentImageUrl2}
                    newPreview={preview2}
                    onFileSelected={(file, url) => { onImageChange2(file); setPreview2(url); }}
                    onRemoveNew={() => { onImageChange2(null); setPreview2(null); }}
                    onDeleteServer={isEditing ? () => onDeleteImage(2) : null}
                  />
                  <ImageSlot
                    slot={3} label="الثالثة"
                    currentUrl={currentImageUrl3}
                    newPreview={preview3}
                    onFileSelected={(file, url) => { onImageChange3(file); setPreview3(url); }}
                    onRemoveNew={() => { onImageChange3(null); setPreview3(null); }}
                    onDeleteServer={isEditing ? () => onDeleteImage(3) : null}
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center">JPG, PNG — حد أقصى 5MB لكل صورة</p>
              </div>

              {/* ── Status & Features ── */}
              <div className="flex flex-col gap-3">
                <SectionHeader icon={<Star size={13} className="text-amber-400" />} title="حالة المنتج والمميزات" />
                <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden divide-y divide-gray-100">

                  {/* isAvailable */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><Package size={14} className="text-blue-500" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 leading-none mb-0.5">معروض للبيع</p>
                        <p className="text-xs text-gray-400">تفعيل لعرضه للزبائن</p>
                      </div>
                    </div>
                    <Toggle checked={form.isAvailable} onChange={() => onChange({ ...form, isAvailable: !form.isAvailable })} color="green" />
                  </div>

                  {/* isBestSeller */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"><Star size={14} className="text-amber-400" fill="#fbbf24" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 leading-none mb-0.5">الأكثر مبيعاً</p>
                        <p className="text-xs text-gray-400">يظهر في Best Sellers</p>
                      </div>
                    </div>
                    <Toggle checked={form.isBestSeller} onChange={() => onChange({ ...form, isBestSeller: !form.isBestSeller })} color="amber" />
                  </div>

                  {/* isOffer */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0"><Tag size={14} className="text-green-500" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 leading-none mb-0.5">عرض خاص</p>
                        <p className="text-xs text-gray-400">تفعيل خصم على المنتج</p>
                      </div>
                    </div>
                    <Toggle checked={form.isOffer} onChange={() => onChange({ ...form, isOffer: !form.isOffer, offerDiscountPercent: "", offerDiscountAmount: "" })} color="green" />
                  </div>

                  {/* Offer discount sub-fields */}
                  <div style={{ display: "grid", gridTemplateRows: form.isOffer ? "1fr" : "0fr", transition: "grid-template-rows 220ms cubic-bezier(0.4,0,0.2,1)" }}>
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-3 px-4 pb-3 pt-1">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-500 font-medium">نسبة الخصم</label>
                          <div className="relative">
                            <input type="number" min={0} max={100} placeholder="0"
                              value={form.offerDiscountPercent}
                              onChange={e => onChange({ ...form, offerDiscountPercent: e.target.value })}
                              className="w-full pr-3 pl-8 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white transition-all" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-500 font-medium">مبلغ الخصم</label>
                          <div className="relative">
                            <input type="number" min={0} placeholder="0"
                              value={form.offerDiscountAmount}
                              onChange={e => onChange({ ...form, offerDiscountAmount: e.target.value })}
                              className="w-full pr-3 pl-12 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white transition-all" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">ج.م</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Footer ── */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-2xl">
          <button type="button" onClick={close} className="text-sm px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer font-medium">
            إلغاء
          </button>
          <button type="button" onClick={save}
            className="text-sm px-7 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer font-semibold shadow-sm"
            style={{ background: "var(--primary)" }}>
            {isEditing ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
        </div>
      </div>

      <style>{`
        .product-modal-scroll::-webkit-scrollbar { width: 4px }
        .product-modal-scroll::-webkit-scrollbar-track { background: transparent }
        .product-modal-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px }
      `}</style>
    </div>
  );
}
