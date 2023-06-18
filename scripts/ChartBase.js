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
    let t1 = new factorio_analytics_1.Trial({
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
    // run trials
    yield factorio_analytics_1.Factory.runTrial(t1);
    // get data
    const ironPlates = t1.data.get({
        category: 'item',
        label: 'iron-plate',
        spec: 'prod',
        radix: 1,
    });
    const copperPlates = t1.data.get({
        category: 'item',
        label: 'copper-plate',
        spec: 'prod',
        radix: 1,
    });
    const redScience = t1.data.get({
        category: 'item',
        label: 'automation-science-pack',
        spec: 'prod',
        radix: 1,
    });
    const greenScience = t1.data.get({
        category: 'item',
        label: 'logistic-science-pack',
        spec: 'prod',
        radix: 2,
    });
    const blueScience = t1.data.get({
        category: 'item',
        label: 'chemical-science-pack',
        spec: 'prod',
        radix: 2,
    });
    const greyScience = t1.data.get({
        category: 'item',
        label: 'military-science-pack',
        spec: 'prod',
        radix: 2,
    });
    const purpleScience = t1.data.get({
        category: 'item',
        label: 'production-science-pack',
        spec: 'prod',
        radix: 2
    });
    const yellowScience = t1.data.get({
        category: 'item',
        label: 'utility-science-pack',
        spec: 'prod',
        radix: 2,
    });
    // create chart
    yield ChartFactory_1.ChartFactory.generate({
        chartTitle: '45 SPM Base Compact',
        filepath: 'charts/45spm_base.png',
        xSize: 4096,
        ySize: 2160
    }, [
        {
            dataset: redScience,
            color: '#fa0000',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Red Science'
        }, {
            dataset: greenScience,
            color: '#00ff00',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Green Science'
        }, {
            dataset: blueScience,
            color: '#0000ff',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Blue Science'
        }, {
            dataset: greyScience,
            color: '#51c7b9',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Grey Science'
        }, {
            dataset: purpleScience,
            color: '#ff00ff',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Purple Science'
        },
        {
            dataset: yellowScience,
            color: '#ffff00',
            width: 2,
            smooth: 50,
            tension: 0.7,
            legend: 'Yellow Science'
        }
    ]);
    console.log('Done!');
})).catch((e) => {
    console.error(e);
});
//# sourceMappingURL=ChartBase.js.map