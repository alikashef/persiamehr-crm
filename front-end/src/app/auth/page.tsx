"use client";

import { LockKeyhole, LogIn, User } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_CREDENTIALS, AUTH_STORAGE_KEY } from "@/lib/constants";

export default function Auth() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === "active") router.replace("/");
  }, [router]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (username.trim() !== AUTH_CREDENTIALS.username || password !== AUTH_CREDENTIALS.password) {
      setError("نام کاربری یا رمز عبور اشتباه است");
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, "active");
    router.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold">ورود به PersiaMehr CRM</h1>
            <p className="text-xs text-muted-foreground">برای دسترسی به داشبورد وارد شوید</p>
          </div>

          <form className="space-y-3" onSubmit={submit}>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">نام کاربری</span>
              <div className="relative">
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input dir="ltr" className="pr-9 text-left" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">رمز عبور</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input dir="ltr" type="password" className="pr-9 text-left" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </div>
            </label>

            {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" />
              ورود
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
