import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "paper";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-red text-paper border-brown hover:bg-red-deep sticker-shadow hover:sticker-shadow-red",
  secondary:
    "bg-pink text-berry border-brown hover:bg-pink-deep hover:text-paper sticker-shadow",
  outline:
    "bg-paper text-berry border-brown hover:bg-blush sticker-shadow",
  paper:
    "bg-paper text-berry border-pink-deep hover:border-red hover:bg-blush sticker-shadow-sm",
  ghost:
    "bg-transparent text-berry border-transparent hover:bg-blush hover:border-pink shadow-none",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm border-2",
  md: "px-6 py-2.5 text-base border-[2.5px]",
  lg: "px-8 py-3.5 text-lg border-[3px]",
};

/**
 * Hand-cut button. The wobbly border-radius plus the offset flat shadow is
 * what makes it read as a paper cut-out instead of a UI control; the press
 * state slides it down into its own shadow.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
  alt = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Use the mirrored radius so adjacent buttons don't look stamped. */
  alt?: boolean;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-display font-bold",
    "transition-all duration-150 ease-out cursor-pointer select-none",
    "active:translate-x-[3px] active:translate-y-[4px] active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-55",
    alt ? "rough-pill-alt" : "rough-pill",
    sizes[size],
    variants[variant],
    className,
  );
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  alt?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant, size, alt, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, alt, className });

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    const external = /^(https?:|mailto:|tel:)/.test(href);

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
