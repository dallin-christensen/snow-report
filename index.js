const snowReportController = require('./controller.js')

const MINUTE_MS = 60000

const runAutomatedSnowReport = () => {

  const ifNineRunReport = () => {
    if (new Date().getHours() === 9) {
      console.log('running report, stand by.')
      snowReportController()
    } else {
      console.log('not 9am yo.')
    }
  }

  ifNineRunReport()

  setInterval(() => {
    ifNineRunReport()
  }, 60 * MINUTE_MS)
}

const startApp = () => {
  const watchForTopOfHour = setInterval(() => {
    if (new Date().getMinutes() === 0) {
      clearInterval(watchForTopOfHour)
      runAutomatedSnowReport()
    }
    console.log('interval')
  }, MINUTE_MS)
}

startApp()