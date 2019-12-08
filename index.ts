import { readFile } from 'fs'
import * as files from './files.json'
import { resolve } from 'url'

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

interface SantanderAccountTransaction {
    date: string
    description: string
    amount: string
    balance: string
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

export function htmlToJson(): Promise<XeroAccountTransaction[]> {
    return new Promise((resolve, reject) => {
        const file = (<any>files).file

        readFile(file, 'utf8', (error, data) => {
            const cheerio = require('cheerio')
            const $ = cheerio.load(data)
            const elements = $('tbody > tr')
            let element = elements.first()
            const xeroAccountTransactions: XeroAccountTransaction[] = [];

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

export function txtToJson(): Promise<SantanderAccountTransaction[]>{
    return new Promise<SantanderAccountTransaction[]>((resolve, reject) => {
        const file = (<any>files).file2

        readFile(file,'ascii', (err, data) => {
            const info =  data.split('\n\t\t\t\t\t\t\n')
            const elements = info.slice(1, info.length)

            resolve(elements.map((values => {
                const value = values.split('\n')

                const date = value[0].split(':')[1].trim()
                const description = value[1].split(':')[1].trim()
                const amount = value[2].split(':')[1].replace('\t', '').trim()
                const balance = value[3].split(':')[1].trim()

                return {
                    date: date,
                    description: description,
                    amount: amount,
                    balance: balance
                }
            })))
        })
    })
}

(async () => {
    console.log(await txtToJson())
})()