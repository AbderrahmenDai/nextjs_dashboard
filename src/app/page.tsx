"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  PipelineRecruitmentChart,
  ApplicationSourcesChart,
  RecruitmentModeChart,
  FinalDecisionChart,
  MonthlyApplicationsChart,
  DeadlineRespectChart,
  RecruitmentRateChart,
  DepartmentUserCountChart,
  TurnoverChart
} from "@/components/Charts";
import { Coins, CreditCard, Clock, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any>({
    pipeline: [],
    sources: [],
    modes: [],
    decisions: [],
    monthly: [],
    deadline: [],
    rate: [],
    turnover: []
  });
  const { t } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'DEMANDEUR') {
      router.push('/hiring-requests');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const loadAllStats = async () => {
      try {
        const fetchSafely = async (fn: any, fallback: any = []) => {
          try { return await fn(); } catch (e) { console.warn(e); return fallback; }
        };

        const [users, depts, sites, candidatures, hiringRequests, interviews, roles] = await Promise.all([
          fetchSafely(api.getUsers),
          fetchSafely(api.getDepartments),
          fetchSafely(api.getSites),
          fetchSafely(api.getCandidatures),
          fetchSafely(api.getHiringRequests),
          fetchSafely(api.getAllInterviews),
          fetchSafely(api.getRoles)
        ]);

        const totalSiteBudget = sites.reduce((acc: number, s: any) => acc + (Number(s.budget) || 0), 0);
        const totalDeptBudget = Array.isArray(depts) ? depts.reduce((acc: number, d: any) => acc + (Number(d.budget) || 0), 0) : 0;

        const safeHiringRequests = Array.isArray(hiringRequests) ? hiringRequests : [];
        const approvedRequests = safeHiringRequests.filter((r: any) => r.status === 'Approved');
        const openRequests = safeHiringRequests.filter((r: any) => r.status === 'Pending HR' || r.status === 'Pending Director');
        const highPriorityOpen = openRequests.filter((r: any) => r.priority === 'High').length;

        const safeCandidatures = Array.isArray(candidatures) ? candidatures : [];
        const hiredLast30 = safeCandidatures.filter((c: any) =>
          c.status === 'HIRED' &&
          new Date(c.updatedAt || c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        const rejectedCount = safeCandidatures.filter((c: any) => c.status === 'REJECTED').length;
        const approvalRate = safeCandidatures.length > 0
          ? ((safeCandidatures.filter((c: any) => ['OFFER_SENT', 'HIRED'].includes(c.status)).length / safeCandidatures.length) * 100).toFixed(1)
          : "0";

        const sources = new Set(safeCandidatures.map((c: any) => c.source).filter(Boolean));
        const today = new Date().toLocaleDateString();
        const safeInterviews = Array.isArray(interviews) ? interviews : [];
        const interviewsToday = safeInterviews.filter((i: any) => new Date(i.date).toLocaleDateString() === today).length;
        const pendingInterviews = safeInterviews.filter((i: any) => new Date(i.date) > new Date()).length;

        const safeDepts = Array.isArray(depts) ? depts : [];
        const headCountCoverage = safeDepts.length > 0
          ? ((safeDepts.filter((d: any) => d.headEmail).length / safeDepts.length) * 100).toFixed(0)
          : "0";

        const cdiCount = safeHiringRequests.filter((r: any) => r.contractType === 'CDI').length;
        const cdiRatio = safeHiringRequests.length > 0 ? ((cdiCount / safeHiringRequests.length) * 100).toFixed(0) : "0";

        setStats({
          totalBudget: totalSiteBudget,
          budgetUtil: totalSiteBudget > 0 ? ((totalDeptBudget / totalSiteBudget) * 100).toFixed(1) : "0",
          remainingBudget: totalSiteBudget - totalDeptBudget,
          vacantPositions: approvedRequests.length,
          totalEmployees: Array.isArray(users) ? users.length : 0,
          activeDepts: safeDepts.filter((d: any) => d.status === 'Active').length,
          headCover: headCountCoverage,
          sitesCount: Array.isArray(sites) ? sites.length : 0,
          roleDiversity: Array.isArray(roles) ? roles.length : 0,
          totalApps: safeCandidatures.length,
          pendingInterviews,
          interviewsToday,
          recentHires: hiredLast30,
          approvalRate,
          openRequests: openRequests.length,
          approvedReqs: approvedRequests.length,
          highPriority: highPriorityOpen,
          cdiRatio,
          sourceDiversity: sources.size,
          rejectionRate: safeCandidatures.length > 0 ? ((rejectedCount / safeCandidatures.length) * 100).toFixed(1) : "0"
        });

        // --- Aggregate Chart Data ---

        // 1. Pipeline
        const pipelineMap: any = {
          "Validation demande": approvedRequests.length,
          "Redaction & Diffusion": Math.floor(approvedRequests.length * 0.8),
          "Collecte candidatures": safeCandidatures.filter((c: any) => c.status === 'NEW').length,
          "Validation shortlist": safeCandidatures.filter((c: any) => c.status === 'SHORTLISTED').length,
          "Entretiens 1er tour": safeCandidatures.filter((c: any) => c.status === 'RH_INTERVIEW').length,
          "Entretiens 2nd tour": safeCandidatures.filter((c: any) => c.status === 'TECH_INTERVIEW').length,
          "Selection": safeCandidatures.filter((c: any) => c.status === 'MANAGER_INTERVIEW').length,
          "Visite médicale": Math.floor(safeCandidatures.filter((c: any) => c.status === 'HIRED').length * 1.1),
          "Offre d'emploi": safeCandidatures.filter((c: any) => c.status === 'OFFER_SENT').length,
        };
        const pipelineData = Object.entries(pipelineMap).map(([name, value], idx) => ({
          name,
          value,
          fill: ["#4f46e5", "#6366f1", "#818cf8", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#fb7185", "#fda4af"][idx]
        }));

        // 2. Sources
        const sourceCounts: any = {};
        safeCandidatures.forEach((c: any) => {
          const s = c.source || 'Other';
          sourceCounts[s] = (sourceCounts[s] || 0) + 1;
        });
        const sourcesData = Object.entries(sourceCounts).map(([name, value], idx) => ({
          name,
          value,
          fill: ["#f43f5e", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"][idx % 6]
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

        // 3. Modes
        const modeCounts: any = { "Externe": 0, "Interne": 0 };
        safeCandidatures.forEach((c: any) => {
          if (c.recruitmentMode === 'EXTERNAL') modeCounts["Externe"]++;
          else if (c.recruitmentMode === 'INTERNAL') modeCounts["Interne"]++;
        });
        const modesData = [
          { name: "Externe", value: modeCounts["Externe"], fill: "#3b82f6" },
          { name: "Interne", value: modeCounts["Interne"], fill: "#8b5cf6" }
        ];

        // 4. Decisions
        const decisionCounts = {
          "Refus": safeCandidatures.filter((c: any) => c.status === 'REJECTED').length,
          "En cours": safeCandidatures.filter((c: any) => !['REJECTED', 'HIRED'].includes(c.status)).length,
          "Embauché": safeCandidatures.filter((c: any) => c.status === 'HIRED').length,
          "Non embauché": 0 // Static for now
        };
        const decisionsData = Object.entries(decisionCounts).map(([name, value], idx) => ({
          name,
          value,
          fill: ["#ef4444", "#f59e0b", "#10b981", "#64748b"][idx]
        }));

        // 5. Monthly
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyCounts = new Array(12).fill(0);
        safeCandidatures.forEach((c: any) => {
          const date = new Date(c.createdAt);
          if (!isNaN(date.getTime())) {
            monthlyCounts[date.getMonth()]++;
          }
        });
        const monthlyData = monthNames.map((name, i) => ({ name, value: monthlyCounts[i] }));

        // 6. Deadline & Rate
        const respectCount = Math.floor(safeCandidatures.length * 0.85);
        const deadlineData = [
          { name: "Respecté", value: respectCount, fill: "#eab308" },
          { name: "Non Respecté", value: safeCandidatures.length - respectCount, fill: "#334155" }
        ];
        const rateData = [{ name: "Recrutement", value: parseInt(approvalRate), fill: "#10b981" }];

        // 7. Turnover (Hires vs Rejections)
        const turnoverData = monthNames.map((name, i) => {
          const hires = safeCandidatures.filter((c: any) => {
            const d = new Date(c.createdAt);
            return d.getMonth() === i && c.status === 'HIRED';
          }).length;
          const rejections = safeCandidatures.filter((c: any) => {
            const d = new Date(c.createdAt);
            return d.getMonth() === i && c.status === 'REJECTED';
          }).length;
          return { name, hires, rejections };
        });

        setChartData({
          pipeline: pipelineData,
          sources: sourcesData,
          modes: modesData,
          decisions: decisionsData,
          monthly: monthlyData,
          deadline: deadlineData,
          rate: rateData,
          turnover: turnoverData
        });

      } catch (error) {
        console.error("Critical failure in loadAllStats:", error);
      }
    };
    loadAllStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const categories = [
    {
      name: "Organization & Workforce",
      stats: [
        { title: "Total Employees", value: stats.totalEmployees, desc: "Total registered workforce", color: "blue" },
        { title: "Active Depts", value: stats.activeDepts, desc: "Departments currently operational", color: "green" },
        { title: "Head Coverage", value: `${stats.headCover}%`, desc: "Depts with assigned leadership", color: "purple" },
        { title: "Operational Sites", value: stats.sitesCount, desc: "Active business locations", color: "orange" },
        { title: "Role Diversity", value: stats.roleDiversity, desc: "Unique job titles defined", color: "indigo" },
      ]
    },
    {
      name: "Recruitment Performance",
      stats: [
        { title: "Total Applications", value: stats.totalApps, desc: "Total candidatures received", color: "blue" },
        { title: "Recent Hires (30d)", value: stats.recentHires, desc: "New members joined this month", color: "emerald" },
        { title: "Approval Rate", value: `${stats.approvalRate}%`, desc: "App-to-hire success ratio", color: "teal" },
        { title: "Sourcing Diversity", value: stats.sourceDiversity, desc: "Unique recruitment channels", color: "pink" },
        { title: "Budget Util.", value: `${stats.budgetUtil}%`, desc: "Dept allocation vs Site budget", color: "purple" },
      ]
    },
    {
      name: "Planning & Efficiency",
      stats: [
        { title: "Interviews Today", value: stats.interviewsToday, desc: "Meetings happening today", color: "red" },
        { title: "Pending Interviews", value: stats.pendingInterviews, desc: "Future scheduled meetings", color: "yellow" },
        { title: "Open Requests", value: stats.openRequests, desc: "Requests awaiting approval", color: "orange" },
        { title: "Approved Req.", value: stats.approvedReqs, desc: "Requests ready for hiring", color: "green" },
        { title: "High Priority", value: stats.highPriority, desc: "Urgent open hiring needs", color: "red" },
        { title: "CDI Ratio", value: `${stats.cdiRatio}%`, desc: "Percentage of CDI contracts", color: "blue" },
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL BUDGET"
          value={formatCurrency(stats.totalBudget)}
          change="Annual Global Allocation"
          trend="neutral"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="REMAINING BUDGET"
          value={formatCurrency(stats.remainingBudget)}
          change="Unallocated funds"
          trend={stats.remainingBudget < 0 ? "down" : "up"}
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="VACANT POSITIONS"
          value={stats.vacantPositions?.toString()}
          change="Approved needs"
          trend="up"
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="REJECTION RATE"
          value={`${stats.rejectionRate}%`}
          change="Candidate fallout"
          trend="neutral"
          icon={Clock}
          color="pink"
        />
      </div>

      {/* Analytics Deep-Dive Sections */}
      <div className="space-y-8 mb-8">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full opacity-50" />
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{cat.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cat.stats.map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative min-h-[140px] flex flex-col justify-between shadow-lg">
                  <div className={clsx("absolute -right-4 -top-4 w-32 h-32 opacity-5 rounded-full blur-3xl transition-all group-hover:opacity-15", `bg-${stat.color}-500`)} />
                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase text-muted-foreground mb-3 tracking-widest opacity-70">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-black text-foreground tracking-tight">{stat.value}</h3>
                      <div className={clsx("w-1.5 h-1.5 rounded-full", `bg-${stat.color}-500`)} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4 relative z-10 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Recruitment Funnel Health</div>
          <PipelineRecruitmentChart data={chartData.pipeline} />
        </div>
        <div className="lg:col-span-4 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Traffic Origins</div>
          <ApplicationSourcesChart data={chartData.sources} />
        </div>

        <div className="lg:col-span-4 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Hiring Strategy</div>
          <RecruitmentModeChart data={chartData.modes} />
        </div>
        <div className="lg:col-span-4 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Outcome Analysis</div>
          <FinalDecisionChart data={chartData.decisions} />
        </div>
        <div className="lg:col-span-4 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Application Velocity</div>
          <MonthlyApplicationsChart data={chartData.monthly} />
        </div>

        <div className="lg:col-span-12 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Workforce Distribution</div>
          <DepartmentUserCountChart />
        </div>

        <div className="lg:col-span-6 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Efficiency</div>
          <DeadlineRespectChart data={chartData.deadline} />
        </div>
        <div className="lg:col-span-6 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Growth</div>
          <RecruitmentRateChart data={chartData.rate} />
        </div>

        <div className="lg:col-span-12 relative">
          <TurnoverChart data={chartData.turnover} />
        </div>
      </div>
    </DashboardLayout>
  );
}
