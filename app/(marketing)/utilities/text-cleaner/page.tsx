import { TextCleanerTool } from "@/components/utilities/text-tools-ui";

export default function TextCleanerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-2">Text Cleaner</h1>
      <p className="text-muted-foreground mb-6 text-sm">Free — no credits required</p>
      <TextCleanerTool />
    </div>
  );
}
