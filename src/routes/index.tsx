import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/app/App";

export const Route = createFileRoute("/")({
  component: App,
  ssr: false,
});
