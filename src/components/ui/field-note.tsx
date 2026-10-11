import { useState } from "react";

export function FieldNote({ label, note }: { label: string; note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex normal-case tracking-normal">
      <button
        type="button"
        title={note}
        aria-expanded={open}
        aria-label={`What ${label} does`}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-warn/70 text-[10px] font-bold leading-none text-warn hover:bg-warn/15"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        !
      </button>
      {open ? (
        <span className="absolute left-0 top-5 z-30 w-72 rounded-md border border-warn/40 bg-bg px-2.5 py-2 text-xs leading-relaxed text-fg shadow-border">
          {note}
        </span>
      ) : null}
    </span>
  );
}
