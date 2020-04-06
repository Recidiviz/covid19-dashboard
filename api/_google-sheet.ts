
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { v4 as uuid } from 'uuid'

const CLIENT_EMAIL = process.env.CLIENT_EMAIL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const SHEET_ID = process.env.SHEET_ID

export interface FormEntry {
  email: string
  summary: string
  state: string
  county: string
  action: string
  date: string
  source: string
}

class GoogleSheet {
  sheet: GoogleSpreadsheet
  initialized: boolean

  constructor() {
    this.sheet = new GoogleSpreadsheet(SHEET_ID)
    this.initialized = false
  }

  async init() {
    if (!PRIVATE_KEY || !CLIENT_EMAIL) {
      return
    }

    let private_key = PRIVATE_KEY
    if (process.env.env !== 'dev') {
      private_key = private_key!.replace(/\\n/g, "\n")
    }

    const result = await this.sheet.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    })
    await this.sheet.loadInfo()

    this.initialized = true
    console.log('Title of google spreadsheet: ', await this.sheet.title)
  }

  async addRow(entry: FormEntry) {
    const row = [uuid(), entry.email, entry.summary, entry.state, entry.county, entry.action, entry.date, entry.source]
    await this.sheet.addRow(row)
  }
}

export default new GoogleSheet()


