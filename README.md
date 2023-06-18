# factorio-analytics-charts
A library that uses factorio-analytics to generate quick and easy charts of your datasets

### Recommended Setup

- Requirements as needed for https://github.com/CharacterOverflow/factorio-analytics
- Place any blueprint files you want to use in data/blueprints

## Getting Started

### Usage
This package is intended to be used with NodeJS, for server use only.

### Download from Github, extract into folder

Use git clone, or otherwise download the zip and extract it manually. Either way, open commandline to the extracted folder

### Install

```
$ cd factorio-analytics-charts

npm install

npm install -g typescript
```

### Make your own script

From here, you can now create new files in scripts/ to write the needed code to generate your chart.

Copy an existing scripts/*.ts file and change variables if anything, it doesn't have to be complex! You can even use notepad or vim if you wanted to.

Once you have a file written that you want to run, continue

### Run your script

```
tsc

node scripts/<YourScriptName>.js
```

### Check out your chart!
By default I save all charts in /charts, but that may change depending on how your script functions. Have fun coding, and don't forget to actually play the game too :D
