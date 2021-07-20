## Install

```
npm i --save sprite-builder
```


## Usage

Add your custom configuration to your `package.json` (in your application's root)

```js
"sprite": {
  "src": "./svg",
  "selector": "**/*.svg",
  "dist": "./dist"
}
```

Add scripts

```js
"scripts": {
  "sprite-builder": "sprite-builder"
}
```

Run
```js
npm run sprite-builder
```
