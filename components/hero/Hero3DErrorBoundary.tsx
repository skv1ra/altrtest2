"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  failed: boolean;
};

export class Hero3DErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Altr hero] 3D scene failed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 z-[7] overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_50%_38%,rgba(88,167,218,.18),transparent_35%),linear-gradient(180deg,#0a0d11,#020304)]">
          <div className="absolute left-1/2 top-1/2 h-[52%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/10 bg-black/35 shadow-[0_35px_100px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl">
            <div className="absolute inset-[8%] rounded-[18px] border border-sky-200/10 bg-[radial-gradient(circle_at_70%_15%,rgba(56,189,248,.14),transparent_35%),linear-gradient(145deg,#101821,#081017)]">
              <div className="flex h-full flex-col justify-end p-6 md:p-10">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/[.045] p-4 text-sm text-white/70 shadow-2xl">
                  <p>Can we move the call to tomorrow?</p>
                  <div className="mt-3 ml-auto max-w-[86%] rounded-2xl bg-sky-500/20 p-3 text-sky-100">
                    Sure — tomorrow at 15:00 works for me.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[8%] left-1/2 h-10 w-[60%] -translate-x-1/2 rounded-full bg-sky-300/10 blur-2xl" />
        </div>
      );
    }

    return this.props.children;
  }
}
