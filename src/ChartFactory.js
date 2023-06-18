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
exports.ChartFactory = void 0;
const factorio_analytics_1 = require("factorio-analytics");
const promises_1 = require("fs/promises");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class ChartFactory extends factorio_analytics_1.Factory {
    static generate(config, data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            factorio_analytics_1.Logging.log('info', { message: `Generating chart at ${config.filepath}...`, config: config });
            let configuration = {
                type: 'line',
                data: {
                    datasets: []
                },
                options: {
                    layout: {
                        padding: {
                            left: 60,
                            bottom: 60
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                font: {
                                    size: 30
                                },
                                filter: item => item.text !== 'none'
                            }
                        },
                        title: {
                            font: {
                                size: 40
                            },
                            display: true,
                            text: config.chartTitle,
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Ticks (60 per second)',
                                font: {
                                    size: 30
                                }
                            },
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                font: {
                                    size: 20
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Item Count',
                                font: {
                                    size: 30
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.53)',
                                drawTicks: false,
                            },
                            ticks: {
                                font: (context) => {
                                    var _a, _b;
                                    return ({
                                        size: ((_a = context.tick) === null || _a === void 0 ? void 0 : _a.value) === 0 ? 30 : 20,
                                        weight: ((_b = context.tick) === null || _b === void 0 ? void 0 : _b.value) === 0 ? 'bold' : undefined
                                    });
                                },
                                callback: (value) => {
                                    return value;
                                }
                            }
                        },
                    },
                },
                plugins: [{
                        id: 'customCanvasBackgroundColor',
                        beforeDraw: (chart, args, options) => {
                            const { ctx } = chart;
                            ctx.save();
                            ctx.globalCompositeOperation = 'destination-over';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, chart.width, chart.height);
                            ctx.restore();
                        }
                    }]
            };
            for (let dataset of data) {
                // Set variables not defined, if needed
                if (dataset.color == null) {
                    dataset.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                }
                if (!dataset.dataset.values || ((_a = dataset.dataset.values) === null || _a === void 0 ? void 0 : _a.length) == 0) {
                    dataset.dataset.load();
                }
                // Now... go about actually adding the config
                // we want anything 'consuming' to be negative, and production to be positive (if possible)
                // if the 'spec' is 'cons', we will invert the values before plotting.
                if (dataset.dataset.specifier == 'cons') {
                    configuration.data.datasets.push({
                        label: dataset.legend ? dataset.legend : dataset.dataset.label,
                        data: ChartFactory.smoothData(dataset.dataset.values.map((d) => {
                            return { x: d.tick, y: -1 * d.value };
                        }), dataset.smooth),
                        showLine: true,
                        fill: !!dataset.fillColor,
                        backgroundColor: dataset.fillColor ? dataset.fillColor : `rgb(255, 255, 255)`,
                        borderColor: `${dataset.color}`,
                        borderWidth: dataset.width ? dataset.width : 2,
                        borderDash: dataset.dashes ? dataset.dashes : undefined,
                        pointRadius: 0,
                        tension: dataset.tension ? dataset.tension : .1,
                        spanGaps: true
                    });
                }
                else {
                    configuration.data.datasets.push({
                        label: dataset.legend ? dataset.legend : dataset.dataset.label,
                        data: ChartFactory.smoothData(dataset.dataset.values.map((d) => {
                            return { x: d.tick, y: d.value };
                        }), dataset.smooth),
                        showLine: true,
                        fill: !!dataset.fillColor,
                        backgroundColor: dataset.fillColor ? dataset.fillColor : `rgb(255, 255, 255)`,
                        borderColor: `${dataset.color}`,
                        borderWidth: dataset.width ? dataset.width : 2,
                        borderDash: dataset.dashes ? dataset.dashes : undefined,
                        pointRadius: 0,
                        tension: dataset.tension ? dataset.tension : .1,
                        spanGaps: true
                    });
                }
            }
            // Now, we need to actually generate the chart
            // define all needed components for the overall chart before begin looping
            const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
                width: config.xSize ? config.xSize : 1920,
                height: config.ySize ? config.ySize : 1080
            });
            factorio_analytics_1.Logging.log('info', `Rendering chart ${config.filepath} to ${config.filepath}...`);
            // Make sure the folder this is going into exists, recursively!
            yield fs.mkdir(path.dirname(config.filepath), { recursive: true });
            const imageBuffer = yield chartJSNodeCanvas.renderToBuffer(configuration);
            yield (0, promises_1.writeFile)(config.filepath, imageBuffer);
            factorio_analytics_1.Logging.log('info', `Chart ${config.chartTitle} generated!`);
            return config.filepath;
        });
    }
    /**
        static generateChartComponents(config: IChartConfig, datasets: IChartDataConfig[]) {
            Logging.log('info', {message: `Generating chart at ${config.filepath}...`, config: config});
            /*
            * For each config, there are new data sources and trials to include in this. So, this is basically the old 'GeneerateChart' function,
            * but inside of an outer for loop before generating the final chart.
            *
            * Needs to build the datasets, along with modify configuration based on their needs
            *
            let configuration: ChartConfiguration = {
                type: 'line',
                data: {
                    datasets: []
                },
                options: {
                    layout: {
                        padding: {
                            left: 60,
                            bottom: 60
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                font: {
                                    size: 30
                                },
                                filter: item => item.text !== 'none'
                            }
                        },
                        title: {
                            font: {
                                size: 40
                            },
                            display: true,
                            text: config.chartTitle,
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Ticks (60 per second)',
                                font: {
                                    size: 30
                                }
                            },
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                font: {
                                    size: 20
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Item Count',
                                font: {
                                    size: 30
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.53)',
                                drawTicks: false,
                            },
                            ticks: {
                                font: (context) => ({
                                    size: context.tick?.value === 0 ? 30 : 20,
                                    weight: context.tick?.value === 0 ? 'bold' : undefined
                                }),
                                callback: (value) => {
                                    return value
                                }
                            }
                        },
                    },
                },
                plugins: [{
                    id: 'customCanvasBackgroundColor',
                    beforeDraw: (chart, args, options) => {
                        const {ctx} = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                    }
                }]
            }
    
            for (let dataset of datasets) {
                for (let item of dataset.items) {
                    // load needed data
                    let data = dataset.data.get(item);
    
                    // Set variables not defined, if needed
                    if (item.color == null) {
                        item.color = `hsl(${Math.random() * 360}, 100%, 50%)`
                    }
    
                    // We first need to determine if this is an ITEM in game, or a FIELD from performance data.
                    if (item.name == 'tick' || item.name == 'timestamp' || item.name == 'wholeUpdate' || item.name == 'latencyUpdate' ||
                        item.name == 'gameUpdate' || item.name == 'circuitNetworkUpdate' || item.name == 'transportLinesUpdate' ||
                        item.name == 'fluidsUpdate' || item.name == 'heatManagerUpdate' || item.name == 'entityUpdate' ||
                        item.name == 'particleUpdate' || item.name == 'mapGenerator' || item.name == 'mapGeneratorBasicTilesSupportCompute' ||
                        item.name == 'mapGeneratorBasicTilesSupportApply' || item.name == 'mapGeneratorCorrectedTilesPrepare' ||
                        item.name == 'mapGeneratorCorrectedTilesCompute' || item.name == 'mapGeneratorCorrectedTilesApply' ||
                        item.name == 'mapGeneratorVariations' || item.name == 'mapGeneratorEntitiesPrepare' ||
                        item.name == 'mapGeneratorEntitiesCompute' || item.name == 'mapGeneratorEntitiesApply' ||
                        item.name == 'crcComputation' || item.name == 'electricNetworkUpdate' || item.name == 'logisticManagerUpdate' ||
                        item.name == 'constructionManagerUpdate' || item.name == 'pathFinder' || item.name == 'trains' ||
                        item.name == 'trainPathFinder' || item.name == 'commander' || item.name == 'chartRefresh' ||
                        item.name == 'luaGarbageIncremental' || item.name == 'luaGarbageIncremental' || item.name == 'chartUpdate' ||
                        item.name == 'scriptUpdate') {
    
                        // We only define the y2 axis if it is needed for performance data
                        if (!configuration.options.scales['y2']) {
                            configuration.options.scales['y2'] = {
                                title: {
                                    display: true,
                                    text: 'ms per tick interval',
                                    font: {
                                        size: 30
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20
                                    }
                                }
                            }
                        }
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(dataset.trial.data.unifiedData.map((d) => {
                                return {x: d.tick, y: d[item.name]}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderDash: item.dashes ? item.dashes : undefined,
                            borderWidth: item.width ? item.width : 2,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            yAxisID: 'y2'
                        })
    
                    } else if (item.set == 'cons+prod') {
                        // If we want both consumption and production, there are 2 datasets. But we will only show 1 label!
                        // the 'consumption' dataset is by default negative
                        configuration.data.datasets.push({
                            label: `none`,
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.prod > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.prod}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
    
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.cons > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.cons != 0 ? d.cons * -1 : 0}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else if (item.set == 'cons') {
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.cons > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.cons != 0 ? d.cons * -1 : 0}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else if (item.set == 'prod') {
                        // it doesn't matter what value 'prod' is - if useCons is false and we hit this, it means that produced needs to be used
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.prod > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.prod}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else
                        throw new Error('Invalid set type for chart item. Must be "cons", "prod", or "cons+prod"');
                }
            }
    
            return configuration;
    
        }
    */
    // multiple configs are provided so that we can generate multiple charts overlaying each other
    static smoothData(data, smooth) {
        let smoothedData = [];
        if (smooth >= 1 && data.length >= smooth) {
            for (let i = 0; i < data.length - smooth + 1; i++) {
                const windowData = data.slice(i, i + smooth);
                const sum = windowData.reduce((acc, cur) => acc + cur.y, 0);
                const average = sum / smooth;
                smoothedData.push({
                    x: data[i + Math.floor(smooth / 2)].x,
                    y: average
                });
            }
            factorio_analytics_1.Logging.log('verbose', `Smoothed ${data.length} down to ${smoothedData.length}`);
        }
        else
            smoothedData = data;
        return smoothedData;
    }
}
exports.ChartFactory = ChartFactory;
//# sourceMappingURL=ChartFactory.js.map