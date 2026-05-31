import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { FileText, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export function HistoryPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications")
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load applications", err);
        setLoading(false);
      });
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "approved":
        return {
          color: "text-emerald-700",
          bg: "bg-emerald-100",
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: "Approved",
        };
      case "rejected":
        return {
          color: "text-red-700",
          bg: "bg-red-100",
          icon: <XCircle className="h-4 w-4" />,
          label: "Rejected",
        };

      default:
        return {
          color: "text-slate-700",
          bg: "bg-slate-100",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "In Progress",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="min-h-[calc(100vh-152px)] bg-[#f4f7fb] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#18246f]">Application History</h1>
            <p className="mt-2 text-slate-600">View all your recent visa applications and their statuses.</p>
          </div>
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#18246f] shadow-sm transition hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#22348f]" />
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#18246f]">No applications found</h3>
            <p className="mt-2 text-sm text-slate-500">You haven't started any visa verification applications yet.</p>
            <Link
              to="/welcome"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#22348f] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#1b2d7b]"
            >
              Start New Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {applications.map((app) => {
              const statusInfo = getStatusDisplay(app.status);
              return (
                <div key={app.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-[#18246f]">
                        {app.applicant_nationality || "Unknown"} to {app.country_code || "Unknown"} Visa
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Application ID: <span className="font-mono text-xs">{app.id.slice(0, 8)}...</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Started on {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
