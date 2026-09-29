"use client"

import { Component, type ReactNode } from "react"

interface ErrorBoundaryProps {
  fallback: ReactNode
  resetKey?: string
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
  resetKey?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
