import express from 'express'
import { DecodeBlob } from 'ethstorage-sdk'
import { fileTypeFromBuffer } from 'file-type'
import { config } from 'dotenv'
config()

const app = express()

const blob_reader = async (slot_no) => {
  const { data } = await fetch(`${process.env.URL_BEACON_NODE}/eth/v1/beacon/blob_sidecars/${slot_no}`)
    .then((response) => response.json())
    .catch(console.log)

  // hard code to index = 0
  // TODO: handle multiple blobs
  return data[0].blob
}

app.get('/blob_viewer/:slot_no', async (req, res) => {
  try {
    const slot_no = req.params.slot_no
    const blob = await blob_reader(slot_no)

    const decoded = DecodeBlob(blob)
    const fileBuffer = Buffer.from(decoded)
    let filetype = await fileTypeFromBuffer(fileBuffer)

    if (!filetype) {
      filetype = { ext: 'txt' }
    }

    if (filetype.ext === 'txt') {
      res.send(fileBuffer.toString())
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(filetype.ext)) {
      res.writeHead(200, {
        'Content-Type': 'image/' + filetype.ext,
        'Content-Length': fileBuffer.length,
      })
      res.end(fileBuffer)
    } else {
      res.send('blob file type not supported')
    }
  } catch (e) {
    res.status(500).send('An error occurred while processing your request.')
  }
})

app.listen(process.env.API_PORT, () => console.log(`Blob viewer api running on port ${process.env.API_PORT}`))
