export const workspace = {
  workspace: {
    privateLibrary: "Your private operations library",
    setup: "Workspace setup · 0 of 4 complete",
    startWithDocument: "Start with one document, {{name}}.",
    setupDescription:
      "NexusOps turns a business file into searchable evidence, reviewed operational data, tracked expenses, and answers you can trace to the page.",
    aboutTwoMinutes: "About two minutes to begin",
    firstWorkflow: "Your first workflow",
    uploadToAnswer: "From upload to verified operations",
    chooseFirstSource: "Choose a useful first source",
    chooseFirstSourceHint:
      "Pick something connected to a question you already need to answer.",
    dashboard: "Workspace dashboard",
    firstSourceReceived: "First source received",
    firstUnderway: "Your first workflow is underway.",
    greeting: "Good to see you, {{name}}.",
    dashboardDescription:
      "Monitor document processing, extraction review, expense activity, and source-grounded work from one place.",
    firstSourcePreparing:
      "Nexus is preparing the document for preview, summaries, and source-grounded questions.",
    processingDescription:
      "{{count}} document is still being prepared. Ready sources can already be used in Ask Nexus.",
    processingDescription_other:
      "{{count}} documents are still being prepared. Ready sources can already be used in Ask Nexus.",
    failedAttention:
      "{{count}} document needs attention before it can be searched.",
    failedAttention_other:
      "{{count}} documents need attention before they can be searched.",
    uploadDocument: "Upload a document",
    uploadDescription:
      "Add another invoice, receipt, or business document to your workspace.",
    guidance: {
      invoices: {
        title: "Invoices",
        body: "Track vendors, totals, due dates, and tax details.",
      },
      receipts: {
        title: "Receipts",
        body: "Capture expenses and keep source records together.",
      },
      business: {
        title: "Business documents",
        body: "Search contracts, reports, statements, and policies.",
      },
    },
    workflow: {
      add: {
        title: "Add a source",
        body: "Upload a PDF or image from your day-to-day operations.",
      },
      index: {
        title: "Let Nexus index it",
        body:
          "OCR, page structure, and searchable chunks are prepared automatically.",
      },
      review: {
        title: "Review extracted details",
        body:
          "Verify document type, dates, amounts, and page-level evidence before confirming the record.",
      },
      ask: {
        title: "Use the verified record",
        body:
          "Promote expenses, export a formatted summary, or ask questions with cited source evidence.",
      },
    },
    firstSource: {
      stepComplete: "Step 02 complete",
      stepProgress: "Step 02 in progress",
      stepFailed: "Processing needs attention",
      readyTitle: "Your first source is ready",
      failedTitle: "Your first source could not be processed",
      preparingTitle: "Nexus is preparing your first source",
      readyBody:
        "Open the document to review extracted fields and evidence, generate a formatted summary, or promote a verified expense.",
      preparingBody:
        "{{name}} will become available for preview, summarization, and chat when processing finishes.",
      failedBody:
        "Open the document record to review the processing error and decide whether to upload it again.",
      view: "View document",
      processing: "Processing document",
    },
    metrics: {
      aria: "Workspace summary",
      totalSources: "Total sources",
      readyToAsk: "Ready to ask",
      processing: "Processing",
      conversations: "Conversations",
      reviewQueue: "Review queue",
      expenses: "Expenses",
      searchableDocument: "searchable document",
      searchableDocuments: "searchable documents",
      preparingNow: "preparing now",
      queueClear: "queue is clear",
      savedInAsk: "saved in Ask Nexus",
      awaitingReview: "awaiting field review",
      reviewClear: "review queue is clear",
      trackedExpenses: "tracked from documents",
    },
    operations: {
      eyebrow: "Operations pulse",
      title: "Next actions",
      description: "Move records from processing to verified operational data.",
      extractionReview: "Extraction review",
      extractionReviewPending: "{{count}} document records need verification",
      extractionReviewClear: "All extracted records are reviewed",
      expenseReview: "Expense attention",
      expenseReviewPending: "{{count}} expense records need attention",
      expenseReviewClear: "No expense records need attention",
      readyToAsk: "Ready for questions",
      readyToAskDetail: "{{count}} indexed documents can support answers",
    },
    expenseActivity: {
      title: "Recent expenses",
      description: "Latest records promoted from verified documents.",
      viewDashboard: "Expense dashboard",
      empty: "Verified expenses will appear here after promotion.",
    },
    conversations: {
      title: "Ask Nexus",
      description:
        "Continue a saved conversation or start with new sources.",
      empty:
        "Your source-grounded conversations will appear here.",
      openHistory: "Open conversation history",
      startFirst: "Start your first chat",
    },
    recentDocuments: {
      title: "Recent documents",
      description:
        "Open a source to preview, summarize, or check its status.",
      viewAll: "View all",
    },
    libraryCount: "Your library contains {{count}} document.",
    libraryCount_other: "Your library contains {{count}} documents.",
    emptyLibraryHint: "Add your first source to activate document search.",
  },
} as const;
