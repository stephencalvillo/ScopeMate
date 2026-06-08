export type ProjectShareCopy = {
  sectionTitle: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
};

export function getProjectShareCopy(
  isContractorProject: boolean
): ProjectShareCopy {
  if (isContractorProject) {
    return {
      sectionTitle: "Share with a homeowner",
      description:
        "Create a link to share with a homeowner. They can review your scope, suggest changes, and you can share your estimate.",
      emailLabel: "Send to a homeowner's email address",
      emailPlaceholder: "homeowner@example.com",
    };
  }

  return {
    sectionTitle: "Share with a contractor",
    description:
      "Create a link to share with a contractor. They can review your scope, suggest changes, and you can approve their estimate.",
    emailLabel: "Send to a contractor's email address",
    emailPlaceholder: "contractor@example.com",
  };
}
