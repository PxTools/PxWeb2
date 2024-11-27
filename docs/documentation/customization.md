# Customization

PxWeb comes prebuilt with configuration for tables in English.
This documents describes how to add more languages in both PxWeb and PxWebApi.
Language codes are [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) (two letters).

## PxWeb

After installation there is as folder called `public` which contain files that
can be changed.

```sh
public
├── config
│   └── config.js
├── locales
│   ├── ar
│   │   └── translation.json
│   ├── en
│   │   └── translation.json
│   ├── no
│   │   └── translation.json
│   └── sv
│       └── translation.json
└── theme
    └── variables.css
```

### config.js

``` javascript
window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: "en", languageName: "English" },
      { shorthand: "zz", languageName: "Your Language" },
    ],
    defaultLanguage: "en",
    fallbackLanguage: "en",
  },
  apiUrl: "..."
};
```

### translation.json

Create a new folder and `translation.json` file using english as a template.

``` json
{
  "meta": {
    "languageName": "English",
    "shorthand": "en"
  },
  "common": {
    "title": "Welcome to PxWeb 2.0",
    "header": {
      "title": "PxWeb 2.0 [Main]",
      "logo": "PxWeb 2.0"
    }
...
}
```

### variables.css

The css file will let you adjust colors to match you site profile.

``` css
:root {
  --px-border-radius-none: 0;
  --px-border-radius-xxsmall: 0.5px;
  --px-border-radius-xsmall: 2px;
  --px-border-radius-small: 4px;
  --px-border-radius-medium: 8px;
  --px-border-radius-large: 16px;
  --px-border-radius-xlarge: 24px;
  --px-border-radius-full: 9999px;
  --px-color-background-default: #FFFFFF;
  --px-color-background-subtle: #F0F8F9;
...
```

## PxWebApi

``` sh
PxWeb
├── appsettings.Development.json
├── appsettings.Release.json
├── appsettings.json
├── SqlDb.config
```

### appsettings.json

Your can have several [appsettings](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
configs. The [docker](docker.md) example runs i Development mode and use most
values from `appsettings.json`. There are currently only two places you need to
add more languages

``` json
...
  "PxApiConfiguration": {
    "Languages": [
      { "Id": "en", "Label": "English" }
    ],
    "DefaultLanguage": "en",
    "MaxDataCells": 10000,
    "SourceReferences": [
      {
        "Language": "en",
        "Text": "Source: Statistics Sweden"
      }
    ]
...
```

### SqlDb.config

Curently it is exactly as in PxWeb 2023

``` xml
<?xml version="1.0" encoding="iso-8859-1"?>
<SqlDbConfig version="2008"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="SqlDbConfig.xsd">
  <Database id="<ID>" metaModel="2.4">
...
```

But you have to change `appsettings.json` to use CNMM like this

``` json
{
  "DataSource": {
    "DataSourceType": "CNMM",
    "CNMM": {
      "DatabaseID": "<ID>"
    }
```
