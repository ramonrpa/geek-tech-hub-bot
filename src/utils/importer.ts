import { glob } from "glob";

export const importer = async (pattern: string) => {
  const files = await glob(pattern.replace(/\\/gm, "/"));

  return await Promise.all(
    files.map(async (file) => {
      const imported = await import(file);

      return imported;
    }),
  );
};
