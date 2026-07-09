import { InputHTMLAttributes } from "react";
import { Input } from "./Input";

export const TimePicker = (
  props: InputHTMLAttributes<HTMLInputElement> & { label?: string },
) => <Input type="time" {...props} />;
