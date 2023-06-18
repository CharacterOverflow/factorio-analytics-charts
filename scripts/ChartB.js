"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChartFactory_1 = require("../src/ChartFactory");
const fs = __importStar(require("fs"));
const factorio_analytics_1 = require("factorio-analytics");
require('dotenv').config();
factorio_analytics_1.Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(() => __awaiter(void 0, void 0, void 0, function* () {
    // Read file with blueprint string
    let bp1 = fs.readFileSync('data/blueprints/steam_coal_basicinserters.bp', 'utf8');
    let bp2 = fs.readFileSync('data/blueprints/steam_coal_fastinserters.bp', 'utf8');
    let t1 = new factorio_analytics_1.Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp: bp1,
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
    let t2 = new factorio_analytics_1.Trial({
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
    // run trials
    yield factorio_analytics_1.Factory.runTrial(t1);
    yield factorio_analytics_1.Factory.runTrial(t2);
    let powerUsedv1 = t1.data.get({
        category: 'electric',
        label: 'inserter',
        spec: 'cons',
        scale: 1000,
    });
    let powerUsedv2 = t2.data.get({
        category: 'electric',
        label: 'fast-inserter',
        spec: 'cons',
        scale: 1000,
    });
    // Grab the ratio of power produced (kw) vs coal items consumed
    let ratioPowerVsCoalv1 = t1.data.get({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    }).per({
        category: 'item',
        label: 'coal',
        spec: 'cons',
    });
    let ratioPowerVsCoalv2 = t2.data.get({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    }).per({
        category: 'item',
        label: 'coal',
        spec: 'cons',
    });
    let ratioInserterUsedPerProducedMwv1 = t1.data.get({
        category: 'electric',
        label: 'inserter',
        spec: 'cons',
        scale: 1000000,
        radix: 2
    }).per({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    });
    let ratioInserterUsedPerProducedMwv2 = t2.data.get({
        category: 'electric',
        label: 'fast-inserter',
        spec: 'cons',
        scale: 1000000,
        radix: 2
    }).per({
        category: 'electric',
        label: 'all',
        spec: 'prod',
        scale: 1000000,
        radix: 2
    });
    // create chart
    yield ChartFactory_1.ChartFactory.generate({
        chartTitle: 'Comparisons of Inserter Arms in Steam Power Plants',
        filepath: 'charts/exampleB.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: powerUsedv1,
            color: '#cb00da',
            width: 5,
            smooth: 25,
            dashes: [5, 5],
            legend: 'Power Used (kw) for basic inserters (1)'
        },
        {
            dataset: powerUsedv2,
            color: '#da0000',
            width: 5,
            smooth: 25,
            dashes: [5, 5],
            legend: 'Power Used (kw) for fast inserters (2)'
        },
        {
            dataset: ratioPowerVsCoalv1,
            color: '#dad600',
            width: 3,
            smooth: 25,
            legend: 'Power Produced (mw) per coal consumed'
        },
        {
            dataset: ratioPowerVsCoalv2,
            color: '#001dda',
            width: 3,
            smooth: 25,
            legend: 'Power Produced (mw) per coal consumed'
        },
    ]);
    console.log('Done!');
})).catch((e) => {
    console.error(e);
});
//# sourceMappingURL=ChartB.js.map