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
    let bp = fs.readFileSync('node_modules/factorio-analytics/factory/examples/smallbasev2.txt', 'utf8');

    let t = new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp,

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 108000,

        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 60,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 60,

        // how many ticks between circ data polls (Each circuit network, and the signals on it)
        circInterval: 60,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 60,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 60,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    });

    // run trial
    await Factory.runTrial(t);
    let data = t.data;

    // get iron plates produced
    let ironPlatesProduced = data.get({
        category: 'item',
        label: 'iron-plate',
        spec: 'prod'
    });
    // get copper plates produced
    let copperPlatesProduced = data.get({
        category: 'item',
        label: 'copper-plate',
        spec: 'prod'
    });
    // get stone bricks produced
    let stoneBricksProduced = data.get({
        category: 'item',
        label: 'stone-brick',
        spec: 'prod'
    });
    // get electricty used (MW)
    let electricityUsed = data.get({
        category: 'electric',
        label: 'all',
        spec: 'cons',
        scale: 1000000,
        radix: 2
    });

    // create chart
    await ChartFactory.generate({
        chartTitle: 'Smallbasev2 Trial Run',
        filepath: 'charts/exampleA.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: ironPlatesProduced,
            color: '#0030e1',
            width: 3,
            smooth: 5,
            legend: 'Iron Plates Produced'
        },
        {
            dataset: copperPlatesProduced,
            color: '#c52100',
            width: 3,
            smooth: 5,
            legend: 'Copper Plates Produced'
        },
        {
            dataset: stoneBricksProduced,
            color: '#9d00a6',
            width: 3,
            smooth: 5,
            legend: 'Stone Bricks Produced'
        },
        {
            dataset: electricityUsed,
            color: '#00a600',
            width: 3,
            smooth: 5,
            legend: 'Electricity Used (MW)'
        }
    ])

    console.log('Done!');

}).catch((e) => {
    console.error(e);
})
