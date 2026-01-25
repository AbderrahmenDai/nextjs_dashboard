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
  DepartmentUserCountChart
} from "@/components/Charts";
import { Coins, CreditCard, Clock, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [totalBudget, setTotalBudget] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const sites = await api.getSites();
        const total = sites.reduce((acc: number, site: any) => acc + (Number(site.budget) || 0), 0);
        setTotalBudget(total);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="TOTAL BUDGET"
          value={formatCurrency(totalBudget)}
          change="Annual Allocated"
          trend="neutral"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="COST PER HIRE"
          value="4,700,000 DTN"
          change="Average"
          trend="neutral"
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="MOY. JOURS D'EMBAUCHE"
          value="64.00"
          change="Days"
          trend="down"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="POSTES VACANTS ACTIFS"
          value="1"
          change="Open positions"
          trend="up"
          icon={Briefcase}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Row 1: Pipeline (Large) + Sources */}
        <div className="lg:col-span-8">
          <PipelineRecruitmentChart />
        </div>
        <div className="lg:col-span-4">
          <ApplicationSourcesChart />
        </div>

        {/* Row 2: Mode + Decision + Apps Month */}
        <div className="lg:col-span-4">
          <RecruitmentModeChart />
        </div>
        <div className="lg:col-span-4">
          <FinalDecisionChart />
        </div>
        <div className="lg:col-span-4">
          <MonthlyApplicationsChart />
        </div>

        {/* Row 3: Delays + Rate */}
        <div className="lg:col-span-6">
          <DeadlineRespectChart />
        </div>
        <div className="lg:col-span-6">
          <RecruitmentRateChart />
        </div>

        {/* Row 4: Department Users */}
        <div className="lg:col-span-12">
          <DepartmentUserCountChart />
        </div>
      </div>


    </DashboardLayout>
  );
}
