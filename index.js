/*
MIT License

Copyright (c) 2020 David Barton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

const puppeteer = require('puppeteer')
const fs = require('fs')

const aggregate = async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const top = fs.readFileSync(__dirname + '/markupTop.template', 'utf-8')
  const bottom = fs.readFileSync(__dirname + '/markupBottom.template', 'utf-8')
  const 〱 = '<div class="col-auto col-lg-6">'
  const 〳 = '</div>'
  const weatherHeader = '<h2>Weather ⛅</h2>'
  const newsHeader = '<h2>News 🗽</h2>'
  const funHeader = '<h2>Fun 🤪</h2>'

  // idokep
  const idokepMarkupFn = async p => {
    try {
      await p.goto('https://www.idokep.hu/elorejelzes/Budapest', { waitUntil: 'domcontentloaded' })
      try {
        await p.waitForSelector('button', { timeout: 5000, visible: true })
        const acceptIdokep = await p.$$('button')
        await acceptIdokep[1].click()
      } catch (e) {
        console.log('no cmp')
      }
      const idokep = await p.$('.aloldal-elorejelzes')
      await idokep.screenshot({ path: __dirname + '/idokep.png' })
      const idokepBase64 = fs.readFileSync(__dirname + '/idokep.png', 'base64')
      await p.close()
      return (
        〱 +
        weatherHeader +
        `<img src="data:image/png;base64,${idokepBase64}" class="img-fluid mx-auto d-block" alt="idokep" />` +
        〳
      )
    } catch (e) {
      console.error(e)
      return ''
    }
  }
  // idokep - felhokep
  const felhokepMarkupFn = async p => {
    try {
      await p.goto('https://www.idokep.hu/felhokep', { waitUntil: 'load' })
      try {
        await p.waitForSelector('button', { timeout: 5000, visible: true })
        const acceptIdokep = await p.$$('button')
        await acceptIdokep[1].click()
      } catch (e) {
        console.log('no cmp')
      }
      const idokep = await p.$('#terkep-box')
      await idokep.screenshot({ path: __dirname + '/felhokep.png' })
      const idokepBase64 = fs.readFileSync(__dirname + '/felhokep.png', 'base64')
      await p.close()
      return 〱 + `<img src="data:image/png;base64,${idokepBase64}" class="img-fluid mx-auto d-block" alt="fk" />` + 〳
    } catch (e) {
      console.error(e)
      await p.close()
      return ''
    }
  }
  // pbf - comics
  const pbfMarkupFn = async p => {
    try {
      await p.goto('https://pbfcomics.com/', { waitUntil: 'domcontentloaded' })
      const pbf = await p.$$eval('#comic > img', imgs => imgs[0].src)
      await p.close()
      return 〱 + funHeader + `<img src="${pbf}" class="img-fluid mx-auto d-block" alt="pbf" />` + 〳
    } catch (e) {
      console.error(e)
      await p.close()
      return ''
    }
  }
  // telex
  const telexMarkupFn = async p => {
    try {
      await p.goto('https://telex.hu/', { waitUntil: 'domcontentloaded' })
      const telex = await p.$eval('section', el => el.innerHTML)
      await p.close()
      return 〱 + newsHeader + telex + 〳
    } catch (e) {
      console.error(e)
      await p.close()
      return ''
    }
  }

  const [idokepMarkup, felhokepMarkup, pbfMarkup, telexMarkup] = await Promise.all([
    idokepMarkupFn(await browser.newPage()),
    felhokepMarkupFn(await browser.newPage()),
    pbfMarkupFn(await browser.newPage()),
    telexMarkupFn(await browser.newPage())
  ])
  await browser.close()
  const html = top + idokepMarkup + felhokepMarkup + pbfMarkup + telexMarkup + bottom
  console.log('html saved')
  return html
}

module.exports = aggregate
