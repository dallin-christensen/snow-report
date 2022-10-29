const snowReportController = require('./controller.js')

const MINUTE_MS = 60000

const runAutomatedSnowReport = () => {

  const ifCorrectTimeRunReport = () => {
    if (new Date().getHours() === 15) {
      console.log('running report, stand by.')
      snowReportController()
    } else {
      console.log('not 8am yo.')
    }
  }

  ifCorrectTimeRunReport()

  setInterval(() => {
    ifCorrectTimeRunReport()
  }, 60 * MINUTE_MS)
}

const startApp = () => {
  const watchForTopOfHour = setInterval(() => {
    console.log('awaiting top of hour')
    if (new Date().getMinutes() === 0) {
      clearInterval(watchForTopOfHour)
      runAutomatedSnowReport()
    }
  }, MINUTE_MS)
}

startApp()