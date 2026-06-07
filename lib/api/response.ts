import { NextResponse } from "next/server";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { EmailConfigError, EmailDeliveryError } from "@/lib/email/client";
import { ZodError } from "zod";

export function jsonError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof EmailConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof EmailDeliveryError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Please check your input.",
        details: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  console.error(error);

  if (error instanceof Error && error.message) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
