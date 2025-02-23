import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isObjectEmpty = (obj: object) => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

export const injectValuesIntoPrompt = (
  promptTemplate: string,
  values: Record<string, string | number>
): string => {
  return Object.entries(values).reduce((prompt, [key, value]) => {
    const placeholder = new RegExp(`\\{{${key}\\}}`, "g");
    return prompt.replace(placeholder, String(value));
  }, promptTemplate);
};

export const addUserQuestion = (
  promptTemplate: string,
  userQuestion: string
): string => injectValuesIntoPrompt(promptTemplate, { userQuestion });

export const getCurrentDateParams = () => {
  const now = new Date();
  return {
    currentDate: now.toISOString().split("T")[0],
    currentYear: now.getFullYear(),
    currentQuarter: Math.floor(now.getMonth() / 3) + 1,
  };
};

export const getTimeFrameParams = (
  timeFrame: TimeFrame,
  specificPeriod?: SpecificPeriod
): string => {
  const params = new URLSearchParams();

  switch (timeFrame) {
    case "latest_quarter":
      params.set("period", "quarter");
      params.set("limit", "1");
      break;
    case "previous_quarter":
      params.set("period", "quarter");
      params.set("limit", "2");
      break;
    case "year_to_date":
      params.set("period", "quarter");
      params.set("from", `${new Date().getFullYear()}-01-01`);
      break;
    case "trailing_twelve_months":
      params.set("period", "quarter");
      params.set("limit", "4");
      break;
    case "specific_quarter":
      if (specificPeriod?.quarter && specificPeriod?.year) {
        params.set("period", "quarter");
        params.set("year", specificPeriod.year.toString());
        params.set("quarter", specificPeriod.quarter.toString());
      }
      break;
    case "specific_year":
      if (specificPeriod?.year) {
        params.set("period", "annual");
        params.set("year", specificPeriod.year.toString());
      }
      break;
    case "specific_date_range":
      if (specificPeriod?.startDate && specificPeriod?.endDate) {
        params.set("from", specificPeriod.startDate);
        params.set("to", specificPeriod.endDate);
      }
      break;
    case "past_n_quarters":
      params.set("period", "quarter");
      params.set("limit", (specificPeriod?.count || 4).toString());
      break;
    case "past_n_years":
      params.set("period", "annual");
      params.set("limit", (specificPeriod?.count || 1).toString());
      break;
    default:
      params.set("period", "quarter");
      params.set("limit", "1");
  }
  return `&${params.toString()}`;
};
