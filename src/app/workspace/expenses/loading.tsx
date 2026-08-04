import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";

const pulse = "bg-white/[0.065]";

function SidebarLoading() {
  return (
    <div className="flex h-full flex-col pt-4" aria-hidden="true">
      <div className="space-y-1">
        {[72, 86, 78, 82].map((width, index) => (
          <div
            key={width}
            className={`flex h-8 items-center gap-3 rounded-md px-2 ${
              index === 2 ? "bg-[#2DD4BF]/8" : ""
            }`}
          >
            <Skeleton
              className={`h-4 w-4 shrink-0 ${
                index === 2 ? "bg-[#2DD4BF]/20" : pulse
              }`}
            />
            <Skeleton
              className={`${pulse} h-3 group-data-[collapsible=icon]:hidden`}
              style={{ width }}
            />
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4 group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-4 w-4 bg-[#2DD4BF]/15" />
        <Skeleton className={`mt-3 h-2.5 w-28 ${pulse}`} />
        <Skeleton className={`mt-3 h-2.5 w-full ${pulse}`} />
        <Skeleton className={`mt-1.5 h-2.5 w-4/5 ${pulse}`} />
      </div>
    </div>
  );
}

function FilterLoading() {
  return (
    <section
      className="mt-8 grid gap-2 rounded-xl border border-white/10 bg-[#0B0B0D] p-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_repeat(4,minmax(0,0.75fr))]"
      aria-hidden="true"
    >
      {["72%", "42%", "52%", "48%", "38%"].map((width, index) => (
        <div key={width} className="rounded-lg border border-white/8 bg-[#08080A] p-3">
          <Skeleton className={`h-2 w-12 ${pulse}`} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <Skeleton className={`h-3 ${pulse}`} style={{ width }} />
            {index > 0 ? <Skeleton className={`h-3 w-3 ${pulse}`} /> : null}
          </div>
        </div>
      ))}
    </section>
  );
}

function MetricsLoading() {
  return (
    <section
      className="mt-3 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-5"
      aria-hidden="true"
    >
      {["54%", "36%", "48%", "30%", "34%"].map((width, index) => (
        <div key={width} className="min-h-32 bg-[#0B0B0D] p-5">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className={`h-2.5 w-20 ${pulse}`} />
            <Skeleton
              className={`h-8 w-8 rounded-lg ${
                index === 4 ? "bg-amber-300/10" : "bg-[#2DD4BF]/10"
              }`}
            />
          </div>
          <Skeleton className={`mt-5 h-7 ${pulse}`} style={{ width }} />
          <Skeleton className={`mt-3 h-2.5 w-3/4 ${pulse}`} />
        </div>
      ))}
    </section>
  );
}

function PanelHeading() {
  return (
    <div aria-hidden="true">
      <Skeleton className={`h-4 w-32 ${pulse}`} />
      <Skeleton className={`mt-2 h-2.5 w-56 max-w-[80%] ${pulse}`} />
    </div>
  );
}

function AreaChartLoading() {
  return (
    <div className="relative mt-7 h-[276px] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-7 top-2 flex flex-col justify-between">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-t border-white/[0.055]" />
        ))}
      </div>
      <Skeleton className="absolute inset-x-8 bottom-8 h-[72%] rounded-none bg-[#2DD4BF]/[0.09] [clip-path:polygon(0_82%,8%_72%,18%_78%,29%_48%,39%_58%,50%_34%,61%_46%,72%_20%,83%_31%,92%_9%,100%_16%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-7 bottom-0 flex justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className={`h-2 w-8 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

function DonutChartLoading() {
  return (
    <div aria-hidden="true">
      <div className="flex h-[276px] items-center justify-center">
        <Skeleton className="relative h-44 w-44 rounded-full bg-[#2DD4BF]/[0.11]">
          <span className="absolute inset-[34px] rounded-full border border-white/5 bg-[#0B0B0D]" />
        </Skeleton>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/8 pt-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 shrink-0 bg-[#2DD4BF]/15" />
            <Skeleton className={`h-2.5 flex-1 ${pulse}`} />
            <Skeleton className={`h-2.5 w-6 ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarsLoading() {
  const widths = [48, 61, 69, 76, 84, 92];
  return (
    <div className="mt-7 flex h-[256px] flex-col justify-between py-2" aria-hidden="true">
      {widths.map((width) => (
        <div key={width} className="flex items-center gap-4">
          <Skeleton className={`h-2.5 w-20 shrink-0 ${pulse}`} />
          <Skeleton
            className="h-4 rounded-r bg-[#2DD4BF]/[0.11]"
            style={{ width: `${width}%` }}
          />
        </div>
      ))}
      <div className="ml-24 flex justify-between border-t border-white/[0.055] pt-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className={`h-2 w-7 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}

function QualityBarsLoading() {
  return (
    <div className="relative mt-7 flex h-[256px] items-end justify-around border-b border-white/[0.055] px-8 pb-7" aria-hidden="true">
      {[68, 43, 27].map((height, index) => (
        <div key={height} className="flex h-full w-20 flex-col items-center justify-end gap-3">
          <Skeleton
            className={`w-14 rounded-t ${index === 1 ? "bg-amber-300/10" : pulse}`}
            style={{ height: `${height}%` }}
          />
          <Skeleton className={`h-2.5 w-16 shrink-0 ${pulse}`} />
        </div>
      ))}
    </div>
  );
}

function ChartPanelLoading({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0B0D] p-5 sm:p-6">
      <PanelHeading />
      {children}
    </div>
  );
}

function AttentionLoading() {
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-amber-300/15 bg-[#0B0B0D]" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
        <PanelHeading />
        <Skeleton className="h-7 w-7 rounded-lg bg-amber-300/10" />
      </div>
      <div className="grid divide-y divide-white/8 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className={`h-3 w-28 ${pulse}`} />
              <Skeleton className={`h-3 w-16 ${pulse}`} />
            </div>
            <Skeleton className={`mt-3 h-2.5 w-36 ${pulse}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LedgerLoading() {
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-5 sm:px-6">
        <PanelHeading />
        <Skeleton className={`h-3 w-24 ${pulse}`} />
      </div>
      <div className="overflow-hidden">
        <div className="grid min-w-[780px] grid-cols-[0.7fr_1.4fr_1fr_0.8fr_0.9fr_0.7fr] gap-5 border-b border-white/8 px-6 py-3">
          {[48, 56, 52, 50, 44, 46].map((width) => (
            <Skeleton key={width} className={`h-2 ${pulse}`} style={{ width: `${width}%` }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="grid min-w-[780px] grid-cols-[0.7fr_1.4fr_1fr_0.8fr_0.9fr_0.7fr] items-center gap-5 border-b border-white/[0.055] px-6 py-4 last:border-b-0"
          >
            <Skeleton className={`h-3 w-20 ${pulse}`} />
            <div>
              <Skeleton className={`h-3 w-32 ${pulse}`} />
              <Skeleton className={`mt-2 h-2.5 w-44 ${pulse}`} />
            </div>
            <Skeleton className={`h-8 w-24 rounded-lg ${pulse}`} />
            <Skeleton className={`h-3 w-14 ${pulse}`} />
            <Skeleton className={`h-3 w-20 ${pulse}`} />
            <Skeleton className={`h-8 w-16 rounded-lg ${pulse}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ExpensesLoading() {
  return (
    <>
      <WorkspaceSidebar>
        <SidebarLoading />
      </WorkspaceSidebar>

      <SidebarInset className="min-h-dvh bg-[#050505]">
        <div className="nexus-page min-h-dvh bg-[#050505] text-white" aria-busy="true">
          <span className="sr-only">Loading expense dashboard</span>
          <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

          <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-[#A1A1AA] hover:bg-white/5" />
              <div aria-hidden="true">
                <Skeleton className={`h-3.5 w-20 ${pulse}`} />
                <Skeleton className={`mt-2 hidden h-2.5 w-28 sm:block ${pulse}`} />
              </div>
            </div>
            <Skeleton className={`h-9 w-24 rounded-lg ${pulse}`} />
          </header>

          <main className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-8 sm:px-7 sm:pt-10 lg:px-10 lg:pb-20">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" aria-hidden="true">
              <div className="w-full max-w-3xl">
                <Skeleton className="h-2.5 w-44 bg-[#2DD4BF]/15" />
                <Skeleton className={`mt-4 h-11 w-[31rem] max-w-[88%] ${pulse}`} />
                <Skeleton className={`mt-5 h-3 w-[38rem] max-w-full ${pulse}`} />
                <Skeleton className={`mt-2 h-3 w-[29rem] max-w-[84%] ${pulse}`} />
              </div>
              <Skeleton className="h-10 w-32 rounded-lg bg-[#2DD4BF]/10" />
            </section>

            <FilterLoading />
            <MetricsLoading />

            <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
              <ChartPanelLoading><AreaChartLoading /></ChartPanelLoading>
              <ChartPanelLoading><DonutChartLoading /></ChartPanelLoading>
            </section>

            <section className="mt-3 grid gap-3 xl:grid-cols-2">
              <ChartPanelLoading><HorizontalBarsLoading /></ChartPanelLoading>
              <ChartPanelLoading><QualityBarsLoading /></ChartPanelLoading>
            </section>

            <AttentionLoading />
            <LedgerLoading />
          </main>
        </div>
      </SidebarInset>
    </>
  );
}
