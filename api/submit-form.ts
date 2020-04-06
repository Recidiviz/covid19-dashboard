import { NowRequest, NowResponse } from '@now/node'
import googleSheet, { FormEntry } from './_google-sheet'

module.exports = async (req: NowRequest, res: NowResponse) => {
  if (!googleSheet.initialized) {
    await googleSheet.init()
  }
  console.log(req.body)

  // await googleSheet.addRow(req.body as FormEntry)
  res.json({
    body: req.body,
    query: req.query,
    cookies: req.cookies
  })
}






