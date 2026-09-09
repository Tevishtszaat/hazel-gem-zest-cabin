import { useEffect, useState } from "react";
import { cn } from "@/lib/utils.ts";
import { getImageUrl, iconCandidates, resolveIconUrl } from "@/lib/pda/image-store.ts";

export function PdaImage({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!name) {
      setUrl(null);
      return;
    }
    void getImageUrl(name).then((next) => {
      if (alive) setUrl(next);
    });
    return () => {
      alive = false;
    };
  }, [name]);
  if (!name || !url) return null;
  return <img src={url} alt={name} className={className} />;
}

export function ItemIcon({
  name,
  fields,
  className,
}: {
  name?: string;
  fields?: Record<string, string>;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const custom =
    fields?.CustomIcon || fields?.customicon || fields?.Customicon || fields?.Icon || fields?.UnlockIcon || "";
  useEffect(() => {
    let alive = true;
    if (!name) {
      setUrl(null);
      return;
    }
    void resolveIconUrl(iconCandidates(name, fields)).then((next) => {
      if (alive) setUrl(next);
    });
    return () => {
      alive = false;
    };
  }, [name, custom]);
  if (!url) {
    return <span className={cn("inline-block shrink-0 rounded-sm bg-elevated", className)} aria-hidden />;
  }
  return <img src={url} alt="" className={cn("shrink-0 object-contain", className)} />;
}
