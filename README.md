# Chapi

Chapi is Express server for Node.js which enables CRUD operations over MongoDB.


## Development server
Run `npm run start` for a dev server. Navigate to `http://localhost:5000/${APP_PREFIX}/:database/:collection`.

Run `npm run start-watch` for a dev server. Navigate to `http://localhost:5000/${APP_PREFIX}/:database/:collection`.
The app will automatically reload if you change any of the source files.

## Running unit tests

Run `npm run test` to execute the unit tests via [Supertest](https://github.com/visionmedia/supertest).

## Select documents
| Param         | Description                                                 | Query example                                                  |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| filter        | Allows you to specify conditions on the documents           | GET `/app/database1/colleaction1?filter={"qty":{"$gt":50}}` HTTP/1.1 |
| page          | Allows you to select which page should be returned          | GET `/app/database1/colleaction1?page=2` HTTP/1.1 |
| pagesize      | Allows you to control the number of documents to return     | GET `/app/database1/colleaction1?pagesize=20` HTTP/1.1 |
| sort          | Allows you to specify sort condition                        | GET `/app/database1/colleaction1?sort={"field": 1}` HTTP/1.1 |
| keys          | Allows you to specify the inclusion/exclusion of fields     | GET `/app/database1/colleaction1?keys={'item':1}&keys={'status':1}`HTTP/1.1 |
| hint          | Allows you to override MongoDB’s query optimization process | GET `/app/database1/colleaction1?hint={'item':1}` HTTP/1.1 |

## Environment variables

When running this application supports next process.env variables located in server/config/config.json file:

- `MONGO_URI`: MongoDB connection URI used to connect to a MongoDB.
- `MONGO_DATABASE`: MongoDB database used.
- `DEFAULT_PAGESIZE`: Pagesize returned by HTTP/HTTPS requests.
- `MAX_PAGESIZE`: Max pagesize returned by HTTP/HTTPS requests.
- `DEFAULT_PAGENUM`: Number of pages returned by HTTP/HTTPS requests.
- `DEFAULT_FILTER`: The filter query parameter.
- `DEFAULT_SORT`: The sort query parameter.
- `DEFAULT_KEYS`: The keys query parameter.
- `DEFAULT_HINT`: The hint query parameter.
