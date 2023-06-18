import {ChartFactory} from "../src/ChartFactory";
import * as fs from "fs";
import {Factory, Trial} from "factorio-analytics";

require('dotenv').config();

Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(async () => {
    // Read file with blueprint string

    let t1 = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: fs.readFileSync('data/blueprints/yellow_v1.bp', 'utf8'),

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 108000,

        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 60,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 60,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 60,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    });
    let t2 = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: fs.readFileSync('data/blueprints/yellow_v2.bp', 'utf8'),

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 108000,

        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 60,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 60,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 60,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    })

    // run trials
    await Factory.runTrial(t1);
    await Factory.runTrial(t2);
/*
    let redSciencev1 = t1.data.get({
        category: 'item',
        label: 'automation-science-pack',
        spec: 'prod'
    });
    let redSciencev2 = t2.data.get({
        category: 'item',
        label: 'automation-science-pack',
        spec: 'prod'
    });
    let greenSciencev1 = t1.data.get({
        category: 'item',
        label: 'logistic-science-pack',
        spec: 'prod'
    });
    let greenSciencev2 = t2.data.get({
        category: 'item',
        label: 'logistic-science-pack',
        spec: 'prod'
    });
    let greySciencev1 = t1.data.get({
        category: 'item',
        label: 'military-science-pack',
        spec: 'prod'
    });
    let greySciencev2 = t2.data.get({
        category: 'item',
        label: 'military-science-pack',
        spec: 'prod'
    });
    let blueSciencev1 = t1.data.get({
        category: 'item',
        label: 'chemical-science-pack',
        spec: 'prod'
    });
    let blueSciencev2 = t2.data.get({
        category: 'item',
        label: 'chemical-science-pack',
        spec: 'prod'
    });
    let purpleSciencev1 = t1.data.get({
        category: 'item',
        label: 'production-science-pack',
        spec: 'prod'
    });
    let purpleSciencev2 = t2.data.get({
        category: 'item',
        label: 'production-science-pack',
        spec: 'prod'
    });

 */
    let yellowSciencev1 = t1.data.get({
        category: 'item',
        label: 'utility-science-pack',
        spec: 'prod',
        radix: 2
    });
    let yellowSciencev2 = t2.data.get({
        category: 'item',
        label: 'utility-science-pack',
        spec: 'prod',
        radix: 2
    });


    // get the production rates of iron/copper as well - those matter, along with coal consumption rate

    // create chart
    await ChartFactory.generate({
        chartTitle: 'Comparison - Yellow Tiling Designs V1 to V2',
        filepath: 'charts/exampleD.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: yellowSciencev1,
            color: '#fad800',
            width: 5,
            smooth: 100,
            tension: 0.4,
            legend: 'Yellow Science Produced (v1)'
        },
        {
            dataset: yellowSciencev2,
            color: '#7a6900',
            width: 2,
            smooth: 100,
            tension: 0.4,
            legend: 'Yellow Science Produced (v2)'
        },
    ])

    console.log('Done!');

}).catch((e) => {
    console.error(e);
})
