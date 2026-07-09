import { InputHTMLAttributes } from "react";
import { Input } from "./Input";

export const DatePicker = (
  props: InputHTMLAttributes<HTMLInputElement> & { label?: string },
) => <Input type="date" {...props} />;
