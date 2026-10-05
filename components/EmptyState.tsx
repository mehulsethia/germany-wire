import { IconSearch } from "./icons";

export default function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-dashed border-line-strong px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg bg-forest-wash text-forest"><IconSearch size={18} /></div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
