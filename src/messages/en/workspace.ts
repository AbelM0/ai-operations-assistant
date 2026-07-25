export const workspace = {
  workspace: {
    privateLibrary: "Your private operations library",
    setup: "Workspace setup · 0 of 4 complete",
    startWithDocument: "Start with one document, {{name}}.",
    setupDescription:
      "NexusOps turns a business file into a searchable source, a clear summary, and answers you can trace back to the page.",
    aboutTwoMinutes: "About two minutes to begin",
    firstWorkflow: "Your first workflow",
    uploadToAnswer: "From upload to grounded answer",
    chooseFirstSource: "Choose a useful first source",
    chooseFirstSourceHint:
      "Pick something connected to a question you already need to answer.",
    dashboard: "Workspace dashboard",
    firstSourceReceived: "First source received",
    firstUnderway: "Your first workflow is underway.",
    greeting: "Good to see you, {{name}}.",
    dashboardDescription:
      "Your ready documents, recent conversations, and next actions are collected here.",
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
        title: "Review the document",
        body:
          "Open the preview and generate a streamed summary of the important material.",
      },
      ask: {
        title: "Ask with evidence",
        body:
          "Select one or more ready documents, ask a question, and verify the cited sources.",
      },
    },
    firstSource: {
      stepComplete: "Step 02 complete",
      stepProgress: "Step 02 in progress",
      readyTitle: "Your first source is ready",
      preparingTitle: "Nexus is preparing your first source",
      readyBody:
        "Open the document to preview it or generate a summary, then select it in Ask Nexus for your first cited answer.",
      preparingBody:
        "{{name}} will become available for preview, summarization, and chat when processing finishes.",
      view: "View document",
    },
    metrics: {
      aria: "Workspace summary",
      totalSources: "Total sources",
      readyToAsk: "Ready to ask",
      processing: "Processing",
      conversations: "Conversations",
      searchableDocument: "searchable document",
      searchableDocuments: "searchable documents",
      preparingNow: "preparing now",
      queueClear: "queue is clear",
      savedInAsk: "saved in Ask Nexus",
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
