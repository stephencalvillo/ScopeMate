export const marketingCopy = {
  homepage: {
    hero: {
      headline:
        "Turn messy project ideas into contractor-ready scopes.",
      subheadline:
        "Start with a rough idea. ScopeBuddy helps you define the details, uncover what's missing, and create a scope contractors can confidently bid on.",
      primaryCta: "Get Started",
      secondaryCta: "I'm a Contractor",
    },
    howItWorks: {
      title: "How it works",
      steps: [
        {
          title: "Describe your project",
          description:
            "Share your renovation idea in everyday language — no construction jargon required.",
        },
        {
          title: "AI builds your scope",
          description:
            "ScopeBuddy asks smart follow-up questions and organizes everything into a clear scope of work.",
        },
        {
          title: "Share with contractors",
          description:
            "Send a professional scope document so every contractor reviews the same project details.",
        },
        {
          title: "Compare with confidence",
          description:
            "Receive apples-to-apples bids and make decisions with a complete picture of the work.",
        },
      ],
    },
    choosePath: {
      title: "Every successful project starts with a clear scope.",
      descriptionLead:
        "Homeowners don't know what to ask. Contractors don't know what's missing.",
      descriptionClosing: "ScopeBuddy bridges the gap.",
      homeowners: {
        headline: "Stop collecting apples-to-oranges bids.",
        description:
          "Create a clear project scope before contacting contractors.",
        cta: "Create a Project",
      },
      contractors: {
        headline: "Win more jobs with less back-and-forth.",
        description:
          "Review scopes, suggest missing items, and generate polished proposals.",
        cta: "Join as a Contractor",
      },
    },
  },
  homeowners: {
    hero: {
      headline:
        "Planning a renovation shouldn't require becoming a construction expert.",
      subheadline:
        "ScopeBuddy helps you turn a rough project idea into a clear, contractor-ready scope of work.",
      cta: "Start your project",
    },
    benefits: [
      {
        title: "Know what questions to ask",
        description:
          "Guided follow-ups surface the details contractors need before they can price your project.",
      },
      {
        title: "Catch missing details before getting bids",
        description:
          "Spot gaps early so you aren't surprised by change orders or incomplete quotes later.",
      },
      {
        title: "Generate a professional scope in minutes",
        description:
          "Turn a rough description into an organized scope document you can share with confidence.",
      },
      {
        title: "Share with contractors instantly",
        description:
          "Send one clear scope to every contractor so everyone is reviewing the same project.",
      },
    ],
    process: {
      steps: ["Project description", "AI questions", "Scope document"],
    },
  },
  contractors: {
    hero: {
      headline:
        "Spend less time clarifying projects and more time winning them.",
      subheadline:
        "ScopeBuddy helps contractors receive cleaner project scopes, identify missing details, and respond with more accurate proposals.",
      cta: "Create contractor profile",
    },
    benefits: [
      {
        title: "Receive cleaner project scopes",
        description:
          "Homeowners arrive with organized project details instead of vague wish lists.",
      },
      {
        title: "Identify missing items instantly",
        description:
          "Review scopes and flag gaps before you invest time in a site visit or proposal.",
      },
      {
        title: "Generate professional proposals",
        description:
          "Respond with polished, scope-aligned proposals that build trust with homeowners.",
      },
      {
        title: "Differentiate yourself from competitors",
        description:
          "Stand out by engaging with well-prepared homeowners who value clarity and professionalism.",
      },
    ],
  },
  signup: {
    homeowner: {
      title: "Describe your project",
      subtitle:
        "ScopeBuddy will organize your description into a list of to-dos to send to a contractor.",
    },
    getStartedContractor: {
      title: "Describe your client's project",
      subtitle:
        "ScopeBuddy will turn your notes into a clear scope you can estimate and share with your client.",
    },
    contractor: {
      title: "Create your contractor profile",
      subtitle:
        "Set up your company profile so homeowners can find you and share project scopes.",
    },
  },
} as const;

export const projectTypes = [
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Whole Home Renovation",
  "Addition or Extension",
  "Roofing",
  "Siding & Exterior",
  "Landscaping & Outdoor",
  "Flooring",
  "Basement Finish",
  "Other",
] as const;

export const tradeTypes = [
  "General Contractor",
  "Kitchen & Bath",
  "Roofing",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Flooring",
  "Painting",
  "Landscaping",
  "Other",
] as const;
