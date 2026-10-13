export type Column = {
  name: string;
  type: string;
  nullable: string;
  default: string | null;
  isPrimaryKey: boolean;
};

export type ForeignKey = {
  column: string;
  referencesTable: string;
  referencesColumn: string;
};

export type Table = {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
};

export type Schema = {
  tables: Table[];
};
