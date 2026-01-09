export const UNIVERSITY_VECTOR_STORES: Record<string, string> = {
    unimelb: process.env.OPENAI_VS_UNIMELB!,
    monash: process.env.OPENAI_VS_MONASH!,
    uwa: process.env.OPENAI_VS_UWA!,
    rmit: process.env.OPENAI_VS_RMIT!
    // ...
};
  
export function getUniversityVectorStoreId(
    slug: string | null
): string | null {
    if (!slug) return null;
    return UNIVERSITY_VECTOR_STORES[slug] ?? null;
}
  