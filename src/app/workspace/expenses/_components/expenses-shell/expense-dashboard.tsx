"use client";

import {
  ArrowRight,
  ChartDonut,
  DownloadSimple,
  FileText,
  MagnifyingGlass,
  Receipt,
  ShieldCheck,
  TrendUp,
  WarningCircle,
  Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  expenseCategories,
  type ExpenseCategory,
  type ExpenseDashboardData,
  type ExpenseDashboardEntry,
} from "@/lib/expenses/types";

const categoryColors: Record<ExpenseCategory, string> = {
  OFFICE: "#2DD4BF",
  TRANSPORT: "#67E8F9",
  UTILITIES: "#60A5FA",
  FUEL: "#FBBF24",
  RENT: "#A78BFA",
  SALARY: "#FB7185",
  FOOD: "#A3E635",
  OTHER: "#71717A",
};

const periodValues = ["30", "90", "365", "all"] as const;
type PeriodValue = (typeof periodValues)[number];

function dateValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}`;
  }
}

function attentionReason(entry: ExpenseDashboardEntry) {
  if (!entry.documentId) return "missingSource";
  if (entry.category === "OTHER") return "otherCategory";
  if (entry.confidence !== null && entry.confidence < 0.78) {
    return "lowConfidence";
  }
  return null;
}

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function ExpenseDashboard({
  initialData,
  locale,
}: {
  initialData: ExpenseDashboardData;
  locale: string;
}) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState(initialData.entries);
  const currencies = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.currency))).sort(),
    [entries],
  );
  const [currency, setCurrency] = useState(
    currencies.includes(initialData.defaultCurrency)
      ? initialData.defaultCurrency
      : currencies[0] ?? initialData.defaultCurrency,
  );
  const [period, setPeriod] = useState<PeriodValue>("90");
  const [category, setCategory] = useState<ExpenseCategory | "ALL">("ALL");
  const [vendor, setVendor] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [updatingExpenseId, setUpdatingExpenseId] = useState<string | null>(
    null,
  );

  const vendors = useMemo(
    () =>
      Array.from(
        new Set(
          entries
            .filter((entry) => entry.currency === currency)
            .map((entry) => entry.vendor),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [currency, entries],
  );

  const scopeEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return entries.filter((entry) => {
      if (entry.currency !== currency) return false;
      if (category !== "ALL" && entry.category !== category) return false;
      if (vendor !== "ALL" && entry.vendor !== vendor) return false;
      if (
        normalizedQuery &&
        ![entry.vendor, entry.description ?? "", entry.category]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [category, currency, entries, query, vendor]);

  const filteredEntries = useMemo(() => {
    if (period === "all") return scopeEntries;
    const threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
    threshold.setDate(threshold.getDate() - Number(period) + 1);
    return scopeEntries.filter((entry) => {
      const date = dateValue(entry.date);
      return date ? date >= threshold : false;
    });
  }, [period, scopeEntries]);

  const analytics = useMemo(() => {
    const total = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const vendorCount = new Set(filteredEntries.map((entry) => entry.vendor)).size;
    const attention = filteredEntries.filter(attentionReason);
    const categoryMap = new Map<ExpenseCategory, number>();
    const vendorMap = new Map<string, number>();
    const trendMap = new Map<string, number>();
    const monthly = period === "365" || period === "all";

    for (const entry of filteredEntries) {
      categoryMap.set(
        entry.category,
        (categoryMap.get(entry.category) ?? 0) + entry.amount,
      );
      vendorMap.set(entry.vendor, (vendorMap.get(entry.vendor) ?? 0) + entry.amount);
      const date = dateValue(entry.date);
      if (date) {
        const key = monthly
          ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
          : date.toISOString().slice(0, 10);
        trendMap.set(key, (trendMap.get(key) ?? 0) + entry.amount);
      }
    }

    const qualityCounts = { ready: 0, review: 0, missing: 0 };
    for (const entry of filteredEntries) {
      if (!entry.documentId) qualityCounts.missing += 1;
      else if (attentionReason(entry)) qualityCounts.review += 1;
      else qualityCounts.ready += 1;
    }

    return {
      total,
      vendorCount,
      attention,
      average: filteredEntries.length ? total / filteredEntries.length : 0,
      trend: Array.from(trendMap, ([date, amount]) => ({ date, amount })).sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
      categories: Array.from(categoryMap, ([name, amount]) => ({
        name,
        amount,
        fill: categoryColors[name],
      })).sort((a, b) => b.amount - a.amount),
      vendors: Array.from(vendorMap, ([name, amount]) => ({
        name,
        amount,
      }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 7)
        .reverse(),
      quality: [
        { name: "ready", count: qualityCounts.ready, fill: "#2DD4BF" },
        { name: "review", count: qualityCounts.review, fill: "#FBBF24" },
        { name: "missing", count: qualityCounts.missing, fill: "#71717A" },
      ],
    };
  }, [filteredEntries, period]);

  const previousChange = useMemo(() => {
    if (period === "all") return null;
    const days = Number(period);
    const currentStart = new Date();
    currentStart.setHours(0, 0, 0, 0);
    currentStart.setDate(currentStart.getDate() - days + 1);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);
    const previousTotal = scopeEntries.reduce((sum, entry) => {
      const date = dateValue(entry.date);
      return date && date >= previousStart && date < currentStart
        ? sum + entry.amount
        : sum;
    }, 0);
    if (previousTotal === 0) return analytics.total > 0 ? 100 : 0;
    return ((analytics.total - previousTotal) / previousTotal) * 100;
  }, [analytics.total, period, scopeEntries]);

  const selectedExpense = entries.find(
    (entry) => entry.id === selectedExpenseId,
  );

  const updateCategory = async (
    expenseId: string,
    nextCategory: ExpenseCategory,
  ) => {
    const previous = entries;
    setUpdatingExpenseId(expenseId);
    setEntries((current) =>
      current.map((entry) =>
        entry.id === expenseId ? { ...entry, category: nextCategory } : entry,
      ),
    );
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: nextCategory }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || t("expenses.updateFailed"));
      }
      toast.success(t("expenses.categoryUpdated"));
    } catch (error) {
      setEntries(previous);
      toast.error(t("expenses.updateFailed"), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUpdatingExpenseId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      "date",
      "vendor",
      "description",
      "category",
      "amount",
      "currency",
      "confidence",
      "document_id",
    ];
    const rows = filteredEntries.map((entry) =>
      [
        entry.date.slice(0, 10),
        entry.vendor,
        entry.description,
        entry.category,
        entry.amount,
        entry.currency,
        entry.confidence,
        entry.documentId,
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob(
      ["\uFEFF", [headers.join(","), ...rows].join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `nexusops-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (entries.length === 0) {
    return <EmptyExpenses />;
  }

  const categoryConfig = Object.fromEntries(
    expenseCategories.map((item) => [
      item,
      {
        label: t(`expenses.categories.${item.toLowerCase()}`),
        color: categoryColors[item],
      },
    ]),
  ) satisfies ChartConfig;
  const trendConfig = {
    amount: { label: t("expenses.spend"), color: "#2DD4BF" },
  } satisfies ChartConfig;
  const vendorConfig = {
    amount: { label: t("expenses.spend"), color: "#5EEAD4" },
  } satisfies ChartConfig;
  const qualityConfig = {
    ready: { label: t("expenses.quality.ready"), color: "#2DD4BF" },
    review: { label: t("expenses.quality.review"), color: "#FBBF24" },
    missing: { label: t("expenses.quality.missing"), color: "#71717A" },
  } satisfies ChartConfig;

  return (
    <>
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            {t("expenses.eyebrow")}
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2.25rem,4vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
            {t("expenses.heroTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#A1A1AA] sm:text-base">
            {t("expenses.heroDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredEntries.length === 0}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 px-4 text-xs font-semibold text-[#5EEAD4] transition-colors hover:border-[#2DD4BF]/45 hover:bg-[#2DD4BF]/13 hover:text-white active:translate-y-px disabled:opacity-40"
        >
          <DownloadSimple className="h-4 w-4" weight="bold" />
          {t("expenses.exportCsv")}
        </button>
      </section>

      <section
        aria-label={t("expenses.filters")}
        className="mt-8 grid gap-2 rounded-xl border border-white/10 bg-[#0B0B0D] p-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_repeat(4,minmax(0,0.75fr))]"
      >
        <label className="relative block">
          <span className="sr-only">{t("expenses.search")}</span>
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#71717A]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("expenses.search")}
            className="h-10 border-white/10 bg-[#08080A] pl-9 text-white"
          />
        </label>
        <FilterSelect
          label={t("expenses.period")}
          value={period}
          onChange={(value) => setPeriod(value as PeriodValue)}
          options={periodValues.map((value) => ({
            value,
            label: t(`expenses.periods.${value}`),
          }))}
        />
        <FilterSelect
          label={t("expenses.currency")}
          value={currency}
          onChange={setCurrency}
          options={currencies.map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label={t("expenses.category")}
          value={category}
          onChange={(value) => setCategory(value as ExpenseCategory | "ALL")}
          options={[
            { value: "ALL", label: t("expenses.allCategories") },
            ...expenseCategories.map((value) => ({
              value,
              label: t(`expenses.categories.${value.toLowerCase()}`),
            })),
          ]}
        />
        <FilterSelect
          label={t("expenses.vendor")}
          value={vendor}
          onChange={setVendor}
          options={[
            { value: "ALL", label: t("expenses.allVendors") },
            ...vendors.map((value) => ({ value, label: value })),
          ]}
        />
      </section>

      <section className="mt-3 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={Wallet}
          label={t("expenses.totalSpend")}
          value={formatMoney(analytics.total, currency, locale)}
          detail={
            previousChange === null
              ? t("expenses.allTime")
              : t("expenses.previousChange", {
                  value: Math.abs(previousChange).toFixed(1),
                  direction:
                    previousChange >= 0
                      ? t("expenses.higher")
                      : t("expenses.lower"),
                })
          }
        />
        <MetricCard
          icon={Receipt}
          label={t("expenses.transactions")}
          value={filteredEntries.length.toLocaleString(locale)}
          detail={t("expenses.inSelectedPeriod")}
        />
        <MetricCard
          icon={TrendUp}
          label={t("expenses.averageExpense")}
          value={formatMoney(analytics.average, currency, locale)}
          detail={t("expenses.perTransaction")}
        />
        <MetricCard
          icon={ChartDonut}
          label={t("expenses.activeVendors")}
          value={analytics.vendorCount.toLocaleString(locale)}
          detail={t("expenses.uniqueVendors")}
        />
        <MetricCard
          icon={WarningCircle}
          label={t("expenses.needsAttention")}
          value={analytics.attention.length.toLocaleString(locale)}
          detail={t("expenses.attentionDetail")}
          warning={analytics.attention.length > 0}
        />
      </section>

      {filteredEntries.length === 0 ? (
        <NoResults />
      ) : (
        <>
          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
            <ChartPanel
              title={t("expenses.spendPulse")}
              description={t("expenses.spendPulseDescription")}
            >
              <ChartContainer
                config={trendConfig}
                className="h-[320px] w-full aspect-auto"
              >
                <AreaChart
                  accessibilityLayer
                  data={analytics.trend}
                  margin={{ left: 4, right: 12, top: 12 }}
                >
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={28}
                    tickFormatter={(value) =>
                      period === "365" || period === "all"
                        ? String(value).slice(0, 7)
                        : new Intl.DateTimeFormat(locale, {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(`${value}T00:00:00`))
                    }
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={62}
                    tickFormatter={(value) =>
                      Intl.NumberFormat(locale, {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(Number(value))
                    }
                  />
                  <ChartTooltip
                    cursor={{ stroke: "rgba(94,234,212,0.3)" }}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        formatter={(value) => (
                          <div className="flex min-w-36 items-center justify-between gap-4">
                            <span className="text-[#A1A1AA]">
                              {t("expenses.spend")}
                            </span>
                            <span className="font-mono text-white">
                              {formatMoney(Number(value), currency, locale)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    fill="var(--color-amount)"
                    fillOpacity={0.13}
                    strokeWidth={2}
                    activeDot={{ r: 4, fill: "#99F6E4", stroke: "#07100E" }}
                  />
                </AreaChart>
              </ChartContainer>
            </ChartPanel>

            <ChartPanel
              title={t("expenses.categoryMix")}
              description={t("expenses.categoryMixDescription")}
            >
              <ChartContainer
                config={categoryConfig}
                className="h-[320px] w-full aspect-auto"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        formatter={(value, name) => (
                          <div className="flex min-w-40 items-center justify-between gap-4">
                            <span className="text-[#A1A1AA]">
                              {t(
                                `expenses.categories.${String(name).toLowerCase()}`,
                              )}
                            </span>
                            <span className="font-mono text-white">
                              {formatMoney(Number(value), currency, locale)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={analytics.categories}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {analytics.categories.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/8 pt-4">
                {analytics.categories.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[#A1A1AA]">
                      {t(`expenses.categories.${item.name.toLowerCase()}`)}
                    </span>
                    <span className="font-mono text-[10px] text-[#E4E4E7]">
                      {((item.amount / analytics.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartPanel>
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-2">
            <ChartPanel
              title={t("expenses.vendorConcentration")}
              description={t("expenses.vendorConcentrationDescription")}
            >
              <ChartContainer
                config={vendorConfig}
                className="h-[300px] w-full aspect-auto"
              >
                <BarChart
                  accessibilityLayer
                  data={analytics.vendors}
                  layout="vertical"
                  margin={{ left: 12, right: 16 }}
                >
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.07)" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      Intl.NumberFormat(locale, {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(Number(value))
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={108}
                    tickFormatter={(value) =>
                      String(value).length > 16
                        ? `${String(value).slice(0, 15)}…`
                        : String(value)
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(45,212,191,0.06)" }}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => (
                          <span className="font-mono text-white">
                            {formatMoney(Number(value), currency, locale)}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ChartContainer>
            </ChartPanel>

            <ChartPanel
              title={t("expenses.dataQuality")}
              description={t("expenses.dataQualityDescription")}
            >
              <ChartContainer
                config={qualityConfig}
                className="h-[300px] w-full aspect-auto"
              >
                <BarChart
                  accessibilityLayer
                  data={analytics.quality}
                  margin={{ left: 4, right: 12, top: 18 }}
                >
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tickFormatter={(value) =>
                      t(`expenses.quality.${String(value)}`)
                    }
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(255,255,255,0.035)" }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={54}>
                    {analytics.quality.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </ChartPanel>
          </section>

          {analytics.attention.length > 0 ? (
            <AttentionQueue
              entries={analytics.attention.slice(0, 5)}
              currency={currency}
              locale={locale}
              onOpen={setSelectedExpenseId}
            />
          ) : null}

          <ExpenseLedger
            entries={filteredEntries}
            currency={currency}
            locale={locale}
            updatingExpenseId={updatingExpenseId}
            onCategoryChange={updateCategory}
            onOpen={setSelectedExpenseId}
          />
        </>
      )}

      <ExpenseDetailSheet
        entry={selectedExpense}
        locale={locale}
        onOpenChange={(open) => {
          if (!open) setSelectedExpenseId(null);
        }}
      />
    </>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue);
      }}
      items={options}
    >
      <SelectTrigger
        aria-label={label}
        className="w-full border-white/10 bg-[#08080A] text-xs text-[#D4D4D8] data-[size=default]:h-10"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  warning = false,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <article className="min-w-0 bg-[#0B0B0D] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A]">
          {label}
        </p>
        <Icon
          className={warning ? "h-4 w-4 text-amber-300" : "h-4 w-4 text-[#5EEAD4]"}
          weight="duotone"
        />
      </div>
      <output className="mt-5 block truncate text-2xl font-medium tracking-[-0.04em] text-white">
        {value}
      </output>
      <p className="mt-2 text-[11px] leading-4 text-[#71717A]">{detail}</p>
    </article>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D] p-5 sm:p-6">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-[#71717A]">{description}</p>
      </header>
      {children}
    </article>
  );
}

function AttentionQueue({
  entries,
  currency,
  locale,
  onOpen,
}: {
  entries: ExpenseDashboardEntry[];
  currency: string;
  locale: string;
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-amber-300/15 bg-[#0B0B0D]">
      <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <WarningCircle className="h-4 w-4 text-amber-300" />
            {t("expenses.attentionQueue")}
          </h2>
          <p className="mt-1 text-xs text-[#71717A]">
            {t("expenses.attentionQueueDescription")}
          </p>
        </div>
        <span className="font-mono text-[10px] text-amber-200">
          {entries.length}
        </span>
      </header>
      <div className="divide-y divide-white/7">
        {entries.map((entry) => {
          const reason = attentionReason(entry);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpen(entry.id)}
              className="grid w-full gap-2 px-5 py-3 text-left transition-colors hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-[#E4E4E7]">
                  {entry.vendor}
                </span>
                <span className="mt-1 block text-[10px] text-amber-200/70">
                  {reason ? t(`expenses.attention.${reason}`) : ""}
                </span>
              </span>
              <span className="font-mono text-[10px] text-[#A1A1AA]">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                  new Date(entry.date),
                )}
              </span>
              <span className="font-mono text-xs text-white">
                {formatMoney(entry.amount, currency, locale)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ExpenseLedger({
  entries,
  currency,
  locale,
  updatingExpenseId,
  onCategoryChange,
  onOpen,
}: {
  entries: ExpenseDashboardEntry[];
  currency: string;
  locale: string;
  updatingExpenseId: string | null;
  onCategoryChange: (id: string, category: ExpenseCategory) => void;
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {t("expenses.ledger")}
          </h2>
          <p className="mt-1 text-xs text-[#71717A]">
            {t("expenses.filteredCount", { count: entries.length })}
          </p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5EEAD4]">
          {currency}
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-[#0E0E11] font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
            <tr>
              <th className="px-6 py-3 font-medium">{t("expenses.date")}</th>
              <th className="px-4 py-3 font-medium">{t("expenses.vendor")}</th>
              <th className="px-4 py-3 font-medium">{t("expenses.category")}</th>
              <th className="px-4 py-3 font-medium">{t("expenses.qualityLabel")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("expenses.amount")}</th>
              <th className="px-6 py-3 text-right font-medium">{t("expenses.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/7">
            {entries.slice(0, 100).map((entry) => {
              const reason = attentionReason(entry);
              return (
                <tr key={entry.id} className="hover:bg-white/[0.025]">
                  <td className="px-6 py-4 font-mono text-[10px] text-[#A1A1AA]">
                    {new Intl.DateTimeFormat(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(entry.date))}
                  </td>
                  <td className="max-w-72 px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onOpen(entry.id)}
                      className="block max-w-full text-left"
                    >
                      <span className="block truncate text-xs font-medium text-[#E4E4E7] hover:text-[#5EEAD4]">
                        {entry.vendor}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-[#52525B]">
                        {entry.description || t("expenses.noDescription")}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <Select
                      value={entry.category}
                      disabled={updatingExpenseId === entry.id}
                      onValueChange={(value) => {
                        if (value && value !== entry.category) {
                          onCategoryChange(entry.id, value as ExpenseCategory);
                        }
                      }}
                      items={expenseCategories.map((value) => ({
                        value,
                        label: t(`expenses.categories.${value.toLowerCase()}`),
                      }))}
                    >
                      <SelectTrigger
                        aria-label={t("expenses.changeCategory", {
                          vendor: entry.vendor,
                        })}
                        size="sm"
                        className="w-36 border-white/10 bg-[#111113] text-[10px] text-[#D4D4D8]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {expenseCategories.map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`expenses.categories.${value.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        reason
                          ? "inline-flex rounded-md border border-amber-300/15 bg-amber-300/[0.05] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-amber-200"
                          : "inline-flex rounded-md border border-[#2DD4BF]/20 bg-[#2DD4BF]/7 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[#5EEAD4]"
                      }
                    >
                      {reason
                        ? t(`expenses.attention.${reason}`)
                        : t("expenses.quality.ready")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-xs font-medium text-white">
                    {formatMoney(entry.amount, currency, locale)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {entry.documentId ? (
                        <Link
                          href={`/workspace/documents/${entry.documentId}${
                            entry.evidencePage
                              ? `?page=${entry.evidencePage}`
                              : ""
                          }`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[10px] font-medium text-[#A1A1AA] hover:border-[#2DD4BF]/30 hover:text-[#5EEAD4]"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {t("expenses.source")}
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onOpen(entry.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 px-2.5 text-[10px] font-semibold text-[#5EEAD4] hover:bg-[#2DD4BF]/13 hover:text-white"
                      >
                        {t("expenses.inspect")}
                        <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {entries.length > 100 ? (
        <p className="border-t border-white/8 px-6 py-3 text-xs text-[#71717A]">
          {t("expenses.showingFirst", { count: 100, total: entries.length })}
        </p>
      ) : null}
    </section>
  );
}

function ExpenseDetailSheet({
  entry,
  locale,
  onOpenChange,
}: {
  entry: ExpenseDashboardEntry | undefined;
  locale: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Sheet open={Boolean(entry)} onOpenChange={onOpenChange}>
      <SheetContent
        side="responsive"
        className="w-full border-white/10 bg-[#0B0B0D] sm:max-w-lg"
      >
        {entry ? (
          <>
            <SheetHeader className="border-b border-white/8 px-6 py-5">
              <SheetTitle className="pr-10 text-lg text-white">
                {entry.vendor}
              </SheetTitle>
              <SheetDescription>
                {t("expenses.drawerDescription")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
                {[
                  [t("expenses.amount"), formatMoney(entry.amount, entry.currency, locale)],
                  [
                    t("expenses.date"),
                    new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(new Date(entry.date)),
                  ],
                  [
                    t("expenses.category"),
                    t(`expenses.categories.${entry.category.toLowerCase()}`),
                  ],
                  [
                    t("expenses.confidence"),
                    entry.confidence === null
                      ? t("expenses.notAvailable")
                      : `${Math.round(entry.confidence * 100)}%`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#111113] p-4">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                      {label}
                    </dt>
                    <dd className="mt-2 text-sm text-[#E4E4E7]">{value}</dd>
                  </div>
                ))}
              </dl>

              <section className="mt-6">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                  {t("expenses.description")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#D4D4D8]">
                  {entry.description || t("expenses.noDescription")}
                </p>
              </section>

              <section className="mt-6">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                  {t("expenses.sourceEvidence")}
                </h3>
                <div className="mt-2 rounded-lg border border-[#2DD4BF]/15 bg-[#07100E] p-4">
                  <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-[#B9C4C1]">
                    {entry.sourceText || t("expenses.noEvidence")}
                  </p>
                </div>
              </section>

              {entry.documentId ? (
                <Link
                  href={`/workspace/documents/${entry.documentId}${
                    entry.evidencePage ? `?page=${entry.evidencePage}` : ""
                  }`}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#DDFBF5] px-4 text-xs font-semibold text-[#08211C] hover:bg-white"
                >
                  <FileText className="h-4 w-4" />
                  {entry.evidencePage
                    ? t("expenses.openEvidencePage", {
                        page: entry.evidencePage,
                      })
                    : t("expenses.openSource")}
                  <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EmptyExpenses() {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-[68dvh] items-center justify-center">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/8 text-[#5EEAD4]">
          <ShieldCheck className="h-7 w-7" weight="duotone" />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5EEAD4]">
          {t("expenses.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
          {t("expenses.emptyTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#8B8B95]">
          {t("expenses.emptyDescription")}
        </p>
        <Link
          href="/workspace/documents"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] hover:bg-[#5EEAD4]"
        >
          <Receipt className="h-4 w-4" />
          {t("expenses.reviewDocuments")}
          <ArrowRight className="h-4 w-4" weight="bold" />
        </Link>
      </div>
    </section>
  );
}

function NoResults() {
  const { t } = useTranslation();
  return (
    <section className="mt-3 flex min-h-72 flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B0B0D] px-6 text-center">
      <MagnifyingGlass className="h-6 w-6 text-[#52525B]" />
      <h2 className="mt-4 text-sm font-semibold text-white">
        {t("expenses.noResults")}
      </h2>
      <p className="mt-2 max-w-sm text-xs leading-5 text-[#71717A]">
        {t("expenses.noResultsDescription")}
      </p>
    </section>
  );
}
