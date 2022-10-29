const users = require('./users.js')

const locations = [
  {
    name: 'Hoodoo Ski Area',
    subscribers: [],
    gridpoints: 'PQR/127,46',
  },
  {
    name: 'Beaver Mountain Ski Area',
    subscribers: [],
    gridpoints: 'SLC/64,65',
  },
  {
    name: 'Powder Mountain',
    subscribers: [users.bnd_0, users.slc_0],
    gridpoints: 'SLC/107,202',
  },
  // {
  //   name: 'Big Bear Resort',
  //   subscribers: [],
  //   gridpoints: 'SGX/76,78',
  // },
  {
    name: 'Mt Bachelor',
    subscribers: [users.bnd_0, users.bnd_1],
    gridpoints: 'PDT/22,39',
  },
  // {
  //   name: 'Mt Hood Meadows',
  //   subscribers: [users.bnd_0, users.bnd_1],
  //   gridpoints: 'PQR/143,88',
  // },
  {
    name: 'Willamette Pass',
    subscribers: [users.bnd_0, users.eug_0],
    gridpoints: 'PQR/115,11',
  }
]

module.exports = locations