# Enum-typings

This package converts generated enum definitions from
```
export declare enum Animal {
    CAT = 'cat',
    DOG = 'dog',
}
```
To
```
export declare const enum Animal {
    CAT = 'cat',
    DOG = 'dog',
}
```
Using the command
```
enum-typings
```

This will scan the whole directory for .d.ts files containing an enum declaration. The node_modules folder will be excluded of course.
