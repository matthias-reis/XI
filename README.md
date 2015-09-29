XI JS Framework
==============

## step 1 :: loader

the loader is a minimal setup of an AMD module loading facility in one small file - nothing else
 
## step 2 :: initial routing
 
analyses the route and retrieves a first state

## store

the store object holds the current state as a simple object

- `get` always retrieves the whole store object
- `set` is called by a registered modifyer