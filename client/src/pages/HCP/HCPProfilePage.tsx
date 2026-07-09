import {
  CalendarPlus,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  Pill,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/buttons/Button";
import { Avatar } from "../../components/common/Avatar";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { Timeline } from "../../components/timeline/Timeline";
import { useAppSelector } from "../../hooks/redux";
import { formatShortDate } from "../../utils/formatters/date";

export const HCPProfilePage = () => {
  const { doctorId } = useParams();
  const doctors = useAppSelector((state) => state.doctor.doctors);
  const interactions = useAppSelector(
    (state) => state.interaction.interactions,
  );
  const doctor =
    doctors.find((item) => item.id === Number(doctorId)) ?? doctors[0];

  const timeline = interactions
    .filter((interaction) => interaction.doctorId === doctor.id)
    .map((interaction) => ({
      id: interaction.id,
      title: interaction.purpose,
      description: interaction.summary,
      meta: formatShortDate(interaction.meetingDate),
      icon: <ClipboardCheck className="h-4 w-4" />,
    }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 text-lg" name={doctor.fullName} />
            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                {doctor.fullName}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {doctor.specialization} at {doctor.hospital.name}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="blue">{doctor.city}</Badge>
                <Badge tone="green">Active Prescriber</Badge>
                <Badge tone="amber">Follow-up due</Badge>
              </div>
            </div>
          </div>
          <Link
            className="inline-flex h-10 max-w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-center text-sm font-semibold leading-5 text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            to="/interactions/new"
          >
            <CalendarPlus className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">Log Interaction</span>
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card title="Doctor Information">
            <div className="space-y-4 p-5 text-sm">
              <p className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4 w-4 text-brand-700" />
                {doctor.hospital.name}, {doctor.city}
              </p>
              <p className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4 w-4 text-brand-700" />
                {doctor.email}
              </p>
              <p className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4 text-brand-700" />
                {doctor.phone}
              </p>
            </div>
          </Card>

          <Card title="Products Prescribed">
            <div className="space-y-3 p-5">
              {doctor.productsPrescribed.map((product) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  key={product.id}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <Pill className="h-4 w-4 text-brand-700" />
                    {product.name}
                  </span>
                  <Badge tone="slate">{product.therapeuticArea}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card
          title="Visit Timeline"
          description="Interaction and follow-up history"
        >
          <div className="p-5">
            {timeline.length > 0 ? (
              <Timeline items={timeline} />
            ) : (
              <p className="text-sm text-slate-500">
                No interactions logged yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
