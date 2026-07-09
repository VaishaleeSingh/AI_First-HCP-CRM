export const formatShortDate = (value?: string) => {
  if (!value) return "Not scheduled";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

export const formatTime = (value?: string) => {
  if (!value) return "TBD";

  return value.slice(0, 5);
};
