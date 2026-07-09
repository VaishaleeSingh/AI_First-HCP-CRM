import { KeyRound, Shield, SlidersHorizontal } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";

export const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Settings</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enterprise controls for authentication, AI providers, compliance, and
        territory behavior.
      </p>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        {
          title: "AI Provider",
          description: "Groq gemma2-9b-it with validated JSON extraction.",
          icon: KeyRound,
          status: "Configured by environment",
        },
        {
          title: "Security",
          description:
            "Token-ready API access, CORS allowlist, and rate limiting.",
          icon: Shield,
          status: "Authentication-ready",
        },
        {
          title: "Workflow",
          description:
            "Draft saving, audit trail, version history, and follow-up routing.",
          icon: SlidersHorizontal,
          status: "CRM governed",
        },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <Card className="p-5" key={item.title}>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <Badge className="mt-4" tone="green">
              {item.status}
            </Badge>
          </Card>
        );
      })}
    </div>
  </div>
);
