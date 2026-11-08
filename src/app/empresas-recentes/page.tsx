import { Metadata } from "next";
import { 
  getRecentCompanies, 
  getRecentCompaniesStats 
} from "@/lib/recentCompaniesService";
import RecentCompaniesDashboard from "@/components/recent-companies/RecentCompaniesDashboard";

export const metadata: Metadata = {
  title: "Radar de Empresas Recém-Abertas (0-365 dias) — Market Intelligence B2B",
  description: "Analisador de comércios e empresas recém-criadas no DF e Brasil com foco em leads sem sistema instalado.",
};

export const dynamic = "force-dynamic";

export default async function EmpresasRecentesPage() {
  const companies = getRecentCompanies();
  const stats = getRecentCompaniesStats();

  return (
    <div className="max-w-[1600px] mx-auto">
      <RecentCompaniesDashboard
        initialCompanies={companies}
        stats={stats}
      />
    </div>
  );
}

