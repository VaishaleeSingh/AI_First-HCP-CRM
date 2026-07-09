import { Save } from "lucide-react";
import { Button } from "../../components/buttons/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/inputs/Input";
import { Textarea } from "../../components/inputs/Textarea";

export const HCPNewPage = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Add HCP</h1>
      <p className="mt-2 text-sm text-slate-500">
        Capture doctor, hospital, territory, and prescribing context.
      </p>
    </div>
    <Card>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Input label="Doctor name" placeholder="Dr. Ananya Rao" />
        <Input label="Specialization" placeholder="Endocrinology" />
        <Input label="Hospital" placeholder="City Care Hospital" />
        <Input label="City" placeholder="Mumbai" />
        <Input label="Email" placeholder="doctor@hospital.com" type="email" />
        <Input label="Phone" placeholder="+91 ..." />
        <Textarea
          className="md:col-span-2"
          label="Clinical profile"
          placeholder="Prescribing behavior, preferred topics, and access notes"
        />
      </div>
      <div className="flex justify-end border-t border-slate-100 px-5 py-4">
        <Button leftIcon={<Save className="h-4 w-4" />}>Save HCP</Button>
      </div>
    </Card>
  </div>
);
