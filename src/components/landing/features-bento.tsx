export function FeaturesBento() {
  const features = [
    {
      title: "Upload & Process Any Document",
      description:
        "Drag and drop invoices, receipts, or PDFs. Our OCR extracts every detail from scanned documents, no matter the quality.",
      image: "https://picsum.photos/seed/doc-upload/800/500",
      span: "col-span-2",
      accent: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "Chat With Your Documents",
      description:
        "Ask questions in natural language. \"What was the total spent on supplies last quarter?\" Get answers instantly.",
      image: "https://picsum.photos/seed/ai-chat/400/300",
      span: "col-span-1",
      accent: "from-violet-500/20 to-violet-500/5",
    },
    {
      title: "Automatic Expense Reports",
      description:
        "Vendor names, amounts, dates, and categories extracted automatically. Export summaries in one click.",
      image: "https://picsum.photos/seed/expenses/400/300",
      span: "col-span-1",
      accent: "from-amber-500/20 to-amber-500/5",
    },
    {
      title: "English & Amharic",
      description:
        "Switch between languages instantly. The AI understands and responds in both English and Amharic, respecting your preference.",
      image: "https://picsum.photos/seed/bilingual/800/500",
      span: "col-span-2",
      accent: "from-sky-500/20 to-sky-500/5",
    },
  ];

  return (
    <section id="features" className="bg-zinc-950 px-6 py-32 md:py-48">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-white">
            Everything your
            <br />
            business needs
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Four powerful capabilities in one streamlined platform.
          </p>
        </div>

        <div className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-700 hover:bg-white/[0.06] sm:p-8 ${f.span}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {f.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                    {f.description}
                  </p>
                </div>
                <div className="mt-8 overflow-hidden rounded-2xl">
                  <img
                    src={f.image}
                    alt=""
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      filter: "grayscale(0.2) contrast(1.1)",
                      aspectRatio: f.span === "col-span-2" ? "16/7" : "4/3",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
