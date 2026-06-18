"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FileText, Download, Eye, Loader2, Inbox } from "lucide-react";
import { LegalDocsServices } from "@/services/legaldocsServices";

interface LegalDoc {
  id: number;
  title: string;
  image: string;
  pdf: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function LegalDocSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        >
          <div className="w-full h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
              <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────
function LegalDocCard({ doc, index }: { doc: LegalDoc; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-50">
        <Image
          src={doc.image}
          alt={doc.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* PDF badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
          <FileText size={10} />
          PDF
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <div>
          <div className="w-6 h-0.5 bg-green-500 rounded-full mb-2" />
          <h3 className="font-bold text-[14px] text-blue-950 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
            {doc.title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {/* View PDF in new tab */}
          
           <Link href={doc.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-green-200 text-green-700 text-[12px] font-semibold hover:bg-green-50 transition-colors"
          >
            <Eye size={13} />
            View
          </Link>

          {/* Download PDF */}
          
           <Link href={doc.pdf}
            download
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold transition-colors shadow-sm shadow-green-200"
          >
            <Download size={13} />
            Download
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LegalDocsPage() {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    LegalDocsServices.getDetails()
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch((err) => setError(LegalDocsServices.parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
     

      <section className="md:px-12 px-4 py-14">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
            Compliance & Transparency
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Legal Documents
          </h2>
          <div className="mt-3 w-14 h-1 bg-green-500 rounded-full" />
          {!loading && docs.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              {docs.length} document{docs.length !== 1 ? "s" : ""} available
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && <LegalDocSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <FileText size={24} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && docs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No legal documents yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && docs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {docs.map((doc, index) => (
              <LegalDocCard key={doc.id} doc={doc} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}