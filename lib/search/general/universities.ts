export type UniStores = {
  official?: string;
  union?: string;
};

export function getUniversityVectorStores(uniSlug: string | null): UniStores {
  switch (uniSlug) {
    case "unimelb":
      return {
        official: process.env.OPENAI_VS_UNIMELB_OFFICIAL,
        union: process.env.OPENAI_VS_UNIMELB_SU,
      };
    case "monash":
      return {
        official: process.env.OPENAI_VS_MONASH_OFFICIAL,
        union: process.env.OPENAI_VS_MONASH_SU,
      };
    case "rmit":
      return {
        official: process.env.OPENAI_VS_RMIT_OFFICIAL,
        union: process.env.OPENAI_VS_RMIT_SU,
      };
    case "uwa":
      return {
        official: process.env.OPENAI_VS_UWA_OFFICIAL,
        union: process.env.OPENAI_VS_UWA_SU,
      };
    default:
      return {};
  }
}
  
