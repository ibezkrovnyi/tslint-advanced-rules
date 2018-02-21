# tslint-rules

currently it contains only one rule:

```json
{
  "no-inferrable-return-types": true
}
```

which is the same as [no-inferrable-types](https://palantir.github.io/tslint/rules/no-inferrable-types/), but for Return Types

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
