declare module "papaparse" {
  export interface ParseResult<T = Record<string, string>> {
    data: T[];
    errors: { message: string; row?: number }[];
    meta: { fields?: string[]; delimiter: string };
  }
  export function parse<T = Record<string, string>>(
    input: string | File,
    config?: {
      header?: boolean;
      skipEmptyLines?: boolean | "greedy";
      preview?: number;
      complete?: (results: ParseResult<T>) => void;
      error?: (err: Error) => void;
    }
  ): ParseResult<T>;
  const Papa: {
    parse: typeof parse;
  };
  export default Papa;
}
