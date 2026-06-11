export function isContractorProjectDetailPath(pathname: string): boolean {
  return pathname.startsWith("/contractor/projects/");
}

export function resolveProjectDetailPath(
  pathname: string,
  projectId: string
): string {
  if (isContractorProjectDetailPath(pathname)) {
    return `/contractor/projects/${projectId}`;
  }

  return `/projects/${projectId}`;
}

export function parseContractorProjectReturnPath(
  returnPath: string | null | undefined
): { projectId: string; href: string } | null {
  if (!returnPath) return null;

  const contractorMatch = returnPath.match(/^\/contractor\/projects\/([^/?]+)/);
  if (contractorMatch) {
    return {
      projectId: contractorMatch[1],
      href: `/contractor/projects/${contractorMatch[1]}`,
    };
  }

  const projectMatch = returnPath.match(/^\/projects\/([^/?]+)/);
  if (projectMatch) {
    return {
      projectId: projectMatch[1],
      href: `/contractor/projects/${projectMatch[1]}`,
    };
  }

  return null;
}
