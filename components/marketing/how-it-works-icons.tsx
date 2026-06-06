import { Lightbulb, MessageCircle, Share2, Sparkles } from "lucide-react";

const iconClassName = "h-4 w-4";

export const howItWorksIcons = [
  <MessageCircle key="describe" className={iconClassName} aria-hidden />,
  <Sparkles key="scope" className={iconClassName} aria-hidden />,
  <Share2 key="share" className={iconClassName} aria-hidden />,
  <Lightbulb key="compare" className={iconClassName} aria-hidden />,
] as const;
