import { Bot, UserRound } from "lucide-react";
import { ChatMessage } from "../../types";
import { cn } from "../../utils/helpers/classNames";

export const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clinical-mint text-emerald-700">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6",
          isAssistant
            ? "bg-slate-100 text-slate-700"
            : "bg-brand-600 text-white",
        )}
      >
        {message.content}
      </div>
      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <UserRound className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
