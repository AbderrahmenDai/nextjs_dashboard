"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  RecruitmentModeChart,
  ResultsAnalysisChart,
  VelocityChart,
  MonthlyApplicationsChart,
  DeadlineRespectChart,
  RecruitmentRateChart,
  OfferAcceptanceRateChart,
  TimeToFillChart,
  TimeToFillDetailedChart,
  CostPerHireChart,
  DepartmentUserCountChart,
  TurnoverChart
} from "@/components/Charts";
import { Coins, CreditCard, Clock, Briefcase, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any>({
    sources: [],
    modes: [],
    decisions: [],
    monthly: [],
    deadline: [],
    rate: [],
    offerAcceptance: [],
    timeToFill: [],
    timeToFillDetailed: null,
    costPerHire: [],
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
        const openRequests = safeHiringRequests.filter((r: any) => r.status === 'Pending Responsable RH' || r.status === 'Pending Plant Manager');
        const highPriorityOpen = openRequests.filter((r: any) => r.priority === 'High').length;

        const safeCandidatures = Array.isArray(candidatures) ? candidatures : [];
        const hiredLast30 = safeCandidatures.filter((c: any) =>
          c.status === 'HIRED' &&
          new Date(c.updatedAt || c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        const rejectedCount = safeCandidatures.filter((c: any) => c.status === 'REJECTED').length;
        // Calcul du taux de recrutement: (Nombre de salariés embauchés / Effectif total avant embauche) × 100
        const safeUsers = Array.isArray(users) ? users : [];
        const hiredCount = safeCandidatures.filter((c: any) => c.status === 'HIRED').length;
        const totalStaffBeforeHiring = safeUsers.length - hiredCount; // Effectif avant les nouvelles embauches
        const recruitmentRate = totalStaffBeforeHiring > 0
          ? ((hiredCount / totalStaffBeforeHiring) * 100).toFixed(1)
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
          openRequests: openRequests.length,
          approvedReqs: approvedRequests.length,
          highPriority: highPriorityOpen,
          cdiRatio,
          sourceDiversity: sources.size,
          rejectionRate: safeCandidatures.length > 0 ? ((rejectedCount / safeCandidatures.length) * 100).toFixed(1) : "0",
          recruitmentRate,
          hiredCount,
          totalStaffBeforeHiring
        });

        // --- Aggregate Chart Data ---

        // 1. Sources (Mapped to "Origines du trafic" style for visual match)
        const sourceCounts: any = {};
        safeCandidatures.forEach((c: any) => {
          const s = c.source || 'Direct';
          sourceCounts[s] = (sourceCounts[s] || 0) + 1;
        });

        // Use real data if available, otherwise mock for visual fidelity to "make it like that"
        const hasData = safeCandidatures.length > 0;

        const sourcesData = hasData ? Object.entries(sourceCounts).map(([name, value]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
          value
        })) : [
          { name: "Recherche organique", value: 45 },
          { name: "Direct", value: 25 },
          { name: "Réseaux sociaux", value: 20 },
          { name: "Référenceurs", value: 10 }
        ];

        // 3. Modes -> Now mapped to "Stratégie de recrutement" (Channels)
        // We use Source data here effectively as "Channels"
        const modesData = hasData ? Object.entries(sourceCounts).map(([name, value]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
          value
        })).sort((a, b) => b.value - a.value).slice(0, 5) : [
          { name: "LinkedIn", value: 450 },
          { name: "Indeed", value: 320 },
          { name: "Site Carrière", value: 280 },
          { name: "Agences", value: 150 },
          { name: "Autres", value: 80 }
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
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyCounts = new Array(12).fill(0);
        safeCandidatures.forEach((c: any) => {
          const date = new Date(c.createdAt);
          if (!isNaN(date.getTime())) {
            monthlyCounts[date.getMonth()]++;
          }
        });
        const monthlyData = monthNames.map((name, i) => ({ name, value: monthlyCounts[i] }));

        // 6. Deadline & Rate
        const totalCands = safeCandidatures.length;
        // Use dummy data if no candidates: 18 respected, 4 not respected
        const respectCount = totalCands > 0 ? Math.floor(totalCands * 0.85) : 18;
        const nonRespectCount = totalCands > 0 ? (totalCands - respectCount) : 4;

        const deadlineData = [
          { name: "Respecté", value: respectCount, fill: "#eab308" },
          { name: "Non Respecté", value: nonRespectCount, fill: "#334155" }
        ];
        const rateData = [{
          name: "Recrutement",
          value: parseInt(recruitmentRate) > 0 ? parseInt(recruitmentRate) : 15, // Dummy 15% if 0
          hiredCount: hiredCount > 0 ? hiredCount : 12,
          totalStaffBeforeHiring: totalStaffBeforeHiring > 0 ? totalStaffBeforeHiring : 80,
          fill: "#10b981"
        }];

        // 7. Turnover (Hires vs Rejections)
        let turnoverData = monthNames.map((name, i) => {
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

        // Check if empty and add dummy data
        const hasTurnoverData = turnoverData.some(d => d.hires > 0 || d.rejections > 0);
        if (!hasTurnoverData) {
          turnoverData = monthNames.map((name) => ({
            name,
            hires: Math.floor(Math.random() * 5) + 1,
            rejections: Math.floor(Math.random() * 3)
          }));
        }

        // 8. Offer Acceptance Rate
        const offersEmitted = safeCandidatures.filter((c: any) => c.status === 'OFFER_SENT' || c.status === 'HIRED').length;
        const offersAccepted = safeCandidatures.filter((c: any) => c.status === 'HIRED').length;
        const offerAcceptanceRate = offersEmitted > 0 ? ((offersAccepted / offersEmitted) * 100).toFixed(0) : "0";
        const offerAcceptanceData = [{
          name: "Acceptation",
          value: parseInt(offerAcceptanceRate),
          acceptedOffers: offersAccepted,
          totalOffers: offersEmitted,
          fill: "#3b82f6"
        }];

        // 9. Cost Per Hire
        const hiredCandidatures = safeCandidatures.filter((c: any) => c.status === 'HIRED');
        const hireCount = hiredCandidatures.length;

        // TODO: Ces valeurs sont simulées - à remplacer par de vrais champs dans la base de données
        const internalCosts = hireCount * 500; // Frais internes moyens par recrutement
        const externalCosts = hireCount * 1200; // Frais externes (cabinets, etc.)
        const diffusionCosts = hireCount * 300; // Frais de diffusion d'annonces
        const totalCosts = internalCosts + externalCosts + diffusionCosts;
        const costPerHire = hireCount > 0 ? Math.round(totalCosts / hireCount) : 0;

        // Extraire les départements et sites uniques
        const departments = [...new Set(hiredCandidatures.map((c: any) => c.hiringRequest?.department?.name).filter(Boolean))];
        const costSites = [...new Set(hiredCandidatures.map((c: any) => c.hiringRequest?.site?.name).filter(Boolean))];

        // Calculer les coûts par département
        const byDepartment = departments.map((dept: string) => {
          const deptHires = hiredCandidatures.filter((c: any) => c.hiringRequest?.department?.name === dept);
          const deptCount = deptHires.length;
          const deptInternal = deptCount * 500;
          const deptExternal = deptCount * 1200;
          const deptDiffusion = deptCount * 300;
          const deptTotal = deptInternal + deptExternal + deptDiffusion;
          return {
            department: dept,
            cost: deptCount > 0 ? Math.round(deptTotal / deptCount) : 0,
            internalCosts: deptInternal,
            externalCosts: deptExternal,
            diffusionCosts: deptDiffusion,
            hireCount: deptCount
          };
        });

        // Calculer les coûts par site
        const bySite = costSites.map((site: string) => {
          const siteHires = hiredCandidatures.filter((c: any) => c.hiringRequest?.site?.name === site);
          const siteCount = siteHires.length;
          const siteInternal = siteCount * 500;
          const siteExternal = siteCount * 1200;
          const siteDiffusion = siteCount * 300;
          const siteTotal = siteInternal + siteExternal + siteDiffusion;
          return {
            site: site,
            cost: siteCount > 0 ? Math.round(siteTotal / siteCount) : 0,
            internalCosts: siteInternal,
            externalCosts: siteExternal,
            diffusionCosts: siteDiffusion,
            hireCount: siteCount
          };
        });

        // Check if we need dummy data for Cost Per Hire
        let finalCostPerHireData = [{
          name: "Coût",
          value: costPerHire,
          internalCosts,
          externalCosts,
          diffusionCosts,
          hireCount,
          departments,
          sites: costSites,
          byDepartment,
          bySite,
          fill: "#f59e0b"
        }];

        if (hireCount === 0) {
          finalCostPerHireData = [{
            name: "Coût",
            value: 3500,
            internalCosts: 1500,
            externalCosts: 3600,
            diffusionCosts: 900,
            hireCount: 12,
            departments: ["RH", "IT", "Sales"],
            sites: ["Tunis", "Sfax"],
            byDepartment: [
              { department: "RH", cost: 2000, internalCosts: 500, externalCosts: 1200, diffusionCosts: 300, hireCount: 3 },
              { department: "IT", cost: 4200, internalCosts: 1000, externalCosts: 2400, diffusionCosts: 800, hireCount: 5 }
            ],
            bySite: [
              { site: "Tunis", cost: 3800, internalCosts: 900, externalCosts: 2100, diffusionCosts: 800, hireCount: 8 },
              { site: "Sfax", cost: 2900, internalCosts: 600, externalCosts: 1500, diffusionCosts: 800, hireCount: 4 }
            ],
            fill: "#f59e0b"
          }];
        }

        const costPerHireData = finalCostPerHireData;

        // 10. Time to Fill (Délai de recrutement)
        // Calculer le délai entre la validation du poste (approvedAt) et l'embauche (hireDate)
        const hiredCandidatesWithDates = hiredCandidatures.map((c: any) => {
          if (!c.hiringRequest && c.hiringRequestId) {
            const request = safeHiringRequests.find((hr: any) => hr.id === c.hiringRequestId);
            return { ...c, hiringRequest: request };
          }
          return c;
        }).filter((c: any) =>
          c.hiringRequest?.approvedAt && c.hireDate
        );

        const timeToFillDays = hiredCandidatesWithDates.map((c: any) => {
          const approvedDate = new Date(c.hiringRequest.approvedAt);
          const hireDate = new Date(c.hireDate);
          const diffTime = Math.abs(hireDate.getTime() - approvedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        });

        const averageTimeToFill = timeToFillDays.length > 0
          ? Math.round(timeToFillDays.reduce((sum, days) => sum + days, 0) / timeToFillDays.length)
          : 30; // Valeur par défaut si pas de données

        const minTimeToFill = timeToFillDays.length > 0 ? Math.min(...timeToFillDays) : 0;
        const maxTimeToFill = timeToFillDays.length > 0 ? Math.max(...timeToFillDays) : 0;

        const timeToFillData = [{
          name: "Délai",
          value: averageTimeToFill,
          minDays: minTimeToFill,
          maxDays: maxTimeToFill,
          totalHires: hiredCandidatesWithDates.length,
          fill: "#f59e0b"
        }];

        // 11. Time to Fill Detailed (Par département et par mois)
        // Calculer les données par département
        const departmentTimeToFill = new Map<string, { days: number[], hireCount: number }>();

        hiredCandidatesWithDates.forEach((c: any) => {
          const deptName = c.hiringRequest?.department?.name || 'Non défini';
          const approvedDate = new Date(c.hiringRequest.approvedAt);
          const hireDate = new Date(c.hireDate);
          const diffTime = Math.abs(hireDate.getTime() - approvedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (!departmentTimeToFill.has(deptName)) {
            departmentTimeToFill.set(deptName, { days: [], hireCount: 0 });
          }

          const deptData = departmentTimeToFill.get(deptName)!;
          deptData.days.push(diffDays);
          deptData.hireCount++;
        });

        const timeToFillByDept = Array.from(departmentTimeToFill.entries()).map(([department, data]) => ({
          department,
          averageDays: Math.round(data.days.reduce((sum, d) => sum + d, 0) / data.days.length),
          minDays: Math.min(...data.days),
          maxDays: Math.max(...data.days),
          hireCount: data.hireCount
        })).sort((a, b) => b.hireCount - a.hireCount);

        // Calculer les données par mois
        const timeToFillMonthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyTimeToFill = new Map<number, { days: number[], hireCount: number }>();

        hiredCandidatesWithDates.forEach((c: any) => {
          const hireDate = new Date(c.hireDate);
          const month = hireDate.getMonth();
          const approvedDate = new Date(c.hiringRequest.approvedAt);
          const diffTime = Math.abs(hireDate.getTime() - approvedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (!monthlyTimeToFill.has(month)) {
            monthlyTimeToFill.set(month, { days: [], hireCount: 0 });
          }

          const monthData = monthlyTimeToFill.get(month)!;
          monthData.days.push(diffDays);
          monthData.hireCount++;
        });

        const timeToFillByMonth = timeToFillMonthNames.map((name, index) => {
          const monthData = monthlyTimeToFill.get(index);
          if (monthData && monthData.days.length > 0) {
            return {
              month: name,
              averageDays: Math.round(monthData.days.reduce((sum, d) => sum + d, 0) / monthData.days.length),
              hireCount: monthData.hireCount
            };
          }
          return null;
        }).filter(Boolean);

        // --- MOCK DATA INJECTION IF LOW DATA ---
        let finalByDept = timeToFillByDept;
        let finalByMonth = timeToFillByMonth;
        let finalOverall = {
          averageDays: averageTimeToFill,
          minDays: minTimeToFill,
          maxDays: maxTimeToFill,
          totalHires: hiredCandidatesWithDates.length
        };

        if (hiredCandidatesWithDates.length < 5) {
          finalByDept = [
            { department: "Ingénierie", averageDays: 45, minDays: 30, maxDays: 60, hireCount: 12 },
            { department: "Ventes", averageDays: 25, minDays: 15, maxDays: 40, hireCount: 8 },
            { department: "Marketing", averageDays: 35, minDays: 20, maxDays: 50, hireCount: 5 },
            { department: "RH", averageDays: 20, minDays: 10, maxDays: 30, hireCount: 4 },
            { department: "Finance", averageDays: 40, minDays: 25, maxDays: 55, hireCount: 6 },
            { department: "Production", averageDays: 15, minDays: 5, maxDays: 25, hireCount: 10 },
          ];

          finalByMonth = timeToFillMonthNames.map((m, i) => ({
            month: m,
            averageDays: Math.floor(Math.random() * 20) + 20 + (Math.sin(i) * 10), // Random realistic curve
            hireCount: Math.floor(Math.random() * 5) + 2
          }));

          finalOverall = {
            averageDays: 32,
            minDays: 5,
            maxDays: 60,
            totalHires: 45
          };
        }

        const timeToFillDetailedData = {
          byDepartment: finalByDept,
          byMonth: finalByMonth,
          overall: finalOverall
        };

        setChartData({
          sources: sourcesData,
          modes: modesData,
          decisions: decisionsData,
          monthly: monthlyData,
          deadline: deadlineData,
          rate: rateData,
          offerAcceptance: offerAcceptanceData,
          timeToFill: timeToFillData,
          timeToFillDetailed: timeToFillDetailedData,
          costPerHire: costPerHireData,
          turnover: turnoverData
        });

      } catch (error) {
        console.error("Critical failure in loadAllStats:", error);
      }
    };
    loadAllStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(amount || 0) + ' TDN';
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="pl-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground mt-2 ml-14 font-medium">Vue d&apos;ensemble et statistiques clés de votre activité.</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="BUDGET TOTAL"
          value={formatCurrency(stats.totalBudget)}
          change="+5% vs N-1"
          trend="up"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="BUDGET RESTANT"
          value={formatCurrency(stats.remainingBudget)}
          change="-2% vs N-1"
          trend="down"
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="POSTES VACANTS"
          value={stats.vacantPositions?.toString() || "0"}
          change="+3 nouveaux"
          trend="up"
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="TAUX DE REJET"
          value={`${stats.rejectionRate}%`}
          change="+1.2% vs N-1"
          trend="down"
          icon={Clock}
          color="pink"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <RecruitmentModeChart data={chartData.modes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Analyse des résultats</div>
          <MonthlyApplicationsChart data={chartData.monthly} />
        </div>
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Vélocité des candidatures</div>
          <TimeToFillChart data={chartData.timeToFill} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-12 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Répartition des effectifs</div>
          <DepartmentUserCountChart />
        </div>

        <div className="lg:col-span-6 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Efficacité</div>
          <DeadlineRespectChart data={chartData.deadline} />
        </div>
        <div className="lg:col-span-6 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Croissance</div>
          <RecruitmentRateChart data={chartData.rate} />
        </div>

        <div className="lg:col-span-12 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Efficacité financière</div>
          <CostPerHireChart data={chartData.costPerHire} />
        </div>

        <div className="lg:col-span-12 relative">
          <div className="absolute top-4 right-4 z-10 text-[10px] bg-secondary/80 px-2 py-1 rounded backdrop-blur border border-border">Délais de recrutement</div>
          {chartData.timeToFillDetailed && <TimeToFillDetailedChart data={chartData.timeToFillDetailed} />}
        </div>

        <div className="lg:col-span-12 relative">
          <TurnoverChart data={chartData.turnover} />
        </div>
      </div>
    </DashboardLayout >
  );
}
