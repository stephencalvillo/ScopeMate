import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";

type CTAButtonProps = ButtonProps & {
  href?: string;
};

export function CTAButton({ href, children, ...props }: CTAButtonProps) {
  if (href) {
    return (
      <Button asChild {...props}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return <Button {...props}>{children}</Button>;
}
