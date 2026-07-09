import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/buttons/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/inputs/Input";
import { login } from "../../redux/slices/authSlice";
import { pushToast } from "../../redux/slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const navigate = useNavigate();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "aarav.mehta@pharma.example",
      password: "Welcome123",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      dispatch(
        pushToast({
          title: "Signed in",
          description: `${result.user.role.replace("_", " ")} session is active.`,
          tone: "success",
        }),
      );
      navigate("/dashboard");
    } catch {
      dispatch(
        pushToast({
          title: "Sign in failed",
          description: "Check your email and password.",
          tone: "error",
        }),
      );
    }
  };

  return (
    <main className="clinical-grid flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            AI-First HCP CRM
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Secure field access for healthcare professional engagement.
          </p>
        </div>
        <Card>
          <form className="space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              error={errors.email?.message}
              label="Email"
              placeholder="rep@company.com"
              type="email"
              {...register("email")}
            />
            <Input
              error={errors.password?.message}
              label="Password"
              placeholder="Enter password"
              type="password"
              {...register("password")}
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input className="rounded border-slate-300" type="checkbox" />
                Remember device
              </label>
              <Link
                className="font-semibold text-brand-700"
                to="/forgot-password"
              >
                Forgot password
              </Link>
            </div>
            <Button
              className="w-full"
              loading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              type="submit"
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
};
