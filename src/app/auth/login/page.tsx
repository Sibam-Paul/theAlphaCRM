"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "./actions";

// ---------------- VALIDATION HELPERS ----------------

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email address";

  return "";
};

const validatePassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

// ---------------- COMPONENT ----------------

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      setIsLoading(false);
      return;
    }

    // Server action
    const result = await login(formData);

    if (result?.error) {
      switch (result.error) {
        case "EMAIL_NOT_FOUND":
          setEmailError("Email not registered");
          break;
        case "INVALID_PASSWORD":
          setPasswordError("Incorrect password");
          break;
        default:
          setGeneralError("Wrong email or password");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">CRM.TAO</CardTitle>
          <CardDescription className="text-lg font-semibold">
            Sign in to your CRM.tao account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-7.5">

            {/* GENERAL ERROR */}
            {generalError && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500 font-medium">
                  {generalError}
                </span>
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    emailError ? "text-red-500" : "text-muted-foreground"
                  }`}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="admin@crm.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setGeneralError("");
                  }}
                  className={`pl-10 h-10 w-full border rounded-md bg-transparent outline-none ${
                    emailError
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-[#373737] focus:ring-2 focus:ring-[#575757]"
                  }`}
                />
              </div>

              {emailError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    passwordError ? "text-red-500" : "text-muted-foreground"
                  }`}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={() => {
                    setPasswordError("");
                    setGeneralError("");
                  }}
                  className={`pl-10 pr-10 h-10 w-full border rounded-md bg-transparent outline-none ${
                    passwordError
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-[#373737] focus:ring-2 focus:ring-[#575757]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-white text-black font-bold hover:bg-[#E5E5E5]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
