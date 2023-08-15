# Kronos

## To install extension:

1. Pull latest version.
2. Run `npm install` to install dependencies and npm run build to create a build distribution in /build.
3. In Chrome's extension page, toggle 'Developer Mode'.
4. Select 'Load Unpacked' and select the /build folder.
5. Include `GENERATE_SOURCEMAP=false` in your `.env`.

## On any changes, to rebuild:

1. run `npm run build'.
2. Refresh Kronos in the extension panel

## To Start the Server:

1. cd into the /server folder and add .env file inside the folder.
2. Run `npm install` to install dependencies
3. run `node index.js` or `npx nodemon` to start the server.
4. server is running when "Server listening on 3001" is showing in the terminal.

## To add access to a particular Google Calendar API endpoint

Update public/mainfest.json with the necessary scope:

```
{
  "oauth2": {
    "scopes": [
      "https://your_scope_here.com"
    ]
  }
}
```
