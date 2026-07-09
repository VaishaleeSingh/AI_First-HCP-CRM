import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { dismissToast } from "../../redux/slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Button } from "../buttons/Button";

const icons = {
  error: <XCircle className="h-4 w-4 text-rose-600" />,
  info: <Info className="h-4 w-4 text-brand-600" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
};

export const ToastStack = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.notification.items);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel"
          key={item.id}
        >
          <div className="flex gap-3">
            {icons[item.tone]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-950">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
            <Button
              aria-label="Dismiss notification"
              className="h-7 w-7 px-0"
              leftIcon={<X className="h-4 w-4" />}
              onClick={() => dispatch(dismissToast(item.id))}
              variant="ghost"
            >
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
