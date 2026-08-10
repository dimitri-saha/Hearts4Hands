import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Blog bodies are volunteer-submitted, so they are parsed as Markdown and then
 * sanitized against an allow-list before rendering. Even though only an editor
 * can publish, we never trust stored text to be safe HTML.
 */
const schema = {
  ...defaultSchema,
  tagNames: [
    "p", "br", "strong", "em", "del", "blockquote", "ul", "ol", "li",
    "h2", "h3", "h4", "a", "hr", "code", "pre", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    img: ["src", "alt", "title"],
    "*": [],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // Downshift `#` to `<h2>` so a post body can never collide with the page <h1>.
  .use(remarkRehype)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
  const normalized = source.replace(/^#\s/gm, "## ");
  const file = await processor.process(normalized);
  return String(file);
}

/** Strip formatting for excerpts, meta descriptions, and reading-time counts. */
export function toPlainText(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
