const fetch = require('node-fetch')
const smsTools = require('./smsTools.js')
const locations = require('./locations.js')

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
    .filter((period) => period.detailedForecast.toLowerCase().includes('inches'))
    .filter((period) => !period.detailedForecast.toLowerCase().includes('new snow accumulation of less than one inch possible.'))
    .map((period) => {
      return {
        ...period,
        message: `${period.name}: ${period.shortForecast}. ${trimToLastSentence(period.detailedForecast)} ${period.temperature}${period.temperatureUnit}.`,
      }
    })

  if (!snowPeriods.length) return ''

  snowPeriods.forEach((period) => {
    report = report + period.message + '\n\n'
  })

  return report
}

const sendSms = (msg, subscribers) => {
  const onSuccess = () => console.log('successfully sent sms message.')
  const onError = (err) => console.error(`error: ${err}`)

  subscribers.forEach((subscriberNumber) => {
    smsTools.sendSms({
      body: msg,
      to: subscriberNumber,
      onSuccess,
      onError,
    })
  })
}

const snowReportController = async () => {
  // controller for application

  locations.forEach(async (location) => {
    const forecast = await fetchForecast(location)

    const reportMsg = parseReport(forecast, location)

    if (reportMsg) {
      sendSms(reportMsg, location.subscribers)
    } else {
      console.log(`no snow for ${location.name}.`)
    }
  })
}

module.exports = snowReportController