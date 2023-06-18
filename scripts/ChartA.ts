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
        itemInterval: 300,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 30,

        // how many ticks between circ data polls (Each circuit network, and the signals on it)
        circInterval: 300,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 900,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    });

    // run trial
    await Factory.runTrial(t);
    let data = t.data;

    // inserter power consumed vs ALL consumed
    let ratioInserterPowerVsAll = data
        .get({category: 'electric', label: 'inserter', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // Assembnler-2 power consumed vs ALL consumed
    let ratioAssembler2PowerVsAll = data
        .get({category: 'electric', label: 'assembling-machine-2', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // Assembnler-2 power consumed vs ALL consumed
    let ratioRefineryPowerVsAll = data
        .get({category: 'electric', label: 'oil-refinery', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // create chart
    await ChartFactory.generate({
        chartTitle: 'Power Usage Ratios out of Total',
        filepath: 'charts/exampleA.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: ratioInserterPowerVsAll,
            color: '#d3750a',
            width: 3,
            smooth: 5,
            legend: 'Inserter Power vs All Power'
        },
        {
            dataset: ratioAssembler2PowerVsAll,
            color: '#0a6ed3',
            width: 3,
            smooth: 5,
            legend: 'Assembler-2 Power vs All Power'
        },
        {
            dataset: ratioRefineryPowerVsAll,
            color: '#d30a0a',
            width: 3,
            smooth: 5,
            legend: 'Refinery Power vs All Power'
        }
    ])

    console.log('Done!');

}).catch((e) => {
    console.error(e);
})
