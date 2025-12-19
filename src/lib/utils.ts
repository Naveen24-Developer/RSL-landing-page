import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// RSL Color System
export const colors = {
  primary: "#000000",
  secondary: "#FFFFFF",
  accent: "#3B82F6",
  gradient: {
    start: "#6fc9d3",
    middle: "#2f9aa8", 
    end: "#0f6f7f",
    // For single color usage
    DEFAULT: "#2f9aa8",
  }
} as const

// Helper function for gradient text
export function textGradient() {
  return "bg-gradient-to-b from-[#6fc9d3] via-[#2f9aa8] to-[#0f6f7f] bg-clip-text text-transparent"
}

export function bgLogin() {
  return "[#f1f1f1]"
}


// Helper function for gradient background
export function bgGradient() {
  return "bg-gradient-to-b from-[#6fc9d3] via-[#2f9aa8] to-[#0f6f7f]"
}
// lib/utils.ts
export const bgGradientHover =
  "group-hover:bg-gradient-to-b group-hover:from-[#6fc9d3] group-hover:via-[#2f9aa8] group-hover:to-[#0f6f7f]";

export const createEmitter = () => {
  const listeners = new Set<(value: string) => void>();
  return {
    on: (listener: (value: string) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    off: (listener: (value: string) => void) => {
      listeners.delete(listener);
    },
    emit: (value: string) => {
      listeners.forEach((listener) => listener(value));
    },
  };
};


export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function toAny<T>(value: T): any {
  return value;
}

export const isString = (value: any): value is string =>
  typeof value === "string";

export function errorToString(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export function exclude<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
  ) as Omit<T, K>;
}

export const isFunction = <
  T extends (...args: any[]) => any = (...args: any[]) => any,
>(
  v: unknown,
): v is T => typeof v === "function";

export const isObject = (value: any): value is Record<string, any> =>
  Object(value) === value;

export const isNull = (value: any): value is null | undefined => value == null;

export const isPromiseLike = (x: unknown): x is PromiseLike<unknown> =>
  isFunction((x as any)?.then);

export const isJson = (value: any): value is Record<string, any> => {
  try {
    if (typeof value === "string") {
      const str = value.trim();
      JSON.parse(str);
      return true;
    } else if (isObject(value)) {
      return true;
    }
    return false;
  } catch (_e) {
    return false;
  }
};

export function countDaysInclusive(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Normalize to UTC midnight to avoid timezone issues
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = endUTC - startUTC;

  // +1 for inclusive count
  return Math.round(diffInMs / msPerDay) + 1;
}