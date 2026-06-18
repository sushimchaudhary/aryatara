"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProjectsServices } from "@/services/projectsServices";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProjectDetailSkeleton() {
  return (
    <main className="min-h-screen py-10 md:px-12 px-3 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <div className="h-4 w-32 bg-gray-200 rounded-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image skeleton */}
          <div className="relative w-full h-80 md:h-[500px] rounded-lg bg-gray-200" />

          {/* Content skeleton */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="h-10 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-8 w-1/2 bg-gray-200 rounded-full" />

            {/* Description lines */}
            <div className="space-y-3 mt-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-3 bg-gray-200 rounded-full ${
                    i === 5 ? "w-2/3" : "w-full"
                  }`}
                />
              ))}
            </div>

            {/* URL button */}
            <div className="h-5 w-32 bg-gray-200 rounded-full mt-4" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await ProjectsServices.getDetails();
        const found = data.find(
          (p: any) => p.title.toLowerCase().replace(/\s+/g, "-") === slug
        );
        if (found) setProject(found);
        else setNotFound(true);
      } catch (error) {
        console.error("Error:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) return <ProjectDetailSkeleton />;

  if (notFound) {
    return (
      <main className="min-h-screen py-10 md:px-12 px-3">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center text-gray-500 hover:text-green-600 transition mb-8"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Projects
          </Link>
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-blue-950">Project Not Found</h2>
            <p className="text-sm text-gray-400">
              This project may have been removed or does not exist.
            </p>
            <Link
              href="/projects"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 md:px-12 px-3">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.35 }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors mb-8 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Projects
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.35, ease: "easeOut" }}
            className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-2xl"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              unoptimized
              className="object-cover object-center"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.35, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-blue-950 leading-tight">
                {project.title}
              </h1>
              <div className="mt-3 w-14 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
            </div>

            {/* CKEditor HTML */}
            <div
              className="
                prose prose-sm max-w-none text-justify
                [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-[15px] [&_p]:text-gray-600
                [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1
                [&_li]:text-gray-600 [&_li]:text-[15px]
                [&_h4]:font-bold [&_h4]:text-blue-900 [&_h4]:mb-2 [&_h4]:mt-4
                [&_b]:text-gray-800 [&_strong]:text-gray-800
                [&_i]:italic [&_em]:italic
              "
              dangerouslySetInnerHTML={{ __html: project.description ?? "" }}
            />

            {project.url && (
              <a
                href={
                  project.url.startsWith("http")
                    ? project.url
                    : `https://${project.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:underline transition"
              >
                Visit Website <ExternalLink size={16} />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}