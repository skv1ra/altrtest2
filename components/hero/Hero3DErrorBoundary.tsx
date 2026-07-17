"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { MacBook } from "./DeviceShells";
import { MessengerScene } from "./MessengerScene";
import styles from "./HeroDevices.module.css";

type Props = {
  children: ReactNode;
  lang: "EN" | "UA";
};

type State = {
  failed: boolean;
};

export class Hero3DErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError():