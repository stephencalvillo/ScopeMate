"use client";

import { useEffect, useRef } from "react";

const CAPTCHA_ATTRS = {
  "data-cl-theme": "light",
  "data-cl-size": "flexible",
  "data-cl-language": "auto",
} as const;

function findSignUpSubmitButton() {
  return document.querySelector<HTMLElement>(
    ".cl-signUp-root .cl-formButtonPrimary, .cl-signUp-start .cl-formButtonPrimary, .cl-card .cl-formButtonPrimary"
  );
}

function applyCaptchaAttributes(element: HTMLElement) {
  for (const [key, value] of Object.entries(CAPTCHA_ATTRS)) {
    element.setAttribute(key, value);
  }
  element.className =
    "flex min-h-[65px] w-full items-center justify-center mb-4 [&:empty]:min-h-0 [&:empty]:hidden";
  element.removeAttribute("aria-hidden");
}

/**
 * Mounts #clerk-captcha inside Clerk's sign-up card (above the submit button).
 * Clerk looks up this id globally; placing it outside the card puts the widget above the card.
 */
export function ClerkCaptchaInSignUpCard() {
  const captchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function relocateCaptcha() {
      const captcha = captchaRef.current;
      const submitButton = findSignUpSubmitButton();
      if (!captcha || !submitButton?.parentElement) {
        return false;
      }

      applyCaptchaAttributes(captcha);

      const container = submitButton.parentElement;
      if (captcha.parentElement !== container) {
        container.insertBefore(captcha, submitButton);
      } else if (captcha.nextElementSibling !== submitButton) {
        container.insertBefore(captcha, submitButton);
      }

      return true;
    }

    relocateCaptcha();

    const observer = new MutationObserver(() => {
      relocateCaptcha();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={captchaRef}
      id="clerk-captcha"
      aria-hidden
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      {...CAPTCHA_ATTRS}
    />
  );
}

/**
 * Static captcha placeholder for custom sign-up forms (e.g. contractor flow).
 */
export function ClerkCaptcha() {
  return (
    <div
      id="clerk-captcha"
      className="flex min-h-[65px] w-full items-center justify-center [&:empty]:min-h-0 [&:empty]:hidden"
      {...CAPTCHA_ATTRS}
    />
  );
}
