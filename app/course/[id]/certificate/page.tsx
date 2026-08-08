"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to load certificate course:", error);
        setCourse(null);
        return;
      }

      setCourse(data);
    }

    loadCourse();
  }, [id]);

  async function handleDownloadPdf() {
    if (!course) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(239, 246, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(4);
    doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 18, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("EduGPT", pageWidth / 2, 96, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Certificate of Completion", pageWidth / 2, 122, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("This certifies that", pageWidth / 2, 190, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("Learner", pageWidth / 2, 250, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("has successfully completed", pageWidth / 2, 320, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(course.topic || "Course", pageWidth / 2, 370, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Certificate ID: ${course.certificate_id || "-"}`, 70, pageHeight - 110);
    doc.text(
      `Completion Date: ${course.completed_at ? new Date(course.completed_at).toLocaleDateString() : "-"}`,
      pageWidth - 240,
      pageHeight - 110
    );

    doc.save("certificate.pdf");
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Certificate...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="certificate-card bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-16 border-8 border-blue-600">

        <h1 className="text-6xl font-bold text-center text-blue-700">
          🎓 EduGPT
        </h1>

        <p className="text-center text-gray-500 mt-3">
          Certificate of Completion
        </p>

        <div className="mt-16 text-center">

          <p className="text-xl text-gray-600">
            This certifies that
          </p>

          <h2 className="text-5xl font-bold mt-6">
            Learner
          </h2>

          <p className="mt-10 text-2xl">
            has successfully completed
          </p>

          <h3 className="text-4xl font-bold text-blue-700 mt-6">
            {course.topic}
          </h3>

        </div>

        <div className="mt-20 flex justify-between">

          <div>

            <p className="font-bold">
              Certificate ID
            </p>

            <p>{course.certificate_id}</p>

          </div>

          <div className="text-right">

            <p className="font-bold">
              Completion Date
            </p>

            <p>
              {course.completed_at
                ? new Date(course.completed_at).toLocaleDateString()
                : "-"}
            </p>

          </div>

        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleDownloadPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Save as PDF
          </button>
        </div>

      </div>

    </div>
  );
}