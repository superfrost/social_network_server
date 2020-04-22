const express = require('express')
const cors = require('cors')
// const bodyParser = require('body-parser')

const app = express()

app.use(cors())
app.use(express.json())
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(bodyParser.json())

users = {
  users: [
    {id: 1, name: 'Anton', followed: true, status: 'Boss', location: {city: 'Moscow', country: 'Russia'}, avatarSrc: 'https://www.famousbirthdays.com/faces/clooney-george-image.jpg'},
    {id: 2, name: 'Lera', followed: true, status: 'Life', location: {city: 'Moscow', country: 'Russia'}, avatarSrc: 'https://www.famousbirthdays.com/headshots/zoe-saldana-5.jpg'},
    {id: 3, name: 'Andrew', followed: true, status: 'Like', location: {city: 'New-York', country: 'USA'}, avatarSrc: 'https://www.famousbirthdays.com/faces/dicaprio-l-image.jpg'},
    {id: 4, name: 'Nick', followed: false, status: 'Love', location: {city: 'LA', country: 'USA'}, avatarSrc: 'https://www.famousbirthdays.com/headshots/ben-stiller-4.jpg'},
    {id: 5, name: 'John', followed: false, status: 'Boss', location: {city: 'San-Fran', country: 'USA'}, avatarSrc: 'https://www.famousbirthdays.com/faces/banks-tyra-image.jpg'},
    {id: 6, name: 'Larry', followed: true, status: "Hi I'm here", location: {city: 'Moscow', country: 'Russia'}, avatarSrc: null},
    {id: 7, name: 'Olga', followed: false, status: 'Boss', location: {city: 'Moscow', country: 'Russia'}, avatarSrc: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.TUan193TV0tHkDV93-c8SAAAAA%26pid%3DApi&f=1'},
    {id: 8, name: 'Tom', followed: true, status: 'Education', location: {city: 'New-York', country: 'USA'}, avatarSrc: 'https://www.famousbirthdays.com/faces/eckhart-aaron-image.jpg'},
    {id: 9, name: 'Terry', followed: false, status: 'Road', location: {city: 'LA', country: 'USA'}, avatarSrc: 'https://assets.rbl.ms/13475112/980x.jpg'},
    {id: 10, name: 'Kate', followed: true, status: 'Big world', location: {city: 'San-Fran', country: 'USA'}, avatarSrc: 'https://www.famousbirthdays.com/headshots/morgan-fairchild-4.jpg'},
  ],
  pageSize: 4,
  totalUsersCount: 10,
  currentPage: 3,
}
// http://localhost:5000/users?pageSize=5&currentPage=1
app.get('/users', (req, res) => {
  let pageSize = 5;
  let currentPage = 1;
  for (const key in req.query) {
    req.query.pageSize
    };
  
  pageSize = req.query.pageSize;
  currentPage = req.query.currentPage;
  
  console.log('*----------------------------------------------*');
  console.log('Request query: ', req.query);
  console.log('Page Size: ', pageSize);
  console.log('Cirrent page: ', currentPage);
  
  let startPage = (pageSize * (currentPage - 1));
  let endPage = (pageSize * currentPage);
  console.log('Start slice indx: ', startPage, 'End slice indx: ', endPage);
  let usersSlice = users.users.slice(startPage, endPage)

  console.log('Total Users slice', users.totalUsersCount);
  let usersToSend = {
    pageSize: pageSize,
    totalUsersCount: users.totalUsersCount,
    currentPage: currentPage,
    users: usersSlice,
  }
  res.json(usersToSend);
})

app.listen(5000, () => {
    console.log("Listening on http://localhost:5000")
})