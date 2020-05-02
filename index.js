const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const SECRET_KEY = "SecretKey"

const app = express()
app.use(cors())
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database('./database/social-net')


//! ************* Login with JWT ********************
// Get token through login
app.post("/api/login", (req, res) => {
  if (!req.query || !req.query.username || !req.query.password) {
    res.json({ error: "No or wrong query parameter" });
  } else {
    let sqlQuery = "SELECT * FROM login WHERE login = ?";
    let params = req.query.username.toString();
    console.log("LOGIN: ", params);

    db.get(sqlQuery, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        console.log(err.message);
        return;
      } else if (req.query.password == row.password) {
        console.log(row);
        let message = {
          resultCode: 0,
          user_id: row.user_id,
          username: row.login,
          password: row.password,
          email: row.email,
          rememberMe: req.query.rememberMe,
        };

        jwt.sign({ message }, SECRET_KEY, (err, token) => {
          message.token = token;
          res.json(message);
          console.log(message);
        });
      }
    });
  }
});

app.delete('/logout', verifyToken, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, authData) => {
    if(err) {
      res.status(500).json({
        resultCode: 1,
        error: "Login first",
      })
    } else {
      let message = {
        resultCode: 0,
        username: authData.message.username,
        message: "Success logout",
        token: "",
      };
      res.json(message)
      console.log(message); 
    }
  })
})

// Example of object auth
let authMe = {
  resultCode: 0,
  messages: [],
  data: {
    id: 1,
    email: 'heyhey@bla.com',
    login: 'Anton'
  }
}
// Simple implementation of authentification
app.get('/auth/me', verifyToken, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, authData) => {
    if(err) {
      res.status(500).json({
        resultCode: 1,
        error: "I don't know you",
      })
    } else {
      console.log(authData.message)
      let message = {
        resultCode: 0,
        messages: "I know you!!!",
        data: {
          id: authData.message.user_id,
          email: authData.message.email,
          login: authData.message.username,
          password: authData.message.password,
        },
      };
      res.json(message)
      console.log(message); 
    }
  })
})

//! { expiresIn: "600s" }
app.post('/api/post', verifyToken, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, authData) => {
    if(err) {
      res.status(500).json({
        resultCode: 1,
        error: "Login first",
      })
    } else {
      let message = {
        resultCode: 0,
        username: authData.login,
        message: "Success logout",
      };
      res.json(message)
      console.log(message); 
    }
  })
})

//Verify token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ")
    const bearerToken = bearer[1]
    req.token = bearerToken
    next();
  } else {
    res.sendStatus(403)
    console.log("-------No token---------");
  }
}

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

  console.log('*----------------------------------------------*');
  console.log('Request query: ', req.query);
  pageSize = req.query.pageSize;
  currentPage = req.query.currentPage;

  let getPageFromArray = (arr, pageSize1 = 5, currentPage1 = 1, consoleON = true) => {
    let pageSize = pageSize1
    let currentPage = currentPage1
  
    let startPage = (pageSize * (currentPage - 1))
    let endPage = (pageSize * currentPage)
    let usersSlice = arr.slice(startPage, endPage)
  
    if (consoleON) {
      // console.log('*----------------------------------------------*');
      // console.log('Request query: ', req.query);
      console.log('Page Size: ', pageSize);
      console.log('Current page: ', currentPage);
      console.log('Start slice indx: ', startPage, 'End slice indx: ', endPage);
      //console.log('Total Users slice', usersSlice);
    }
    return usersSlice
  }

  let usersSlice = getPageFromArray(users.users, pageSize, currentPage)

  let usersToSend = {
    pageSize: pageSize,
    totalUsersCount: users.totalUsersCount,
    currentPage: currentPage,
    users: usersSlice,
  }
  res.json(usersToSend);
})

// http://localhost:5000/socialSL?person_id=5&pageLimit=1&currentPage=1
app.get('/socialSL', (req, res) => {
  let startPage = (req.query.pageSize * (req.query.currentPage - 1))
  let endPage = (req.query.pageSize * req.query.currentPage)
  let sqlQuery = "SELECT * FROM messages WHERE person_id = ? ORDER BY id LIMIT ?"
  let params = [req.query.person_id, req.query.pageLimit]
  console.log("params: ", params);
  //res.json(params)
  return  (
    db.all(sqlQuery, params, (err, row) => {
      if (err) {
        res.status(400).json({"err": err.message})
        console.log("Send: ",err.message);

      }
      else {
        res.json(row)
        console.log("Send: ",row);
      }
    })
  )
})

// http://localhost:5000/social?user_id=5
app.get('/social', (req, res) => {
  let userId = req.query.user_id
  let sqlQuery = `SELECT * FROM users WHERE user_id = ${userId}`
  return ( 
    db.all(sqlQuery, (err, row) => {
      res.json(row)
      console.log("Send: ",row);
    })
  )
})
// http://localhost:5000/social?user_id=5
app.get('/profile/:id', (req, res) => {
  let sqlQuery = "SELECT * FROM users WHERE user_id = ?"
  let params = [req.params.id]
  console.log("Profile id: ",params)
  db.get(sqlQuery, params, (err, row) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json(row)
  })
})


// https://localhost:5000/follow/2
app.post('/follow/:id', (req, res) => {
  let sqlQueryRUN = "UPDATE users SET followed = 1 WHERE user_id = ?"  
  let params = [req.params.id]
  console.log(params);
  
  db.run(sqlQueryRUN, params, function(err, result) {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    console.log(sqlQueryRUN);
    let message = {
      resultCode: 0,
      message: "success follow user",
      id: params, //this.lastID,
    }
    res.json(message)
    console.log(message);
  })
});
// http://localhost:5000/unfollow/2
app.delete('/unfollow/:id', (req, res) => {
  let sqlQueryRUN = "UPDATE users SET followed = 0 WHERE user_id = ?"  
  let params = [req.params.id]
  console.log(params);
  
  db.run(sqlQueryRUN, params, function(err, result) {
    if (err) {
      res.status(400).json({"error":err.message});
      console.log(err.message)
      return;
    }
    console.log(sqlQueryRUN);
    let message = {
      resultCode: 0,
      message: "success unfollow user",
      id: params,
      changes: this.changes,
    }
    res.json(message)
    console.log(message);
    
  })
});

//Simple parse of request
//http://localhost:5000/social/parse?name=test&email=test%40example.com&password=test123
app.get("/social/parse", (req, res) => {
  res.json(req.query)
})

//! getStatus
app.get('/status/:id', (req, res) => {
  console.log("GET")
  let sqlQuery = "SELECT status FROM users WHERE user_id = ?"
  let params = [req.params.id]
  console.log("Profile id: ",params)
  db.get(sqlQuery, params, (err, row) => {
    if (err) {
      res.status(400).json({"error":err.message});
      console.log(err.message)
      return;
    }
    console.log(sqlQuery);
    let message = {
      resultCode: 0,
      status: row,
      id: params,
    }
    res.json(message)
    console.log(message);
  })
})

//! putStatus (update)
app.put('/status/', (req, res) => {
  console.log("***PUT***", Date())
  // console.log("BODY", req.body);
  let sqlQueryRun = "UPDATE users SET status = ? WHERE user_id = 1"
  let params = [req.body.status]
  console.log("Profile id: ", params)
  db.run(sqlQueryRun, params, function(err, result) {
    if (err) {
      res.status(400).json({
        resultCode: 1,
        "error":err.message});
      console.log(err.message)
      return;
    }
    let message = {
      resultCode: 0,
      message: "PUT success",
      in_status: req.body.status,
    }
    res.json(message)
    console.log(message);
  })
})

//! Use datetime('now') to generate time stamp in messages
// Login form response
app.post('/login', (req, res) => {
  console.log("****POST****", Date());
  console.log(req.query);

  let loginMessage = {
    resultCode: 0,
    messages: [],
    data: {
      userId: 1
    }
  }
  res.json(loginMessage)
});

app.listen(5000, () => {
    console.log("Listening on http://localhost:5000")
})