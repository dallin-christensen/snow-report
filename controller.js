const fetch = require('node-fetch')
const smsTools = require('./smsTools.js')
const locations = require('./locations.js')
const testLocations = require('./testLocations.js')

const fetchForecast = async (location) => {
  const forecast = await fetch(`https://api.weather.gov/gridpoints/${location.gridpoints}/forecast`, {cache: "no-store"})
    .then(data => data.json())
    .catch(console.error)

  return forecast
}

const parseReport = (forecast, location) => {
  let report = `\n\n${location.name} Snow Report\n\n`
  let inchesOnlyReport = `\n\n${location.name} Snow Report\n\n`

  const trimToLastSentence = (str) => str.slice(str.lastIndexOf('.', str.length - 2) + 2, str.length)

  // if no periods given, send message
  if (!forecast.properties) {
    report = report + 'report crapped out... sorry. 😬'
    inchesOnlyReport = inchesOnlyReport + 'report crapped out... sorry. 😬'

    console.warn(`${location.name} crapped out...`)
    console.warn(JSON.stringify(forecast))

    return [report, inchesOnlyReport]
  }

  const snowPeriods = forecast.properties.periods
    .filter((period) => period.shortForecast.toLowerCase().includes('snow'))
    .filter((period) => period.detailedForecast.toLowerCase().includes('inches') || period.detailedForecast.toLowerCase().includes('inch'))
    .map((period) => {
      const temperaturePhrase = period.name.toLowerCase().includes('night')
        ? `Low around ${period.temperature}${period.temperatureUnit}.`
        : `High around ${period.temperature}${period.temperatureUnit}.`

      const appendedTempSentance = trimToLastSentence(period.detailedForecast).includes(period.temperature)
        ? ''
	      : temperaturePhrase
      
      return {
        ...period,
        message: `${period.name}: ${period.shortForecast}. ${trimToLastSentence(period.detailedForecast)} ${appendedTempSentance}`,
        inchesOnly: `${period.name}: ${trimToLastSentence(period.detailedForecast)}`,
      }
    })

  if (!snowPeriods.length) return ''

  snowPeriods.forEach((period) => {
    report = report + period.message + '\n\n'
  })

  snowPeriods.forEach((period) => {
    inchesOnlyReport = inchesOnlyReport + period.inchesOnly + '\n\n'
  })

  return [report, inchesOnlyReport]
}

const sendSms = (msgs, location) => {
  const [report, inchesOnlyReport] = msgs
  const onError = (err) => console.error(`error: ${err}`)

  location.subscribers.forEach((subscriber) => {
    const onSuccess = () => console.log(`Successfully sent ${location.name} snow report to ${subscriber.name}.`)
    smsTools.sendSms({
      body: subscriber.ff_inchesOnly ? inchesOnlyReport : report,
      to: subscriber.number,
      onSuccess,
      onError,
    })
  })
}

const snowReportController = async (type) => {
  // controller for application
  const locs = type === 'test' ? testLocations : locations

  locs.forEach(async (location) => {
    let forecast = await fetchForecast(location)
    
    // if failed, try again.
    if (!forecast.properties) {
      forecast = await fetchForecast(location)
    }

    const reportMsgs = parseReport(forecast, location)

    if (reportMsgs) {
      sendSms(reportMsgs, location)
    } else {
      const noSnowMsg = `no snow for ${location.name}`
      const noSnowReport = [noSnowMsg, noSnowMsg]
      sendSms(noSnowReport, location)
    }
  })
}

module.exports = snowReportController
