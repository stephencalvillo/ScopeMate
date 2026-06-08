export type ProjectShareCopy = {
  sectionTitle: string;
  description: string;
  dialogDescription: string;
  emailLabel: string;
  emailHelper: string;
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
      dialogDescription:
        "Share one link so your client can review the scope, suggest changes, and receive your estimate. No sign-in required.",
      emailLabel: "Or send a personal link",
      emailHelper:
        "Sends a dedicated link to one homeowner. They can review without signing in.",
      emailPlaceholder: "homeowner@example.com",
    };
  }

  return {
    sectionTitle: "Share with a contractor",
    description:
      "Create a link to share with a contractor. They can review your scope, suggest changes, and you can approve their estimate.",
    dialogDescription:
      "Share one link so a contractor can review your scope, suggest changes, and submit an estimate. No sign-in required.",
    emailLabel: "Or send a personal review link",
    emailHelper:
      "Sends a dedicated link to one contractor. They can review without signing in.",
    emailPlaceholder: "contractor@example.com",
  };
}
