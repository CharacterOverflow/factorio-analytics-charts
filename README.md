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


### An example...

After discovering my superpower of automated blueprint testing, I decided to give myself a little field test to see exactly how snobby I could be with it.

_No longer would I be fooled by blueprints online 'claiming' to produce a certain amount of SPM, only to be disappointed in game_

With these tools, I could effectively plot data and state with absolute certainty that the Blueprint in question did not live up to the claims stated online.

I set out to hunt for a blueprint to criticize, frothing at the mouth and ready to screech **WELL TEKNICLYY** over their claims

### The first test

I first found a rather compact and sexy looking 45 SPM Base [Blueprint](https://factorioblueprints.tech/blueprint/36c781c4-7084-4783-bc4d-4243530fd625)

I downloaded the blueprint into a file, and set up the trial with the following code:
```ts
    let t1 = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: fs.readFileSync('data/blueprints/45base_nostop.bp', 'utf8'),

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 216000,

        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 3600,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 3600,

        // how many ticks between circuit data polls
        circInterval: 3600,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 3600,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    });
```

You can see the rest of the steps on Github, but the resulting chart looked something like this:

![45 SPM Chart Image](https://raw.githubusercontent.com/CharacterOverflow/factorio-analytics-charts/2596d2cf0350821c2058f773c48c16bc9e6cae86/charts/45spm_base.png)

*AHAHHH!!! PROOF! This blueprint can hit 45 SPM on Red and Green science, but only gets about 30 SPM with Grey! Blue, Purple, and Yellow are all also under-producing*

I felt giddy with power! But why focus on the negativity of how a blueprint has shortcomings? Because even if it falls short, that blueprint ***LOOKS SO NICE***, and provided some chests for 'mall' usage.

I wanted to find another blueprint that was actually accurate, and prove how good it is instead

### The second test

Next, I found a massive 1200 SPM factory that was already set up with infinity chests and the works - a perfect test! [Blueprint](https://factorioblueprints.tech/blueprint/0bbc20a5-81bb-45f7-a884-dcea8787680e)

I downloaded this blueprint into a file as well, and set up the trial with similar settings as the first one

![1200 SPM Chart Image](https://raw.githubusercontent.com/CharacterOverflow/factorio-analytics-charts/main/charts/1200spm_base.png)

This blueprint, on the other hand, ran beautifully! Although less of a real-world test with using infinity chests everywhere instead of off a main bus, I'll allow it for this test. It also demonstrates
that modules work as intended in these trials as well.

We can see from this test that Purple science (followed closely by Yellow and Red) produce at a rate of roughly 1300 SPM once ramped up.

Meanwhile, Green, Blue, and Grey science produce at a rate of roughly 1200 SPM - only Blue science falls *ever so slightly* under the 1200SPM mark. I'd argue that it's within reason of the claimed 1200 SPM goal 
