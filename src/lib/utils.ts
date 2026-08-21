import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRials(amount: number): string {
  const toman = Math.round(amount / 10);
  return new Intl.NumberFormat("fa-IR").format(toman) + " تومان";
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(num: number): string {
  return num.toFixed(2) + "%";
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
