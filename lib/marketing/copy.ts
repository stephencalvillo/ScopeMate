export const marketingCopy = {
  homepage: {
    hero: {
      headline:
        "ScopeMate turns messy project ideas into contractor-ready scopes.",
      subheadline:
        "Start with a rough idea. ScopeMate helps you define the details, uncover what's missing, and create a scope contractors can confidently bid on.",
      primaryCta: "Get Started",
      secondaryCta: "I'm a Contractor",
    },
    howItWorks: {
      title: "How It Works",
      steps: [
        {
          title: "Describe Your Project",
          description:
            "Share your renovation idea in everyday language — no construction jargon required.",
        },
        {
          title: "AI Builds Your Scope",
          description:
            "ScopeMate asks smart follow-up questions and organizes everything into a clear scope of work.",
        },
        {
          title: "Share With Contractors",
          description:
            "Send a professional scope document so every contractor reviews the same project details.",
        },
        {
          title: "Compare With Confidence",
          description:
            "Receive apples-to-apples bids and make decisions with a complete picture of the work.",
        },
      ],
    },
    choosePath: {
      title: "Choose Your Path",
      homeowners: {
        headline: "Stop Collecting Apples-to-Oranges Bids.",
        description:
          "Create a clear project scope before contacting contractors.",
        cta: "Create a Project",
      },
      contractors: {
        headline: "Win More Jobs With Less Back-and-Forth.",
        description:
          "Review scopes, suggest missing items, and generate polished proposals.",
        cta: "Join as a Contractor",
      },
    },
    problemStatement:
      "Homeowners don't know what to ask. Contractors don't know what's missing. ScopeMate bridges the gap.",
    finalCta: {
      headline: "Every Successful Project Starts With a Clear Scope.",
      cta: "Get Started",
    },
  },
  homeowners: {
    hero: {
      headline:
        "Planning a renovation shouldn't require becoming a construction expert.",
      subheadline:
        "ScopeMate helps you turn a rough project idea into a clear, contractor-ready scope of work.",
      cta: "Start Your Project",
    },
    benefits: [
      {
        title: "Know What Questions to Ask",
        description:
          "Guided follow-ups surface the details contractors need before they can price your project.",
      },
      {
        title: "Catch Missing Details Before Getting Bids",
        description:
          "Spot gaps early so you aren't surprised by change orders or incomplete quotes later.",
      },
      {
        title: "Generate a Professional Scope in Minutes",
        description:
          "Turn a rough description into an organized scope document you can share with confidence.",
      },
      {
        title: "Share With Contractors Instantly",
        description:
          "Send one clear scope to every contractor so everyone is reviewing the same project.",
      },
    ],
    process: {
      steps: ["Project Description", "AI Questions", "Scope Document"],
    },
  },
  contractors: {
    hero: {
      headline:
        "Spend less time clarifying projects and more time winning them.",
      subheadline:
        "ScopeMate helps contractors receive cleaner project scopes, identify missing details, and respond with more accurate proposals.",
      cta: "Create Contractor Profile",
    },
    benefits: [
      {
        title: "Receive Cleaner Project Scopes",
        description:
          "Homeowners arrive with organized project details instead of vague wish lists.",
      },
      {
        title: "Identify Missing Items Instantly",
        description:
          "Review scopes and flag gaps before you invest time in a site visit or proposal.",
      },
      {
        title: "Generate Professional Proposals",
        description:
          "Respond with polished, scope-aligned proposals that build trust with homeowners.",
      },
      {
        title: "Differentiate Yourself From Competitors",
        description:
          "Stand out by engaging with well-prepared homeowners who value clarity and professionalism.",
      },
    ],
  },
  signup: {
    homeowner: {
      title: "Start Your Project",
      subtitle:
        "Tell us a bit about yourself and your project. We'll help you build a clear scope next.",
    },
    contractor: {
      title: "Create Your Contractor Profile",
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
