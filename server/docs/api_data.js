define({ "api": [
  {
    "type": "post",
    "url": "/login",
    "title": "login",
    "group": "auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Your username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Your password (Note: If you build your own client, please use encryption when transmitting the credentials)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "auth",
    "name": "PostLogin"
  },
  {
    "type": "post",
    "url": "/logout",
    "title": "logout",
    "group": "auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "session_id",
            "description": "<p>Your session id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "auth",
    "name": "PostLogout"
  },
  {
    "type": "post",
    "url": "/register",
    "title": "register",
    "group": "auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Your username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Your password</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "auth",
    "name": "PostRegister"
  },
  {
    "type": "get",
    "url": "/",
    "title": "root",
    "group": "main",
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "Get"
  },
  {
    "type": "get",
    "url": "/measurements/:station",
    "title": "getMeasurements",
    "group": "main",
    "description": "<p>All measurements of a specified station in a specified timespan and grouped by a specified time interval</p>",
    "parameter": {
      "fields": {
        "URL-Parameters": [
          {
            "group": "URL-Parameters",
            "type": "Number",
            "optional": false,
            "field": "station",
            "description": "<p>The station's id</p>"
          }
        ],
        "Query-Parameters": [
          {
            "group": "Query-Parameters",
            "type": "Date",
            "optional": false,
            "field": "from",
            "description": "<p>The start of the selected timespan</p>"
          },
          {
            "group": "Query-Parameters",
            "type": "Date",
            "optional": false,
            "field": "until",
            "description": "<p>The end of the selected timespan</p>"
          },
          {
            "group": "Query-Parameters",
            "type": "Number",
            "optional": false,
            "field": "interval",
            "description": "<p>The grouping interval in seconds</p>"
          },
          {
            "group": "Query-Parameters",
            "type": "String",
            "optional": false,
            "field": "format",
            "description": "<p>The format in which the response is served. Supported alternative formats: csv</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "GetMeasurementsStation"
  },
  {
    "type": "get",
    "url": "/measurementsOld/:station",
    "title": "getMeasurementsOld",
    "group": "main",
    "description": "<p>Get all measurements of a specified station</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "station",
            "description": "<p>The station's id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "GetMeasurementsoldStation"
  },
  {
    "type": "get",
    "url": "/stations",
    "title": "getStations",
    "group": "main",
    "description": "<p>Get all stations</p>",
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "GetStations"
  },
  {
    "type": "get",
    "url": "/types",
    "title": "getTypes",
    "group": "main",
    "description": "<p>Get all measurement-types</p>",
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "GetTypes"
  },
  {
    "type": "post",
    "url": "/stationAuthToken",
    "title": "getAuthToken",
    "group": "main",
    "description": "<p>Get the auth token of a specified station you own</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "session_id",
            "description": "<p>Your session_id</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "station",
            "description": "<p>The station's id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "main",
    "name": "PostStationauthtoken"
  },
  {
    "type": "post",
    "url": "/submitMeasurement",
    "title": "submitMeasurement",
    "group": "stations",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The station's auth token</p>"
          },
          {
            "group": "Parameter",
            "type": "Object[]",
            "optional": false,
            "field": "measurements",
            "description": "<p>The measurements</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "stations",
    "name": "PostSubmitmeasurement"
  },
  {
    "type": "post",
    "url": "/stats",
    "title": "getStats",
    "group": "user",
    "description": "<p>Gets the user's stats</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "session_id",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./lib/user-routes.js",
    "groupTitle": "user",
    "name": "PostStats"
  },
  {
    "type": "post",
    "url": "/user/info",
    "title": "info",
    "group": "user",
    "description": "<p>Returns the user object</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "session_id",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./lib/user-routes.js",
    "groupTitle": "user",
    "name": "PostUserInfo"
  },
  {
    "type": "post",
    "url": "/user/stations",
    "title": "userStations",
    "group": "user",
    "description": "<p>Returns the user's stations</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "session_id",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./lib/user-routes.js",
    "groupTitle": "user",
    "name": "PostUserStations"
  }
] });
