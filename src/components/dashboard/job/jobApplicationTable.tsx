"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  SearchX,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { JobApplicationServices, JobServices } from "@/services/jobServices";
import CVModal from "./CVmodel";

const PAGE_SIZE = 20;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: "bg-blue-50", text: "text-blue-700" },
  { bg: "bg-violet-50", text: "text-violet-700" },
  { bg: "bg-emerald-50", text: "text-emerald-700" },
  { bg: "bg-amber-50", text: "text-amber-700" },
  { bg: "bg-rose-50", text: "text-rose-700" },
  { bg: "bg-cyan-50", text: "text-cyan-700" },
];

function getAvatarColor(name: string) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function JobApplicationTable({
  jobId,
  jobName,
  refreshTrigger,
  searchQuery = "",
}: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [cvApplicant, setCvApplicant] = useState<any>(null);

  // Job ID → Name map (built from cache)
  const [jobMap, setJobMap] = useState<Record<number, string>>({});

  // Pre-fetch jobs for name resolution
  useEffect(() => {
    JobServices.getDetails()
      .then((res: any) => {
        const jobs: any[] = Array.isArray(res) ? res : res?.results || [];
        const map: Record<number, string> = {};
        jobs.forEach((j) => (map[j.id] = j.name));
        setJobMap(map);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await JobApplicationServices.getApplications();
      const applications = Array.isArray(res) ? res : res?.results || [];
      setDataList(applications);
      setFilteredData(applications);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId, refreshTrigger]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(
      dataList.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q),
      ),
    );
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, dataList]);

  const paginated = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleSelectAll = () =>
    selectedIds.length === paginated.length
      ? setSelectedIds([])
      : setSelectedIds(paginated.map((i) => i.id));

  const handleSelectOne = (id: any) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const handleConfirmDelete = async () => {
    const ids =
      selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(
        ids.map((id) => JobApplicationServices.deleteApplications(id)),
      );
      toast.success(`${ids.length} application(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      setIsModalOpen(false);
      setSelectedIds([]);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Applications – ${jobName}`, 14, 15);
    autoTable(doc, {
      head: [["S.N.", "Name", "Email", "Contact", "Address", "Job"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        item.name,
        item.email,
        item.contact,
        item.address,
        jobMap[item.job] || `#${item.job}`,
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 74, 114] },
    });
    doc.save("Applications.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] scrollbar-hide relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 shadow-sm">
              <tr className="bg-[#f5f6fa]">
                <th className="px-4 py-1.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">S.N.</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Name</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Email</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Contact</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Job</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoadingSkeleton rows={5} cols={7} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      {searchQuery ? (
                        <SearchX size={32} className="text-rose-300" />
                      ) : (
                        <Inbox size={32} className="text-gray-200" />
                      )}
                      <span className="text-sm font-bold text-[#364a63]">
                        {searchQuery ? "No results." : "No applications yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const avatar = getAvatarColor(item.name || "A");
                  const resolvedJobName = jobMap[item.job] ?? `#${item.job}`;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-1.5 text-[10px] text-[#526484]">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}.
                      </td>
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${avatar.bg} ${avatar.text}`}
                          >
                            {getInitials(item.name || "?")}
                          </div>
                          <span className="text-[11px] font-bold text-[#364a63]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-1.5">
                        <span className="text-[10px] text-[#8094ae]">{item.email}</span>
                      </td>
                      <td className="px-4 py-1.5">
                        <span className="text-[10px] text-[#8094ae]">{item.contact}</span>
                      </td>
                      <td className="px-4 py-1.5">
                        {/* Job Name Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eaf0fa] text-[#2e4a72]">
                          {resolvedJobName}
                        </span>
                      </td>
                      <td className="px-4 py-1.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setCvApplicant(item)}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            title="View applicant details & CV"
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIds([]);
                              setDeleteId(item.id);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
                            title="Delete application"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination + PDF */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-300 bg-[#f5f6fa]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8094ae]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of{" "}
                {filteredData.length}
              </span>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <Download size={12} /> PDF
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-bold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs font-bold text-red-600 uppercase">
            {selectedIds.length} Selected
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded text-[11px] font-bold hover:bg-red-600 active:scale-95"
          >
            <Trash2 size={12} /> Delete Selected
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Application?"
        message={
          selectedIds.length > 0
            ? `Delete ${selectedIds.length} applications?`
            : "Delete this application?"
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          setDeleteId(null);
        }}
        loading={deleteLoading}
      />

      {/* CV Viewer Modal */}
      {cvApplicant && (
        <CVModal applicant={cvApplicant} onClose={() => setCvApplicant(null)} />
      )}
    </div>
  );
}