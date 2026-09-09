import { bbcodeToHtml } from "@/lib/pda/bbcode.ts";
import { peekImageUrl } from "@/lib/pda/image-store.ts";

type Tag = "span" | "div" | "h2" | "h3" | "p";

export function BbText({
  text,
  className,
  as: Tag = "span",
  inline = false,
}: {
  text: string;
  className?: string;
  as?: Tag;
  inline?: boolean;
}) {
  return (
    <Tag
      className={`bbcode ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: bbcodeToHtml(text || "", { inline, imageUrl: peekImageUrl }) }}
    />
  );
}
