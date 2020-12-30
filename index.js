const snowReportController = require('./controller.js')

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
  }, 60 * 60000)
}

runAutomatedSnowReport()