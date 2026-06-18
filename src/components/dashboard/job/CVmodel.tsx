"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  Briefcase,
  Download,
  RotateCw,
} from "lucide-react";
import { JobServices } from "@/services/jobServices";
import { useTheme } from "@/lib/context/ThemeContext";

interface Applicant {
  id: any;
  name: string;
  email: string;
  contact: string;
  address: string;
  cv?: string;
  short_description?: string;
  submitted_at?: string;
  job?: any;
}

interface CVModalProps {
  applicant: Applicant;
  onClose: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert a hex color to rgba string */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function CVModal({ applicant, onClose }: CVModalProps) {
  const { primaryColor } = useTheme();
  const [activeTab, setActiveTab] = useState<"details" | "cv">("details");
  const [cvLoaded, setCvLoaded] = useState(false);
  const [jobName, setJobName] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Resolve job name from ID using cached JobServices
  useEffect(() => {
    if (!applicant.job) return;
    JobServices.getDetails()
      .then((res: any) => {
        const jobs: any[] = Array.isArray(res) ? res : res?.results || [];
        const found = jobs.find((j) => j.id === applicant.job);
        setJobName(found ? found.name : `Job #${applicant.job}`);
      })
      .catch(() => setJobName(`Job #${applicant.job}`));
  }, [applicant.job]);

  const handleTabChange = (tab: "details" | "cv") => {
    setActiveTab(tab);
    if (tab === "cv" && !cvLoaded) setCvLoaded(true);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
 <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 transition-opacity duration-300 ease-in-out" 
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
     <div
        className="bg-white rounded-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" 
        style={{
          maxWidth: 520,
          maxHeight: "92vh",
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* ── Header Banner — uses primaryColor ── */}
        <div
          className="relative px-6 pt-3 pb-12 flex-shrink-0"
          style={{ background: primaryColor }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center  hover:bg-white/20 text-red-500 hover:text-red-600 transition-colors"
            
            aria-label="Close"
          >
            <X size={15} />
          </button>

          {/* Job badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-semibold text-white/80 mb-3"
            style={{
              background: hexToRgba("#ffffff", 0.19),
              borderColor: hexToRgba("#ffffff", 0.2),
            }}
          >
            <Briefcase size={10} />
            {jobName ?? "Loading…"}
          </div>

          {/* Applicant name */}
          <p className="text-white font-bold text-lg leading-tight">{applicant.name}</p>
          <p className="text-white/60 text-xs mt-0.5">
            Applied {formatDate(applicant.submitted_at)}
          </p>
        </div>

        {/* ── Avatar overlapping banner ── */}
        <div className="relative flex-shrink-0 px-6">
          <div
            className="absolute -top-9 left-6 w-16 h-16 rounded-lg border-4 border-white flex items-center justify-center font-bold text-lg shadow-md text-white"
            style={{ background: primaryColor, filter: "brightness(1.15)" }}
          >
            {getInitials(applicant.name)}
          </div>
          <div className="h-6" />
        </div>

        {/* ── Tabs — active tab uses primaryColor ── */}
        <div className="flex gap-0 px-6 border-b border-gray-100 flex-shrink-0 mt-2">
          {(["details", "cv"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="py-2.5 px-4 text-xs font-semibold capitalize border-b-2 transition-colors -mb-px"
              style={
                activeTab === tab
                  ? { borderColor: primaryColor, color: primaryColor }
                  : { borderColor: "transparent", color: "#8094ae" }
              }
            >
              {tab === "cv" ? "CV Preview" : "Details"}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="px-6 py-5 space-y-1">
              <DetailRow
                icon={<Mail size={13} className="text-[#8094ae]" />}
                label="Email"
                value={applicant.email}
              />
              <DetailRow
                icon={<Phone size={13} className="text-[#8094ae]" />}
                label="Contact"
                value={applicant.contact}
              />
              <DetailRow
                icon={<MapPin size={13} className="text-[#8094ae]" />}
                label="Address"
                value={applicant.address}
              />
              <DetailRow
                icon={<Briefcase size={13} className="text-[#8094ae]" />}
                label="Applied For"
                value={jobName ?? "Resolving…"}
                accent={primaryColor}
              />
              <DetailRow
                icon={<Calendar size={13} className="text-[#8094ae]" />}
                label="Submitted"
                value={formatDate(applicant.submitted_at)}
              />
              {applicant.short_description && (
                <div className="mt-4 p-2 rounded bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-[#8094ae] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MessageSquare size={11} /> cover letter
                  </p>
                  <p className="text-[12px] text-[#526484] leading-relaxed">
                    {applicant.short_description}
                  </p>
                </div>
              )}
              {!applicant.cv && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded bg-amber-50 border border-amber-100 text-[11px] text-amber-700">
                  <FileText size={14} />
                  No CV was attached to this application.
                </div>
              )}
            </div>
          )}

          {/* CV Preview Tab */}
          {activeTab === "cv" && (
            <div className="p-4 flex flex-col gap-3">
              {applicant.cv ? (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-[#8094ae] font-medium truncate max-w-[200px]">
                      {applicant.cv.split("/").pop()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIframeKey((k) => k + 1)}
                        className="p-1.5 text-[#8094ae] hover:text-[#364a63] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Reload"
                      >
                        <RotateCw size={13} />
                      </button>
                      <a
                        href={applicant.cv}
                        download
                        className="p-1.5 text-[#8094ae] hover:text-[#364a63] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={13} />
                      </a>
                      <a
                        href={applicant.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#8094ae] hover:text-[#364a63] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {/* PDF iframe */}
                  <div
                    className="rounded overflow-hidden border border-gray-200 bg-gray-50"
                    style={{ height: 360 }}
                  >
                    {cvLoaded && (
                      <iframe
                        key={iframeKey}
                        src={applicant.cv}
                        className="w-full h-full border-none"
                        title={`CV of ${applicant.name}`}
                      />
                    )}
                  </div>

                  <p className="text-[10px] text-[#8094ae] text-center">
                    Preview not loading?{" "}
                    <a
                      href={applicant.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                      style={{ color: primaryColor }}
                    >
                      Open directly ↗
                    </a>
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8094ae]">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-[#364a63]">No CV uploaded</p>
                  <p className="text-xs">This applicant did not attach a CV.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-red-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {applicant.cv && (
            <div className="flex items-center gap-2">
              <a
                href={applicant.cv}
                download
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: primaryColor }}
              >
                <Download size={12} /> Download
              </a>
              <a
                href={applicant.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                style={{ background: primaryColor }}
              >
                <ExternalLink size={12} /> Open CV
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Detail row sub-component */
function DetailRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#8094ae] uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p
          className="text-[12px] font-medium break-words"
          style={{ color: accent ?? "#364a63" }}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}