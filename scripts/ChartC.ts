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
    let bp2 = fs.readFileSync('data/blueprints/js_v2.bp', 'utf8');
    let bp3 = fs.readFileSync('data/blueprints/js_v3.bp', 'utf8');

    let t2 = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: bp2,

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
    let t3 = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: bp3,

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
    await Factory.runTrial(t2);
    await Factory.runTrial(t3);

    let redSciencev2 = t2.data.get({
        category: 'item',
        label: 'automation-science-pack',
        spec: 'prod'
    });
    let redSciencev3 = t3.data.get({
        category: 'item',
        label: 'automation-science-pack',
        spec: 'prod'
    });
    let greenSciencev2 = t2.data.get({
        category: 'item',
        label: 'logistic-science-pack',
        spec: 'prod'
    });
    let greenSciencev3 = t3.data.get({
        category: 'item',
        label: 'logistic-science-pack',
        spec: 'prod'
    });
    let greySciencev2 = t2.data.get({
        category: 'item',
        label: 'military-science-pack',
        spec: 'prod'
    });
    let greySciencev3 = t3.data.get({
        category: 'item',
        label: 'military-science-pack',
        spec: 'prod'
    });

    // get the production rates of iron/copper as well - those matter, along with coal consumption rate

    // create chart
    await ChartFactory.generate({
        chartTitle: 'Comparison - Starter Base V2 to V3',
        filepath: 'charts/exampleC.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: redSciencev2,
            color: '#6b0000',
            width: 5,
            smooth: 50,
            tension: 0.4,
            legend: 'Red Science Produced (v2)'
        },
        {
            dataset: redSciencev3,
            color: '#da0000',
            width: 2,
            smooth: 50,
            tension: 0.4,
            legend: 'Red Science Produced (v3)'
        },
        {
            dataset: greenSciencev2,
            color: '#006b00',
            width: 5,
            smooth: 50,
            tension: 0.4,
            legend: 'Green Science Produced (v2)'
        },
        {
            dataset: greenSciencev3,
            color: '#00da00',
            width: 2,
            smooth: 50,
            tension: 0.4,
            legend: 'Green Science Produced (v3)'
        },
        {
            dataset: greySciencev2,
            color: '#580e5d',
            width: 5,
            smooth: 50,
            tension: 0.4,
            legend: 'Grey Science Produced (v2)'
        },
        {
            dataset: greySciencev3,
            color: '#b518d5',
            width: 2,
            smooth: 50,
            tension: 0.4,
            legend: 'Grey Science Produced (v3)'
        }
    ])

    console.log('Done!');

}).catch((e) => {
    console.error(e);
})
