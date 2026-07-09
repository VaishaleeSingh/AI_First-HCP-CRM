import { ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/buttons/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/inputs/Input";

export const ForgotPasswordPage = () => (
  <main className="clinical-grid flex min-h-screen items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <Card>
        <div className="space-y-5 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <MailCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Reset password</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your enterprise email and the system will send reset
              instructions after account validation.
            </p>
          </div>
          <Input
            label="Work email"
            placeholder="rep@company.com"
            type="email"
          />
          <Button className="w-full">Send reset link</Button>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            to="/login"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  </main>
);
