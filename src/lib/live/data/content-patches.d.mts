export interface ContentPatch {
  bucket: string;
  slug: string;
  find: string;
  replace: string;
}
export const CONTENT_PATCHES: ContentPatch[];
export function patchContent<T extends string | null | undefined>(
  bucket: string, slug: string, content: T,
): T;
