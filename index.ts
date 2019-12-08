import { readFile } from 'fs'
import * as files from './files.json'

interface XeroAccountTransaction {
    date: string
    description: string
    reference: string
    paymentRef: string
    spent: string
    received: string
    bankTransactionSource: string
    status: string
}

const Transform = (x: string[]): XeroAccountTransaction => {
    return  {
                date: x[1],
                description: x[2],
                reference: x[3],
                paymentRef: x[4],
                spent: x[5],
                received: x[6],
                bankTransactionSource: x[7],
                status: x[8].replace('\n', '').trim()
            }
}

export function htmlToJson(): Promise<any> {
    return new Promise((resolve, reject) => {
        const file = (<any>files).file

        readFile(file, 'utf8', (error, data) => {
            const cheerio = require('cheerio')
            const $ = cheerio.load(data)
            const elements = $('tbody > tr')
            let element = elements.first()
            const xeroAccountTransactions = [];

            while(element.html() != null) {
                const values = $('td', element)
                xeroAccountTransactions.push(Transform([
                    $(values[0]).text(),
                    $(values[1]).text(),
                    $(values[2]).text(),
                    $(values[3]).text(),
                    $(values[4]).text(),
                    $(values[5]).text(),
                    $(values[6]).text(),
                    $(values[7]).text(),
                    $(values[8]).text(),
                    $(values[9]).text()
                ]))
                element = element.next()
            }
            resolve(xeroAccountTransactions)
        })
    })
}

(async () => {
    console.log(await htmlToJson())
})()