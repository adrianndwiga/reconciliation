import { readFile } from 'fs'
import * as htmlparser2 from 'htmlparser2'
import * as files from './files.json'

const file = (<any>files).file

readFile(file, 'utf8', (error, data) => {
    let records = 0
    let transactions = []
    let openTdTag = false
    let openTrTag = false
    let transaction = []
    let firstRow = true

    const parser = new htmlparser2.Parser({
        onopentag(name, attribs) {
            if (name === 'tr') {
                records += 1
                openTrTag = true
            }
            if (name === 'td') {
                openTdTag = true
            }
        },
        ontext(text) {
            if(openTrTag && openTdTag && !firstRow) {
                transaction = [...transaction, text]
            }
        },
        onclosetag(tagname) {
            if (tagname === 'tr') {
                openTrTag = false
                if (firstRow) {
                    firstRow = false
                } else {
                    transactions = [...transactions, transaction];
                    transaction = [];
                }
            }

            if (tagname === 'td') {
                openTdTag = false
            }
        }
    },
        { decodeEntities: true });

    parser.write(data)
    parser.end()
    console.log(`${records}`, `${transactions.length}, ${transactions[0][0]}, ${transactions[184][0]}`)
})
