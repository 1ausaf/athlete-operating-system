import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the email and password provided by your facility.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignInForm />
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
        <span>
          New to AOS?{" "}
          <Link href="/about" className="underline-offset-4 hover:underline">
            Learn more
          </Link>
          .
        </span>
        <span>
          Account creation is invite-only; contact your coach or owner if you
          need access.
        </span>
      </CardFooter>
    </Card>
  );
}
