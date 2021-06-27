## Intro

In this document I will try to explain the technical challenge details with all the endpoints created and how they work. This README file is for the API of the React code challenge

## 1. Configure

The first thing that needs to be done is configure the `.env` file in order to work with the environment variables. For this, I set up a `.env.dist` file where you can see which variables need to be created. There are the following ones:

- GRAB_A_PHONE_API_KEY: This won't be necessary to configure, as this was created in order to download phone information from the API in [http://grabaphone.herokuapp.com/](http://grabaphone.herokuapp.com/).
- SLONIK_URL: This key needs to be set up in order to connect to the PostgreSQL DB where the phone data will be stored. The credentials for this (user, password, db name, port) can be found in the docker compose env file, which you should configure in order to be secure.

After this first set up, you can run the `build.sh` script in order to launch the build of the project. This script will create the docker container with the DB, start and populate it with the data gathered from the aforementioned API.

Here is the in depth explanation of the `build.sh` script:

1. Docker compose: This will use the `docker-compose.yaml` file in order to create 2 containers: one with the PostgreSQL DB using the 5432 port and the other one with and Adminer management tool in order to interact with the DB (if necessary) on port 8080. Because of this, the DB environment variables set up in the previous step need to match the values in the docker compose `env` file, in order to avoid authentication issues.
2. Run `npm i` to install all necessary dependencies.
3. Data seeds: This is launched using `npm run db:up` command, which will trigger the DB tables creation and will insert the phones data into the correspondent table.

Then, you should run the `start.sh` script which will start the server and the API.

If everything goes as expected, you should be able to start using the endpoints.

## 2. Gather phones data

When I first thought about how to get the data in order to have it seeded in the DB at start I came up with two options:

1. Create the data manually myself, with only some minimal information of the phones.
2. Create the data programmatically using any kind of API or data on the web.

As this is a technical test, I opted for the second one! For this, I searched online and I found [http://grabaphone.herokuapp.com/](http://grabaphone.herokuapp.com/), which is a phone DB with an API you can easily use. In order to work with this API, I first called the endpoint to get all the manufactureres and then I created the file `getPhonesByManufacturer.js`, which connects to the API and uses those manufacturers to gather each phones and store them in the `/phones` folder, each of them in a `.json` file.

This data is the one used to populate the DB.

## 3. Project structure and libraries used

![phonesTree.png](phonesTree.png)

As you can see in the previous image, I've used a rather simple structure which I'll explain next:

- Inside the `scripts` folder you will find every script used to either gather the data (`getBooks.ts`) or to interact with the DB (create the tables, insert data or drop the tables). `seeds.ts` script is the one that recollects all the previous ones and is called when running the `start.sh` script.
- Inside the `seeds` folder there is just a file containing the array with the books that will go into the DB.
- The `src` folder contains the app itself. It's divided as follows:
  - In the root `app.ts` which is used to configure the Express application, `index.ts` in order to import that app and launch it and `types.ts` which defines the non default types I've created.
  - In the `config` folder you will find the DB configuration and passport configuration, which creates the local strategy in order for users to register, login and logout of the application.
  - In `constants` folder I've set up the `itemsPerPage` constant, so I can use it in different routes.
  - In the `middlewares` folder I've created an `auth.ts` file which creates two middlewares for the routes: `isAuthenticated` to check if a user is logged in and `isAdmin` to check just that, if the user is and admin or not.
  - Lastly, the `routes` folder contains the actual routes of the app, having and `index.ts` which gathers all the routes and exports them to be used in the app configuration. Inside each file you will find the routes for the endpoint which name the file (i.e.: inside `favorites.ts` file contains the `/favorites/` endpoints)

Regarding libraries, I have used:

- Express in order to create the server.
- Bcrypt in order to create a hash of the user password before inserting it to the DB.
- Cookie-session to create the user's cookies.
- Dotenv so I could use the environment variables.
- Morgan as a logger.
- Node-fetch for the `getBooks.ts` script, so I could fetch data from the ISBN DB API.
- Passport and passport-local for the authentication (passport-local is the strategy I've chosen, to use email and password).
- Pg to work with the PostgreSQL DB.
- Nodemon as dev-dependency to work with the server so it restarts every time I saved changes.
- Types of all the previous libraries as dev-dependencies in order to work properly with TypeScript.

All this information can be seen in the `package.json` file.

## 4. DB architecture

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f0736737-3749-4a26-b7b5-f7fd1d8a4a87/DB.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f0736737-3749-4a26-b7b5-f7fd1d8a4a87/DB.png)

As can be seen in the above image, the architecture of the DB is the following:

- For Books table I had to maintain what I received from the ISBN DB API, which made the decision easy, as I kept all the fields as rows. The only thing I thought was to make the title and ISBN as not nullables, for two reasons: first, to have some data to save to the DB and second (for the ISBN) because I will use that value in order to search for a book when deleting books or adding/removing to a users favorites collection. This is because ISBN is a unique value of the books, and when searched should only return one DB row.
- For Users I kept it simple and I decided to have only three fields: email and password in order to register/login a user and `isadmin`, which will return `true` if the user is the first one to register in the application and `false` otherwise, as stated in the requirements. Bear in mind the password is not stored as plain text but hashed using [bcrypt](https://www.npmjs.com/package/bcrypt).
- Favorites table entries are created using the book_id and the user_id as foreign keys.

## 5. Stop and remove environment

When finished, in order to remove the data from the DB and the Docker containers used in the demo, you just need to run the `stop.sh` script, which will trigger the following:

1. Data drop: Using the `npm run drop` which will use the `drops.js` script in order to drop all the tables in the DB.
2. Docker removal: Using the `docker-compose down` command, which will remove all the containers used.
3. Dist folder removal: `rm -rf dist/ ./node_modules` in order to remove dist and node_modules folders.

## 6. Endpoints

I've configured a postman json file named `Simetia.postman_collection.json` in case you want to import the collection to postman, which will make easier to have all endpoints configured as expected. Even though, I will explain all the endpoints next. If you have set up a different port in the environmental variables and will use the postman collection, please, ensure you update the port variable in there as well to avoid issued.

All the endpoints URLs start with `http://localhost:{{PORT}}/`

### GET /ping

This endpoint has the only purpose to test the server, and will return the following response if ok:

```json
{
  "success": true,
  "data": "pong"
}
```

### GET /books/all?page=<num>

Unprotected endpoint that will return the data of all the books in the DB, paginated with 10 books at a time. It returns the next page among the data or `null` if there is no next page, as follows:

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "title": "Years In Snooker: 1960 In Snooker, 1964 In Snooker, 1968 In Snooker, 1972 In Snooker, 1975 In Snooker, 1976 In Snooker, 1977 In Snooker",
      "image": "https://images.isbndb.com/covers/60/82/9781158016082.jpg",
      "title_long": "Years-in-snooker",
      "date_published": "2010",
      "publisher": null,
      "authors": "{\"Group\",\"Books\",\"LLC\"}",
      "isbn13": "9781158016082",
      "binding": "Paperback",
      "isbn": "1158016085"
    },
    "..."
  ],
  "nextPage": 2
}
```

### POST /auth/register

This endpoint is the first one related with authentication. This will create a user in the DB, using the architecture previously explained and will return the following:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "fernando@test.com",
    "isadmin": true
  }
}
```

In order to pass the user information, you will need to provide a JSON body with two fields: `email` and `password`:

```json
{
  "email": "fernando@test.com",
  "password": "12354"
}
```

### POST /auth/login

This endpoint will allow a user to login in the application in order to be able to use the protected endpoints. The response is the same as the register endpoint, returning the user information minus the password field.

```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "fernando2@test.com",
    "isadmin": false
  }
}
```

To pass the user info to the endpoint, you will need to use the same JSON format as in the register endpoint.

If the user does not exist in the DB, the response would throw a `404` error:

```json
{
  "success": false,
  "data": "User does not exists"
}
```

And if the password is incorrect, a `403` error:

```json
{
  "success": false,
  "data": "Incorret email or password"
}
```

### POST /auth/logout

This endpoint will remove all the cookies in the application and will logout the user, so won't be able to use the protected endpoint until next login. Response:

```json
{
  "success": true,
  "data": "Logged out"
}
```

### POST /books/add/

This endpoint will receive a JSON body with the book information as follows:

```json
{
  "title": "Explain the Cloud Like I'm 10",
  "date_published": "2015",
  "authors": ["Tood Hoff"],
  "isbn": "1234567890"
}
```

If the `isbn` field is not in the body, the endpoint will return a `400` error, as follows:

```json
{
  "success": false,
  "info": {
    "message": "ISBN is mandatory"
  }
}
```

Also, if the user is not the admin, you'll receive a `401` Unauthorized error:

```json
{
  "success": false,
  "info": {
    "message": "Unauthorized"
  }
}
```

### DELETE /books/remove/:isbn

This endpoint will receive the `isbn` of the book as a query parameter (as is unique for every book) and will use it in order to remove that book from the DB. If ok, the response will be empty with a `204` code, which means there is no content to return as it has been removed. As the endpoint can be used only by admins, in case there is no user logged in or that user is not and admin, it will throw a `401` error:

```json
{
  "success": false,
  "info": {
    "message": "Unauthorized"
  }
}
```

### POST /favorites/add/:isbn

The endpoint will get the `isbn` from the URL parameters and will get the book ID. It will use that ID alongside the user ID to create a new entry in the favorites table, using those 2 IDs as foreign keys. If ok, the response will include the book title, with `201` code to state the row has been created in the DB:

```json
{
  "success": true,
  "data": {
    "title": "Snooker"
  }
}
```

As protected endpoint, a `401` code will be returned if no user is logged:

```json
{
  "success": false,
  "info": {
    "message": "Unauthorized"
  }
}
```

### DELETE /favorites/remove/:isbn

The endpoint will get the `isbn` from the URL parameters and will get the book ID. It will use that ID alongside the user ID to remove the correct entry in the favorites table. If ok, the response will be empty with a `204` code, which means there is no content to return as it has been removed. As the endpoint is protected, in case there is no user logged in, it will throw a `401` error:

```json
{
  "success": false,
  "info": {
    "message": "Unauthorized"
  }
}
```

### GET /favorites/all?page=<num>

Extra endpoint to gather all user's favorites. Protected endpoint which will return a `401` error if not logged in. If everything goes fine, it will return the title, authors and date_published of the user's favorites books. This endpoint is paginated, so it will return maximum 10 books and the next page, if any:

```json
{
  "sucess": true,
  "count": 2,
  "data": [
    {
      "title": "Snooker",
      "authors": "{\"Williams\",\"Ken\"}",
      "date_published": "2006"
    },
    {
      "title": "Explain the Cloud Like I'm 10",
      "authors": "{\"Tood Hoff\"}",
      "date_published": "2015"
    }
  ],
  "nextPage": null
}
```

### GET /users/all

Extra endpoint to list all users within the application. This endpoint is admin protected, this way only the admin can list the users. If ok, it will return a response like:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "email": "fernando@test.com",
      "isadmin": true
    }
  ]
}
```

If user is not admin, it will throw a `401` error
