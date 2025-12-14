// src/components/DateField.tsx
import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

type Props = {
  label?: string;
  /** Accepts ISO string (YYYY-MM-DD) or Dayjs; emits ISO YYYY-MM-DD or undefined */
  value?: string | Dayjs | null;
  onChange: (next?: string) => void;
  disabled?: boolean;
  required?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  fullWidth?: boolean;
  size?: "small" | "medium";
};

export default function DateField({
  label = "Select date",
  value,
  onChange,
  disabled,
  required,
  minDate,
  maxDate,
  fullWidth = true,
  size = "small",
}: Props) {
  // Normalize incoming value to Dayjs (or null)
  const dayValue = React.useMemo<Dayjs | null>(() => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value as Dayjs;
    // Expecting "YYYY-MM-DD" or full ISO; fallback to null if invalid
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={dayValue}
        onChange={(d) => {
          if (!d || !d.isValid()) return onChange(undefined);
          onChange(d.format("YYYY-MM-DD"));
        }}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: {
            required,
            fullWidth,
            size,
          },
        }}
      />
    </LocalizationProvider>
  );
}
