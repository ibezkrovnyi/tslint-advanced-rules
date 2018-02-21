# tslint-rules

currently it contains only one rule:

```json
{
  "no-inferrable-return-types": true
}
```

which is the same as [no-inferrable-types](https://palantir.github.io/tslint/rules/no-inferrable-types/), but for Return Types

## Supported
* function declarations
* function expressions
* arrow functions
* class methods (including static methods and generators)
* getter/setter (not tested)

# install

```
npm i -D @ibezkrovnyi/tslint-rules
```

and add to tslint.json
```json
"extends": [
    "tslint:recommended",
    "tslint-config-airbnb",
    "tslint-consistent-codestyle",
    "@ibezkrovnyi/tslint-rules"
],
"rules": {
  "no-inferrable-return-types": true
}
```

# example

```ts
function sum(a, b): number {
  return a + b;
}
```

may be safely replaced with
```ts
function sum(a, b) {
  return a + b;
}
```

# fix
`tslint --fix` is available
