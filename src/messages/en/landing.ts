export const landing = {
  landing: {
    eyebrow: "Document intelligence for real operations",
    heroBefore: "Ask your documents.",
    heroAfter: "Keep the evidence close.",
    description:
      "Upload PDFs and scanned images, review streamed summaries, then ask questions across the sources you choose. Nexus keeps every answer grounded in your workspace.",
    openWorkspace: "Open your workspace",
    createWorkspace: "Create your workspace",
    exploreCapabilities: "Explore capabilities",
    nexusWorkspace: "Nexus workspace",
    sourcesSelected: "3 sources selected",
    documentStream: "Document stream",
    addDocument: "Add document",
    dropFiles: "Drop business files here",
    groundedInThree: "Grounded in the 3 documents you selected",
    sampleQuestion: "Summarize the main obligations in these documents.",
    sampleAnswer:
      "The documents establish three main obligations: monthly delivery reporting [S1], payment within 30 days [S2], and written notice before schedule changes [S3].",
    followUpPlaceholder: "Ask a follow-up about the selected documents…",
    selectedSource: "Selected source",
    askHistory: "Ask Nexus history",
    continueThread: "Continue the thread",
    sourcePage: "{{source}} · page {{page}}",
    footerEyebrow: "Your next grounded answer starts here",
    footerTitle: "Give your documents a place to answer back.",
    dashboardReady: "Your document dashboard is ready",
    uploadAfterSignup: "Upload your first source after sign-up",
    features: {
      headingLineOne: "Less document work.",
      headingLineTwo: "More verifiable answers.",
      intro:
        "One workspace connects document processing, streamed summaries, selected-source chat, citations, and conversation history.",
      upload: {
        title: "Upload",
        description: "Add a PDF or scanned image to your private workspace.",
        detail:
          "Nexus extracts text, preserves page context, and prepares the source for search.",
      },
      review: {
        title: "Review",
        description:
          "Preview the file and generate a readable document summary.",
        detail:
          "Long documents are compressed in stages and the final summary streams as it is written.",
      },
      ask: {
        title: "Ask",
        description: "Choose exactly which ready documents Nexus can use.",
        detail:
          "Semantic and keyword retrieval find relevant passages before the answer begins.",
      },
      continue: {
        title: "Continue",
        description:
          "Return to saved conversations without losing document context.",
        detail:
          "Add or remove sources during a chat and keep every response tied to citations.",
      },
      searchableTitle: "Scanned files become searchable sources",
      searchableBody:
        "Nexus processes PDFs and images, tracks document status, and keeps page references available for retrieval.",
      summaryTitle: "Read the document without reading every page.",
      summaryBody:
        "Generate a structured summary and watch it stream into the document view as the model writes.",
      summaryPrompt: "Summarize the main topics and obligations.",
      mainTopics: "Main topics",
      mainTopicsResult:
        "Reporting duties, payment terms, and termination conditions…",
      continueTitle: "Continue where the question left off.",
      continueBody:
        "Saved conversation history keeps previous answers and source selections within reach.",
      conversations: {
        contract: "Contract obligations",
        report: "Q2 report summary",
        payment: "Supplier payment terms",
      },
      sourceCount: "{{count}} source",
      sourceCount_other: "{{count}} sources",
      verifyTitle: "Answers you can verify.",
      verifyBody:
        "Every response stays grounded in your workspace and keeps the source document close at hand.",
      safeguards: {
        isolated: "User-isolated retrieval",
        selected: "Selected-source context",
        citations: "Page-aware citations",
      },
      workflowTitle: "One connected workflow.",
      workflowBody:
        "From raw file to a saved, source-grounded conversation.",
    },
    marquee: {
      ocr: "Document OCR",
      selectedChat: "Selected-source chat",
      groundedAnswers: "Source-backed answers",
      history: "Conversation history",
      retrieval: "Hybrid retrieval",
      citations: "Page-aware citations",
      summaries: "Automatic summaries",
      streaming: "Live response streaming",
    },
    showcase: {
      intro:
        "Your documents should not disappear into storage. Nexus keeps them readable, searchable, and available for questions with evidence attached.",
      prepare: {
        title: "Prepare the source.",
        description:
          "Upload a PDF or image. Nexus extracts its text, keeps page context, and reports when the file is ready to use.",
        outcome: "A searchable document with visible status",
      },
      review: {
        title: "Review without the long wait.",
        description:
          "Open the document preview and request a structured summary. Progress appears immediately and the final response streams into view.",
        outcome: "A readable summary beside the source",
      },
      ask: {
        title: "Ask, verify, and return.",
        description:
          "Choose the documents for each conversation, follow inline citations, and continue saved chats from the Ask Nexus history.",
        outcome: "Answers with continuity and evidence",
      },
      fileTypes: {
        invoice: "Invoice",
        receipt: "Receipt",
        contract: "Contract",
        ledger: "Ledger",
      },
      sampleQuestion: "What notice period applies before termination?",
      sampleAnswer:
        "The agreement requires 30 days' written notice before termination, except where the breach provisions permit immediate action [S1].",
      conversationOne: "Contract obligations",
      conversationTwo: "Quarterly report topics",
      conversationThree: "Payment and renewal terms",
      selectedSourceCount: "{{count}} selected source",
      selectedSourceCount_other: "{{count}} selected sources",
      heading: "From uploaded file to cited conversation.",
      subheading:
        "Three connected moments, with the source visible throughout.",
    },
    proof: {
      eyebrow: "Designed around verification",
      title: "Useful AI keeps its working set in view.",
      intro:
        "NexusOps does not hide document selection, retrieval, or citations behind a single loading state. Each stage is visible, and every conversation remains attached to the workspace that produced it.",
      visible: {
        title: "The source stays visible",
        body:
          "Preview the original document beside its status, metadata, and generated summary.",
      },
      progress: {
        title: "The wait has a visible state",
        body:
          "Retrieval and summary preparation report progress before model text begins streaming.",
      },
      context: {
        title: "The conversation keeps context",
        body:
          "Choose documents before chatting, adjust the selection later, and return through saved history.",
      },
      response: "Grounded response",
      retrievalSummary: "2 selected documents · 3 retrieved passages",
      streaming: "Streaming",
      sampleAnswer:
        "The policy requires written approval before an exception can be applied [S1]. It also assigns the final review to the operations lead [S2].",
      policySource: "Policy handbook · page 12",
      procedureSource: "Review procedure · page 3",
    },
  },
} as const;
