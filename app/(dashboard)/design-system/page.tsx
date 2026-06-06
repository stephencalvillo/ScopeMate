import { redirect } from "next/navigation";
import { componentLibrary } from "@/lib/component-library";

export default function DesignSystemPage() {
  redirect(`/design-system/${componentLibrary[0].slug}`);
}
