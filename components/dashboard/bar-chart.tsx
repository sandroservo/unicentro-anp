"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function DashboardBarChart({
  categories,
  data,
  label = "Total",
}: {
  categories: string[];
  data: number[];
  label?: string;
}) {
  const options: ApexOptions = {
    colors: ["#3a9e6e"], // aproxima o primary verde do tema
    chart: { fontFamily: "inherit", type: "bar", height: 220, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "45%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: "#94a3b8" } } },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 4, yaxis: { lines: { show: true } } },
    legend: { show: false },
    tooltip: { y: { formatter: (v: number) => `${v}` } },
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <ReactApexChart options={options} series={[{ name: label, data }]} type="bar" height={220} />
    </div>
  );
}
