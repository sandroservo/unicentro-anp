"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

export function DashboardBarChart({
  categories,
  data,
  label = "Total",
}: {
  categories: string[];
  data: number[];
  label?: string;
}) {
  const isDark = useIsDark();
  const labelColor = isDark ? "#ffffff" : "#334155";
  const gridColor = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";

  const options: ApexOptions = {
    colors: ["#3a9e6e"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 220,
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: categories.map(() => labelColor) } },
    },
    yaxis: {
      labels: { style: { colors: labelColor } },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (v: number) => `${v}` } },
    theme: { mode: isDark ? "dark" : "light" },
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <ReactApexChart
        key={isDark ? "dark" : "light"}
        options={options}
        series={[{ name: label, data }]}
        type="bar"
        height={220}
      />
    </div>
  );
}
