import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  History,
  LockKeyhole,
  Save,
  Search,
  Send,
  Sparkles,
  Stethoscope,
  Wand2,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/buttons/Button";
import { ChatBubble } from "../../components/chat/ChatBubble";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { Dropdown } from "../../components/inputs/Dropdown";
import { Input } from "../../components/inputs/Input";
import { Textarea } from "../../components/inputs/Textarea";
import {
  interestLevelOptions,
  productCatalog,
  visitPurposeOptions,
  visitStatusOptions,
} from "../../constants/options";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { processNaturalLanguage } from "../../redux/slices/agentSlice";
import { addMessage } from "../../redux/slices/chatSlice";
import {
  createInteraction,
  saveDraft,
} from "../../redux/slices/interactionSlice";
import { pushToast } from "../../redux/slices/notificationSlice";
import {
  AgentProcessResult,
  InteractionFormValues,
  InterestLevel,
  VisitStatus,
} from "../../types";
import { formatShortDate } from "../../utils/formatters/date";
import { interactionSchema } from "../../utils/validators/interactionSchema";

const today = new Date().toISOString().slice(0, 10);

const defaultValues: InteractionFormValues = {
  doctorId: 1,
  hospitalId: 1,
  meetingDate: today,
  meetingTime: "10:30",
  durationMinutes: 30,
  purpose: "AI-assisted HCP interaction",
  discussion: "",
  productsDiscussed: [],
  samplesProvided: "",
  doctorFeedback: "",
  interestLevel: "medium",
  competitorMentioned: "",
  nextFollowUp: "",
  additionalNotes: "",
  visitStatus: "completed",
};

type EntryMode = "ai" | "manual";

const sentimentOptions = [
  { label: "Not captured", value: "" },
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
];

const toolLabels: Record<string, string> = {
  edit_interaction: "Edit Interaction",
  followup_recommendation: "Follow-up Recommendation",
  interaction_summary: "Interaction Summary",
  log_interaction: "Log Interaction",
  preview_interaction: "Log Interaction Preview",
  search_hcp: "Search HCP",
};

const toolCards = [
  {
    icon: ClipboardCheck,
    label: "Log Interaction",
    value: "preview_interaction",
  },
  { icon: Wand2, label: "Edit Interaction", value: "edit_interaction" },
  { icon: Search, label: "Search HCP", value: "search_hcp" },
  { icon: History, label: "Summary", value: "interaction_summary" },
  {
    icon: CalendarClock,
    label: "Follow-up",
    value: "followup_recommendation",
  },
];

interface DisplayState {
  doctorName: string;
  hospital: string;
  sentiment: string;
  confidenceScore: number;
  activeTool: string;
}

const toDisplayText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => toDisplayText(item))
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
};

const toStringList = (value: unknown, fallback: string[] = []) => {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => toDisplayText(item).trim())
      .filter(Boolean);

    return normalized.length ? normalized : fallback;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);

    return normalized.length ? normalized : fallback;
  }

  return fallback;
};

const isIsoDateInput = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

const toInterestLevel = (value: unknown): InterestLevel | null => {
  const normalized = toDisplayText(value);
  return interestLevelOptions.some((option) => option.value === normalized)
    ? (normalized as InterestLevel)
    : null;
};

const toVisitStatus = (value: unknown): VisitStatus | null => {
  const normalized = toDisplayText(value);
  return visitStatusOptions.some((option) => option.value === normalized)
    ? (normalized as VisitStatus)
    : null;
};

export const LogInteractionPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctors = useAppSelector((state) => state.doctor.doctors);
  const selectedDoctor =
    useAppSelector((state) => state.doctor.selectedDoctor) ?? doctors[0];
  const interactionLoading = useAppSelector(
    (state) => state.interaction.loading,
  );
  const messages = useAppSelector((state) => state.chat.messages);
  const {
    extraction,
    formPatch,
    loading: aiLoading,
    response,
    savedInteractionId,
    selectedTool,
    toolResults,
  } = useAppSelector((state) => state.agent);
  const [aiPrompt, setAiPrompt] = useState("");
  const requestedMode = searchParams.get("mode");
  const [entryMode, setEntryMode] = useState<EntryMode>(
    requestedMode === "manual" ? "manual" : "ai",
  );
  const [manualSavedId, setManualSavedId] = useState<number | null>(null);
  const [display, setDisplay] = useState<DisplayState>({
    activeTool: "waiting",
    confidenceScore: 0,
    doctorName: "",
    hospital: "",
    sentiment: "Not captured",
  });

  const hospitalOptions = useMemo(
    () =>
      doctors.map((doctor) => ({
        label: doctor.hospital.name,
        value: doctor.hospital.id,
      })),
    [doctors],
  );

  const doctorOptions = doctors.map((doctor) => ({
    label: doctor.fullName,
    value: doctor.id,
  }));

  useEffect(() => {
    if (requestedMode === "manual" || requestedMode === "ai") {
      setEntryMode(requestedMode);
    }
  }, [requestedMode]);

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      ...defaultValues,
      doctorId: selectedDoctor.id,
      hospitalId: selectedDoctor.hospital.id,
    },
  });

  const productsDiscussed = watch("productsDiscussed") ?? [];
  const selectedDoctorId = Number(watch("doctorId"));
  const visitStatus = watch("visitStatus");
  const discussion = watch("discussion");
  const doctorFeedback = watch("doctorFeedback");
  const nextFollowUp = watch("nextFollowUp");
  const isAiMode = entryMode === "ai";
  const activeSavedId = isAiMode ? savedInteractionId : manualSavedId;
  const currentDoctor =
    doctors.find((doctor) => doctor.id === selectedDoctorId) ?? selectedDoctor;
  const displayDoctorName = isAiMode
    ? display.doctorName
    : currentDoctor.fullName;
  const displayHospitalName = isAiMode
    ? display.hospital
    : currentDoctor.hospital.name;
  const handleDoctorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const doctorId = Number(event.target.value);
    const doctor = doctors.find((item) => item.id === doctorId);

    if (doctor) {
      setValue("hospitalId", doctor.hospital.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setManualSavedId(null);
    }
  };
  const doctorRegister = register("doctorId", {
    onChange: handleDoctorChange,
  });

  const toggleProduct = (productName: string) => {
    if (isAiMode) return;

    const nextProducts = productsDiscussed.includes(productName)
      ? productsDiscussed.filter((product) => product !== productName)
      : [...productsDiscussed, productName];

    setValue("productsDiscussed", nextProducts, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setManualSavedId(null);
  };

  const changeEntryMode = (mode: EntryMode) => {
    setEntryMode(mode);
    setSearchParams({ mode });
  };

  const applyAgentResultToForm = (result: AgentProcessResult) => {
    const patch = result.formPatch ?? {};
    const extraction = result.extraction;

    const patchValue = (key: string, fallback: unknown) =>
      patch[key] !== undefined && patch[key] !== null ? patch[key] : fallback;

    const doctorName = toDisplayText(
      patchValue("doctorName", extraction.doctorName),
      "Unknown doctor",
    );
    const hospital = toDisplayText(
      patchValue("hospital", extraction.hospital),
      currentDoctor.hospital.name,
    );
    const sentiment = toDisplayText(
      patchValue("doctorFeedback", extraction.sentiment),
      "neutral",
    );
    const products = toStringList(
      patchValue("productsDiscussed", extraction.products),
      extraction.products,
    );

    const matchedDoctor = doctors.find((doctor) =>
      doctor.fullName
        .toLowerCase()
        .includes(doctorName.replace("Dr.", "").trim().toLowerCase()),
    );

    if (matchedDoctor) {
      setValue("doctorId", matchedDoctor.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("hospitalId", matchedDoctor.hospital.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setDisplay((current) => ({
      activeTool: result.selectedTool,
      confidenceScore: Number.isFinite(extraction.confidenceScore)
        ? extraction.confidenceScore
        : 0,
      doctorName: doctorName || current.doctorName,
      hospital: hospital || current.hospital,
      sentiment: sentiment || current.sentiment,
    }));

    const meetingDate = toDisplayText(patch.meetingDate);
    if (isIsoDateInput(meetingDate)) {
      setValue("meetingDate", meetingDate, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (patch.purpose) {
      setValue("purpose", toDisplayText(patch.purpose), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (patch.discussion) {
      setValue("discussion", toDisplayText(patch.discussion), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (Array.isArray(products) && products.length > 0) {
      setValue("productsDiscussed", products, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (patch.samplesProvided) {
      setValue("samplesProvided", toDisplayText(patch.samplesProvided), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (patch.doctorFeedback) {
      setValue("doctorFeedback", toDisplayText(patch.doctorFeedback), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    const interestLevel = toInterestLevel(patch.interestLevel);
    if (interestLevel) {
      setValue("interestLevel", interestLevel, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    const nextFollowUp = toDisplayText(patch.nextFollowUp);
    if (isIsoDateInput(nextFollowUp)) {
      setValue("nextFollowUp", nextFollowUp, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (patch.additionalNotes) {
      setValue("additionalNotes", toDisplayText(patch.additionalNotes), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    const safeVisitStatus = toVisitStatus(patch.visitStatus);
    if (safeVisitStatus) {
      setValue("visitStatus", safeVisitStatus, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleAiSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aiPrompt.trim()) return;

    const prompt = aiPrompt.trim();
    dispatch(addMessage("representative", prompt));

    try {
      const result = await dispatch(
        processNaturalLanguage({
          doctorId: Number(getValues("doctorId")) || selectedDoctor.id,
          interactionId: savedInteractionId ?? undefined,
          message: prompt,
        }),
      ).unwrap();

      applyAgentResultToForm(result);
      dispatch(
        addMessage(
          "assistant",
          `${result.response} Tool used: ${toolLabels[result.selectedTool] ?? result.selectedTool}. Confidence: ${Math.round(
            result.extraction.confidenceScore * 100,
          )}%.`,
        ),
      );
      setAiPrompt("");
    } catch {
      dispatch(
        pushToast({
          title: "AI processing failed",
          description: "The LangGraph agent could not process this message.",
          tone: "error",
        }),
      );
    }
  };

  const handleDraft = () => {
    dispatch(saveDraft(getValues()));
    dispatch(
      pushToast({
        title: "Draft saved",
        description: isAiMode
          ? "The AI-filled interaction details were saved as a draft."
          : "The structured interaction form was saved as a draft.",
        tone: "info",
      }),
    );
  };

  const submitInteractionForm = async (values: InteractionFormValues) => {
    if (!isAiMode) {
      const doctor =
        doctors.find((item) => item.id === Number(values.doctorId)) ??
        selectedDoctor;
      const payload = {
        ...values,
        doctorId: doctor.id,
        hospitalId: doctor.hospital.id,
      };

      try {
        const savedInteraction = await dispatch(
          createInteraction(payload),
        ).unwrap();
        setManualSavedId(savedInteraction.id);
        setDisplay({
          activeTool: "manual_form",
          confidenceScore: savedInteraction.confidenceScore,
          doctorName: savedInteraction.doctorName,
          hospital: savedInteraction.hospitalName,
          sentiment: savedInteraction.sentiment,
        });
        dispatch(
          pushToast({
            title: "Interaction saved",
            description: "Structured form entry was saved to the CRM.",
            tone: "success",
          }),
        );
      } catch {
        dispatch(
          pushToast({
            title: "Save failed",
            description: "The structured interaction form could not be saved.",
            tone: "error",
          }),
        );
      }
      return;
    }

    if (!discussion || !extraction) {
      dispatch(
        pushToast({
          title: "Ask the AI first",
          description:
            "Use the chat assistant to populate the form before submitting.",
          tone: "error",
        }),
      );
      return;
    }

    const savePrompt = [
      `Save this HCP interaction for ${display.doctorName || selectedDoctor.fullName}.`,
      `Hospital: ${display.hospital || selectedDoctor.hospital.name}.`,
      `Products: ${values.productsDiscussed.join(", ")}.`,
      `Summary: ${values.discussion}.`,
      `Sentiment: ${values.doctorFeedback}.`,
      `Materials: ${values.samplesProvided || "none"}.`,
      `Follow-up: ${values.nextFollowUp || "not scheduled"}.`,
    ].join(" ");

    try {
      const result = await dispatch(
        processNaturalLanguage({
          doctorId: Number(values.doctorId) || selectedDoctor.id,
          message: savePrompt,
          saveRequested: true,
        }),
      ).unwrap();
      applyAgentResultToForm(result);
      dispatch(
        pushToast({
          title: "Interaction saved",
          description: `LangGraph used ${toolLabels[result.selectedTool] ?? "Log Interaction"} and saved the CRM record.`,
          tone: "success",
        }),
      );
    } catch {
      dispatch(
        pushToast({
          title: "Save failed",
          description:
            "The LangGraph Log Interaction tool could not save the record.",
          tone: "error",
        }),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            Log Interaction
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Log HCP interaction
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Use the structured form directly or let the LangGraph assistant fill
            the interaction from conversation.
          </p>
        </div>
        <Badge tone={isAiMode && selectedTool ? "green" : "slate"}>
          {isAiMode
            ? selectedTool
              ? toolLabels[selectedTool]
              : "Waiting for AI"
            : "Structured form"}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                HCP Captured
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                {displayDoctorName || "Ask AI to capture"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {displayHospitalName || selectedDoctor.hospital.name}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Meeting Details
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                {formatShortDate(today)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Follow-up:{" "}
                {nextFollowUp ? formatShortDate(nextFollowUp) : "Not scheduled"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">AI Status</p>
              <h2 className="mt-1 text-lg font-bold capitalize text-slate-950">
                {visitStatus.replace("_", " ")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {!isAiMode
                  ? "Structured form entry"
                  : display.confidenceScore
                    ? `${Math.round(display.confidenceScore * 100)}% confidence`
                    : "No extraction yet"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <form onSubmit={handleSubmit(submitInteractionForm)}>
          <Card
            action={
              <Badge tone={isAiMode ? "blue" : "green"}>
                {isAiMode ? (
                  <LockKeyhole className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                )}
                {isAiMode ? "AI controlled" : "Manual entry"}
              </Badge>
            }
            title="Interaction Details"
            description={
              isAiMode
                ? "This panel is populated by LangGraph tools from the AI chat."
                : "This panel is editable for structured CRM logging."
            }
          >
            <div className="border-b border-slate-100 p-5">
              <div className="inline-flex w-full flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:w-auto sm:flex-row">
                <button
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold leading-5 transition ${
                    isAiMode
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => changeEntryMode("ai")}
                  type="button"
                >
                  <Bot className="h-4 w-4 shrink-0" />
                  <span>AI Chat Mode</span>
                </button>
                <button
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold leading-5 transition ${
                    !isAiMode
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => changeEntryMode("manual")}
                  type="button"
                >
                  <ClipboardCheck className="h-4 w-4 shrink-0" />
                  <span>Structured Form</span>
                </button>
              </div>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <Input label="HCP Name" readOnly value={displayDoctorName} />
              <Input label="Hospital" readOnly value={displayHospitalName} />
              <Dropdown
                disabled={isAiMode}
                label="Doctor Record"
                options={doctorOptions}
                {...doctorRegister}
              />
              <Dropdown
                disabled
                label="Hospital Record"
                options={hospitalOptions}
                {...register("hospitalId")}
              />
              <Input
                readOnly={isAiMode}
                label="Meeting Date"
                type="date"
                {...register("meetingDate")}
              />
              <Input
                readOnly={isAiMode}
                label="Meeting Time"
                type="time"
                {...register("meetingTime")}
              />
              <Input
                readOnly={isAiMode}
                label="Duration"
                min={5}
                type="number"
                {...register("durationMinutes")}
              />
              <Dropdown
                disabled={isAiMode}
                error={errors.purpose?.message}
                label="Purpose"
                options={visitPurposeOptions.map((value) => ({
                  label: value,
                  value,
                }))}
                {...register("purpose")}
              />
              <Textarea
                className="lg:col-span-2"
                error={errors.discussion?.message}
                label="Discussion Summary"
                readOnly={isAiMode}
                {...register("discussion")}
              />
              <div className="lg:col-span-2">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Products Discussed
                </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                  {productCatalog.map((product) => {
                    const checked = productsDiscussed.includes(product.name);

                    return (
                      <label
                        className={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-sm transition ${
                          checked
                            ? "border-brand-200 bg-brand-50"
                            : "border-slate-200 bg-slate-50"
                        } ${
                          isAiMode
                            ? "cursor-default"
                            : "cursor-pointer hover:border-brand-200 hover:bg-brand-50"
                        }`}
                        key={product.id}
                      >
                        <input
                          checked={checked}
                          className="mt-1 shrink-0 rounded border-slate-300 text-brand-600"
                          disabled={isAiMode}
                          onChange={() => toggleProduct(product.name)}
                          readOnly={isAiMode}
                          type="checkbox"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block break-words font-semibold leading-5 text-slate-800">
                            {product.name}
                          </span>
                          <span className="mt-1 block break-words text-xs leading-4 text-slate-500">
                            {product.therapeuticArea}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                  {productsDiscussed
                    .filter(
                      (product) =>
                        !productCatalog.some(
                          (catalogItem) => catalogItem.name === product,
                        ),
                    )
                    .map((product) => (
                      <div
                        className="min-h-24 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm"
                        key={product}
                      >
                        <p className="break-words font-semibold leading-5 text-brand-700">
                          {product}
                        </p>
                        <p className="mt-1 break-words text-xs leading-4 text-brand-600">
                          Captured by AI
                        </p>
                      </div>
                    ))}
                </div>
                {errors.productsDiscussed?.message && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.productsDiscussed.message}
                  </p>
                )}
              </div>
              <Input
                label="Materials / Samples"
                readOnly={isAiMode}
                {...register("samplesProvided")}
              />
              <Input
                label="Competitor Mentioned"
                readOnly={isAiMode}
                {...register("competitorMentioned")}
              />
              <Dropdown
                disabled={isAiMode}
                label="Sentiment"
                options={sentimentOptions}
                {...register("doctorFeedback")}
              />
              <Dropdown
                disabled={isAiMode}
                label="Interest Level"
                options={interestLevelOptions}
                {...register("interestLevel")}
              />
              <Input
                label="Next Follow-up"
                readOnly={isAiMode}
                type="date"
                {...register("nextFollowUp")}
              />
              <Dropdown
                disabled={isAiMode}
                label="Visit Status"
                options={visitStatusOptions}
                {...register("visitStatus")}
              />
              <Textarea
                className="lg:col-span-2"
                label="Additional Notes"
                readOnly={isAiMode}
                {...register("additionalNotes")}
              />
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 lg:flex-row lg:items-center">
              <p className="text-sm text-slate-500">
                {isAiMode
                  ? (response ??
                    "Start with the assistant on the right to populate this form.")
                  : "Fill the structured fields and save directly."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleDraft}
                  variant="secondary"
                >
                  Save Draft
                </Button>
                <Button
                  leftIcon={<FilePlus2 className="h-4 w-4" />}
                  loading={isAiMode ? aiLoading : interactionLoading}
                  type="submit"
                >
                  {isAiMode ? "Submit via LangGraph" : "Save Structured Log"}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        <div className="space-y-6">
          <Card
            className={!isAiMode ? "opacity-80" : undefined}
            title="AI Assistant"
            description={
              isAiMode
                ? "Use chat to fill and edit the form."
                : "Switch to AI Chat Mode to use the assistant."
            }
          >
            <div className="flex h-[620px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
              </div>
              <div className="border-t border-slate-100 p-4">
                <form onSubmit={handleAiSubmit}>
                  <Textarea
                    className="min-h-24"
                    onChange={(event) => setAiPrompt(event.target.value)}
                    placeholder="Tell the AI what happened or what needs correction..."
                    value={aiPrompt}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      leftIcon={<Send className="h-4 w-4" />}
                      disabled={!isAiMode}
                      loading={aiLoading}
                      type="submit"
                    >
                      Send to AI
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>

          <Card
            action={
              <Badge tone={activeSavedId ? "green" : "slate"}>
                {activeSavedId ? `Saved #${activeSavedId}` : "Review mode"}
              </Badge>
            }
            title="LangGraph Tools"
            description="Visible tool routing from the latest assistant action"
          >
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {toolCards.map((tool) => {
                const Icon = tool.icon;
                const active =
                  selectedTool === tool.value ||
                  (selectedTool === "log_interaction" &&
                    tool.value === "preview_interaction");

                return (
                  <div
                    className={`rounded-lg border p-3 ${
                      active
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                    key={tool.value}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {tool.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles className="h-4 w-4 text-brand-700" />
                Latest structured output
              </div>
              <div className="mt-3 rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      formPatch,
                      selectedTool,
                      toolResults,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
