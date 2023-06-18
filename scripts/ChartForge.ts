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
        bp: fs.readFileSync('data/blueprints/forge_a.bp', 'utf8'),

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 216000,

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
        bp: fs.readFileSync('data/blueprints/forge_b.bp', 'utf8'),

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 216000,

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

    // get data
    const aForgeIronPlates = t1.data.get({
        category: 'item',
        label: 'iron-plate',
        spec: 'prod',
    });

    const bForgeIronPlates = t2.data.get({
        category: 'item',
        label: 'iron-plate',
        spec: 'prod',
    });

    // get power usage for each
    const aForgePower = t1.data.get({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    });

    const bForgePower = t2.data.get({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    });

    // ratio of iron plates produced per megawatt used
    const aForgeRatio = aForgeIronPlates.per(aForgePower);

    // get the production rates of iron/copper as well - those matter, along with coal consumption rate
    const bForgeRatio = bForgeIronPlates.per(bForgePower);

    // create chart
    await ChartFactory.generate({
        chartTitle: 'Comparison - Forge A Vs Forge B',
        filepath: 'charts/forgeVS.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: aForgeIronPlates,
            color: '#0057fa',
            width: 2,
            smooth: 5,
            tension: 0.4,
            legend: 'Iron Plates (Forge A)'
        },
        {
            dataset: bForgeIronPlates,
            color: '#00338d',
            width: 2,
            smooth: 5,
            tension: 0.4,
            dashes: [5, 15],
            legend: 'Iron Plates (Forge B)'
        },
        {
            dataset: aForgePower,
            color: '#00ff00',
            width: 5,
            smooth: 25,
            tension: 0.4,
            legend: 'Electric Production (MW) (Forge A)',
        },
        {
            dataset: bForgePower,
            color: '#008d00',
            width: 5,
            smooth: 25,
            tension: 0.4,
            dashes: [5, 15],
            legend: 'Electric Production (MW) (Forge B)',
        }
    ])

    console.log('Done!');

}).catch((e) => {
    console.error(e);
})
