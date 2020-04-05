declare module "google-spreadsheet" {
  export class GoogleSpreadsheet {
    constructor(sheetId?: string);
    useServiceAccountAuth(props: {
      client_email?: string;
      private_key?: string;
    });
    addRow(row: string[]);
  }
}
