import { PlatformSelector } from "@/components/download/platform-selector";

export default function AccountDownloadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Downloads</h1>
      <p className="mt-1 text-sm text-white/45">Get YO Voice on any device.</p>
      <div className="mt-6">
        <PlatformSelector />
      </div>
    </div>
  );
}
