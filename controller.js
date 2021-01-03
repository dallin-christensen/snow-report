const fetch = require('node-fetch')
const smsTools = require('./smsTools.js')
const locations = require('./locations.js')
const testLocations = require('./testLocations.js')

const fetchForecast = async (location) => {
  const forecast = await fetch(`https://api.weather.gov/gridpoints/${location.gridpoints}/forecast`)
    .then(data => data.json())
    .catch(console.error)

  return forecast
}

const parseReport = (forecast, location) => {
  let report = `\n\n${location.name} Snow Report\n\n`

  const trimToLastSentence = (str) => str.slice(str.lastIndexOf('.', str.length - 2) + 2, str.length)

  const snowPeriods = forecast.properties.periods
    .filter((period) => period.shortForecast.toLowerCase().includes('snow'))
    //.filter((period) => period.detailedForecast.toLowerCase().includes('inches'))
    //.filter((period) => !period.detailedForecast.toLowerCase().includes('new snow accumulation of less than one inch possible.'))
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
      }
    })

  if (!snowPeriods.length) return ''

  snowPeriods.forEach((period) => {
    report = report + period.message + '\n\n'
  })

  return report
}

const sendSms = (msg, location) => {
  const onError = (err) => console.error(`error: ${err}`)

  location.subscribers.forEach((subscriberNumber) => {
    const onSuccess = () => console.log(`Successfully sent ${location.name} snow report to ${subscriberNumber}.`)
    smsTools.sendSms({
      body: msg,
      to: subscriberNumber,
      onSuccess,
      onError,
    })
  })
}

const snowReportController = async (type) => {
  // controller for application
  const locs = type === 'test' ? testLocations : locations

  locs.forEach(async (location) => {
    const forecast = await fetchForecast(location)

    const reportMsg = parseReport(forecast, location)

    if (reportMsg) {
      sendSms(reportMsg, location)
    } else {
      console.log(`no snow for ${location.name}.`)
    }
  })
}

module.exports = snowReportController
