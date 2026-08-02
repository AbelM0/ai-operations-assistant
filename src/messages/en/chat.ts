export const chat = {
  chat: {
    newConversation: "New conversation",
    newChat: "New chat",
    questionPlaceholder: "Ask a question about the selected documents…",
    questionLabel: "Ask a question about selected documents",
    send: "Send question",
    stop: "Stop generating",
    selectSource: "Select at least one document or tag.",
    selectDocument: "Select at least one document to continue",
    noConversations: "No conversations yet",
    sources: "Sources",
    selectedSources: "Selected sources",
    recentConversations: "Recent conversations",
    headerDescription: "Answers grounded in the sources you choose",
    emptyTitle: "What do you need to know?",
    emptyDescription:
      "Ask across the selected documents. You can change the source set at any point in the conversation.",
    chooseTitle: "Choose what Nexus can read.",
    chooseDescription:
      "Select one or more documents for this conversation. You can change the selection later.",
    start: "Start chat",
    workspaceDocuments: "Workspace documents",
    searchDocuments: "Search documents",
    readyForQuestions: "{{count}} ready for questions",
    readyToUse: "Ready to use",
    selected: "{{count}} selected",
    sourceSelected: "{{count}} source selected",
    sourcesSelected: "{{count}} sources selected",
    documentContext: "{{count}} document in context",
    documentContext_other: "{{count}} documents in context",
    selectReadyDocument: "Select at least one ready document",
    changeContext: "Change document context",
    updateContext: "Update context",
    chooseContext: "Choose document context",
    chooseContextDescription:
      "Add or remove sources without clearing this conversation.",
    verification:
      "Answers should be verified against the cited source passages.",
    evidence: {
      title: "Evidence",
      description: "Supporting evidence for source {{source}}.",
      usedToSupport: "Used to support this answer",
      passage: "Supporting passage",
      page: "Page {{page}}",
      unavailable:
        "The supporting passage is unavailable. You can still open the source document.",
      openInDocument: "Open in document",
      copyPassage: "Copy passage",
      copied: "Copied",
      copySuccess: "Passage copied to the clipboard.",
      copyError: "The passage could not be copied.",
      previous: "View previous source",
      next: "View next source",
      position: "{{current}} of {{total}}",
      citationAria:
        "View source {{source}} from {{document}}.",
      citationAriaWithPage:
        "View source {{source}} from {{document}}, page {{page}}.",
    },
    promptFacts: "What are the most important facts in these documents?",
    promptDates: "Which dates and deadlines should I know about?",
    promptAmounts: "Find any amounts, fees, or payment terms.",
    promptConflicts: "Where do these documents disagree?",
    loadingConversation: "The conversation could not be loaded.",
    deleteDialogTitle: "Delete this conversation?",
    deleteDialogDescription:
      "“{{title}}” and every message in it will be permanently removed.",
    deleting: "Deleting…",
    deletePermanently: "Delete permanently",
    deletingConversation: "The conversation could not be deleted.",
    emptyWorkspace: "Your workspace has no documents yet.",
    noSearchResults: "No documents match that search.",
    deleteConversation: "Delete conversation",
    deleteConversationAria: "Delete conversation: {{title}}",
    historyEmpty: "Your recent conversations will appear here.",
    libraryHint:
      "Choose from {{count}} stored document and keep the answer grounded.",
    libraryHint_other:
      "Choose from {{count}} stored documents and keep the answer grounded.",
    progress: {
      validating: {
        label: "Checking selected documents",
        detail: "Confirming that every source is ready for this workspace.",
      },
      loading: {
        label: "Loading conversation context",
        detail: "Preparing recent messages and the selected source set.",
      },
      retrieving: {
        label: "Searching selected documents",
        detail:
          "Building grounded context from the most relevant passages.",
      },
      generating: {
        label: "Writing grounded answer",
        detail:
          "Preparing the cited response from the retrieved sources.",
      },
    },
  },
} as const;
