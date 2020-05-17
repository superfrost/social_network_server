const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
var jwtexp = require('express-jwt');

const SECRET_KEY = "SecretKey"

const app = express()
app.use(cors())
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database('./database/social-net')

app.use(
  jwtexp({
    secret: SECRET_KEY,
    credentialsRequired: false,
    getToken: function fromHeader(req) {
      if (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer" &&
        req.headers.authorization.split(" ")[1]
      ) {
        return req.headers.authorization.split(" ")[1];
      } else {
        console.log("invalid or no token!");
        return "Error"
      };
    }
  }).unless({path: ['/login']})
)

app.use(function (err, req, res, next) {
  if(err) {
    let {name, message, code, status} = err
    res.status(401).send({
      resultCode: 1,
      error: name,
      message,
      code,
      status,
    })
  }
});

app.get("/auth2/me", (req, res) => {
  console.log(req.user)
  if(req.user) {
  let message = {
    resultCode: 0,
    message: "I know you!!!",
    data: {
      id: req.user.message.user_id,
      email: req.user.message.email,
      login: req.user.message.login,
      password: req.user.message.password,
    },
  };
  res.json(message)
  console.log(message); 
  }
})

//! ************* Login with JWT ********************
// Get token through login. You can use { expiresIn: "600s" }
app.post("/login", (req, res) => {
  console.log("Login Query: ", req.query)
  if (!req.query || !req.query.login || !req.query.password) {
    res.status(400).json({ 
      resultCode: 1,
      error: "No or wrong query parameter" 
    })
  } else {
    let sqlQuery = "SELECT * FROM login WHERE login = ?";
    let login = req.query.login.toString();
    let password = req.query.password.toString()
    console.log("LOGIN: ", login, "Password: ", password);

    db.get(sqlQuery, login, (err, row) => {
      console.log("SQL response: ", row);
      if (err) {
        res.status(500).json({ //500 Internal Server Error
          resultCode: 1,
          error: err.message });
        console.log(err.message);
        return;
      } 
      else if (!row || (password !== row.password.toString())) {
        let message = {
          resultCode: 1,
          data: {},
          error: "Wrong Login or Password",
        };
        console.log(message);
        res.status(401).json(message); //Status code Unauthorized
      }
      else if (password === row.password.toString()) {
        console.log("SQL answer: ", row);
        let message = {
          resultCode: 0,
          data: {
            userId: row.user_id
          },
          user_id: row.user_id,
          login: row.login,
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

//! ********** LogOut **************
app.delete('/logout', verifyToken, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, authData) => {
    if(err) {
      res.status(401).json({ //Unauthorized
        resultCode: 1,
        error: "You must Login first",
      })
    } else {
      let message = {
        resultCode: 0,
        login: authData.message.login,
        message: "Success logout",
        token: "",
      };
      res.json(message)
      console.log(message); 
    }
  })
})

//? Example of object auth
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
//! ********* Autentificate Me ************
app.get('/auth/me', verifyToken, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, authData) => {
    if(err) {
      res.status(401).json({
        resultCode: 1,
        error: "I don't know you",
        data: {
          id: null,
          email: null,
          login: null,
          password: null,
        },
      })
    } else {
      console.log(authData.message)
      let message = {
        resultCode: 0,
        messages: "I know you!!!",
        data: {
          id: authData.message.user_id,
          email: authData.message.email,
          login: authData.message.login,
          password: authData.message.password,
        },
      };
      res.json(message)
      console.log(message); 
    }
  })
})

//Function to Verify token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ")
    const bearerToken = bearer[1]
    req.token = bearerToken
    next();
  } else {
    console.log("-------No token---------");
    //next();
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
      console.log('Page Size: ', pageSize);
      console.log('Current page: ', currentPage);
      console.log('Start slice indx: ', startPage, 'End slice indx: ', endPage);
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
      id: params,
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
    }
    res.json(message)
    console.log(message);
    
  })
});

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
  console.log("**********PUT**********")
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

//! Get User Posts
app.get("/posts/:id", (req, res) => {
  console.log("***GET Posts***")
  let user_id = req.params.id
  if (!user_id)  {    
    return res.status(401).json({
      resultCode: 1, 
      error: "No or wrong user ID"})}
    let sqlQuery = "SELECT * FROM posts WHERE person_id = ?"
    db.all(sqlQuery, user_id, (err, result) => {
      if (err) {
        res.status(400).json({
          resultCode: 1,
          "error":err.message});
        console.log(err.message)
        return;
      }
      let message = {
        resultCode: 0,
        message: "OK here is your Posts",
        posts: result,
      }
      res.json(message)
      console.log(message);
    })
})

//! Add new Post
app.post("/posts", (req, res) => {
  if (req.user.message.user_id.toString() === req.body.user_id.toString()) {
    console.log("***********ADD POST**********");
    db.serialize(() => {
      let params = [req.user.message.user_id, req.body.post];
      let sqlQueryRun = "INSERT INTO posts (person_id, date, message) VALUES (?, datetime('now'), ?)";
      db.run(sqlQueryRun, params, function (err) {
        if (err) {
          res.status(400).json({
            resultCode: 1,
            error: err.message,
          });
          console.log(err.message);
          return;
        }
        console.log("Last changed ID: ", this.lastID);
        let lastId = this.lastID;
        db.get("SELECT * FROM posts WHERE id = ?", lastId, (err, row) => {
          if (err) {
            res.status(400).json({
              resultCode: 1,
              error: err.message,
            });
            console.log(err.message);
            return;
          }
          let message = {
            resultCode: 0,
            message: "OK here is your Posts",
            data: row,
          };
          res.json(message);
          console.log(message);
        });
      })
    });
  }
});

//! get friends
app.post("/friends", (req, res) => {
  console.log("**********FRIENDS*************")
  let params = req.body.friends
  console.log("params: ", params);
  
  let sqlQuery = `SELECT * FROM users WHERE user_id IN (${params})`
  console.log("sqlQuery: ", sqlQuery);

  db.all(sqlQuery, (err, row) => {
    if(err) {
      return res.status(400).json({
        resultCode: 1, 
        error: err.message})
    }
    let message = {
      resultCode: 0,
      message: "OK here is your Friends",
      data: row,
    };
    res.json(message);
    console.log(message);
  })
})

app.listen(5000, () => {
    console.log("Listening on http://localhost:5000")
})