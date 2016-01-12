# JLMSG

Or __Jekyll Like Minimal Static site Generator__ built with NodeJS.
This is not a drop-in replacement for Jekyll, but this can be nice starting
point to make your own port of Jekyll with just the features you need.

## Installation

You need NodeJS and Npm to run this program.

```
npm i --save chigur/jlmsg
```

## Usage

So you want to use this, great!. Go read the code and have a look at the
`example` directory.

## Features

1. Generates pages from data
2. Handles `layout` attribute in pages
3. Handles markdown documents

## Why?

Jekyll is awesome but it doesn't support creating pages purely from data
out of the box and I don't know Ruby to hack it so I wrote my own site generator
with only the features I needed. I think the logic I've written for handling
layouts is kindda neat worthy of publishing and also this project can show
that sometimes re-inventing the wheel can not only be fun but simple.
