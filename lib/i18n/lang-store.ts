"use client";

import { useEffect, useState } from "react";

export type Lang = "EN" | "UA";
export const LANGUAGE_STORAGE_KEY = "altr_language_v1";
export const DEFAULT_LANGUAGE: Lang = "EN";

export function getStoredLanguage(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "UA" ? "UA" : "EN";
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setStoredLanguage(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window